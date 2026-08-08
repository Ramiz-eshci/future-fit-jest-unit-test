import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be12FormComponent } from './be12-form.component';

describe('Be12FormComponent', () => {
  let component: Be12FormComponent;
  let fixture: ComponentFixture<Be12FormComponent>;
  let fb: FormBuilder;

  const mkInput = (year: number, relevance: number, flags: Record<string, boolean> = {}): FormGroup => {
    const base: any = {
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      fitnessnumber_of_employees: new FormControl(10),
      employee_fitness_percentage: new FormControl(null),
    };
    [
      'no_child_labour',
      'fair_employment_status',
      'freedom_of_association',
      'fair_working_hours',
      'overtime_compensation',
      'right_to_refuse_irregular_work',
      'reasonable_schedule_notice',
      'holiday_entitlement',
      'weekly_rest_day',
      'maternity_paternity_leave',
    ].forEach(field => { base[field] = new FormControl(flags[field] === true); });
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
      imports: [Be12FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be12FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ employee: fb.array([]) });
    component.arrayName = 'employee';
    component.goal = {
      goal_code: 'BE12',
      goal_name: 'Labour',
      goal_short_name: 'Lab',
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

  it('computes a full fitness score when every criterion is met', () => {
    const allTrue: Record<string, boolean> = {
      no_child_labour: true,
      fair_employment_status: true,
      freedom_of_association: true,
      fair_working_hours: true,
      overtime_compensation: true,
      right_to_refuse_irregular_work: true,
      reasonable_schedule_notice: true,
      holiday_entitlement: true,
      weekly_rest_day: true,
      maternity_paternity_leave: true,
    };
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, allTrue)])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('100%');
  });

  it('clears the fitness score when the input is not relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 2, {})])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInputBe12({ relevance_id: 1 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('year')?.value).toBe(new Date().getFullYear());
  });

  it('reports complete data when every included input is relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, {}), mkInput(2025, 1, {})])
    );
    expect(component.calculateBE12DataCompleteness()).toBe('Calculation based on complete data');
  });
});