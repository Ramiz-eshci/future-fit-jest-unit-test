import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be13FormComponent } from './be13-form.component';

describe('Be13FormComponent', () => {
  let component: Be13FormComponent;
  let fixture: ComponentFixture<Be13FormComponent>;
  let fb: FormBuilder;

  const checkboxFields = [
    'clear_policy_commitment',
    'senior_official_responsible',
    'policy_communicated',
    'policy_in_hr_practices',
    'reporting_procedure_available',
    'actions_and_feedback_documented',
    'control_effectiveness_assessed',
    'controls_adjusted_if_needed',
  ];

  const mkInput = (year: number, relevance: number, flags: Record<string, boolean> = {}): FormGroup => {
    const base: any = {
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      fitnessnumber_of_employees: new FormControl(10),
      employee_fitness_percentage: new FormControl(null),
    };
    checkboxFields.forEach(field => { base[field] = new FormControl(flags[field] === true); });
    return new FormGroup(base);
  };

  const mkEmployee = (inputs: FormGroup[]): FormGroup =>
    new FormGroup({
      fitnessInputs: new FormArray(inputs),
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [Be13FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be13FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ employee: fb.array([]) });
    component.arrayName = 'employee';
    component.goal = {
      goal_code: 'BE13',
      goal_name: 'Human Rights',
      goal_short_name: 'HR',
      ProgressIndicators: [],
      ContextIndicators: [{ unit: 'No.' }],
    };
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the employee array under the configured arrayName', () => {
    const employee = component.parentForm.get('employee') as FormArray;
    employee.push(mkEmployee([mkInput(2024, 1, {})]));
    expect(component.formArray).toBe(employee);
    expect(component.employee.length).toBe(1);
  });

  it('computes a full fitness score when all four groups pass', () => {
    const allTrue: Record<string, boolean> = {};
    checkboxFields.forEach(field => { allTrue[field] = true; });
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, allTrue)])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('100%');
  });

  it('scores 25% when only the first policy group passes', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, { clear_policy_commitment: true, senior_official_responsible: true })])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('25%');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInputBe13({ relevance_id: 1 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('year')?.value).toBe(new Date().getFullYear());
  });

  it('reports complete data when every included input is relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, {})])
    );
    expect(component.calculateBE13DataCompleteness()).toBe('Calculation based on complete data');
  });
});