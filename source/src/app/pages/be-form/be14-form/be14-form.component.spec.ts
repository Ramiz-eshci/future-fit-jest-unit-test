import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be14FormComponent } from './be14-form.component';

describe('Be14FormComponent', () => {
  let component: Be14FormComponent;
  let fixture: ComponentFixture<Be14FormComponent>;
  let fb: FormBuilder;

  const checkboxFields = [
    'design_involvement',
    'issue_scope_inclusive',
    'timely_resolution',
    'active_communication',
    'confidentiality_protection',
    'responsibility_assigned',
    'independent_advice_access',
    'full_information_during_process',
    'consulted_on_changes',
    'feedback_requested',
    'performance_monitored',
    'feedback_included_in_assessment',
    'improvements_implemented',
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
      imports: [Be14FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be14FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ employee: fb.array([]) });
    component.arrayName = 'employee';
    component.goal = {
      goal_code: 'BE14',
      goal_name: 'Grievances',
      goal_short_name: 'Grv',
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

  it('scores 100% when every criterion is met', () => {
    const allTrue: Record<string, boolean> = {};
    checkboxFields.forEach(f => { allTrue[f] = true; });
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, allTrue)])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('100%');
  });

  it('scores 30% when only the gateway criteria are met', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([
        mkInput(2024, 1, {
          design_involvement: true,
          issue_scope_inclusive: true,
          timely_resolution: true,
        }),
      ])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('30%');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInputBe14({ relevance_id: 1 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('year')?.value).toBe(new Date().getFullYear());
  });

  it('reports complete data when every included input is relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, {})])
    );
    expect(component.calculateBE14DataCompleteness()).toBe('Calculation based on complete data');
  });
});