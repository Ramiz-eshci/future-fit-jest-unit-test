import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be10FormComponent } from './be10-form.component';

describe('Be10FormComponent', () => {
  let component: Be10FormComponent;
  let fixture: ComponentFixture<Be10FormComponent>;
  let fb: FormBuilder;

  const mkInput = (year: number, relevance: number, employeeCount: number, fitness = '0%'): FormGroup =>
    new FormGroup({
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      fitnessnumber_of_employees: new FormControl(employeeCount),
      siteFitness: new FormControl(fitness),
    });

  const mkEmployee = (inputs: FormGroup[]): FormGroup =>
    new FormGroup({
      EmployeeNO: new FormControl(1),
      fitnessInputs: new FormArray(inputs),
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [Be10FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be10FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ employee: fb.array([]) });
    component.arrayName = 'employee';
    component.goal = {
      goal_code: 'BE10',
      goal_name: 'Employee',
      goal_short_name: 'Emp',
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
    employee.push(mkEmployee([mkInput(2024, 1, 10)]));
    expect(component.formArray).toBe(employee);
    expect(component.employee.length).toBe(1);
  });

  it('calculates the progress indicator weighted by employee count', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, 10, '80%'), mkInput(2024, 1, 20, '60%'), mkInput(2025, 1, 5, '100%')])
    );
    expect(component.calculateProgressIndicator(2024)).toBe('67%');
  });

  it('reports complete data when every included input for the year is relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, 5), mkInput(2024, 1, 5)])
    );
    expect(component.calculateDataCompleteness(2024)).toBe('Calculation based on complete data');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInputBe10({ relevance_id: 1, number_of_employees: 5 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('fitnessnumber_of_employees')?.value).toBe(5);
    expect(group.get('year')?.value).toBe(new Date().getFullYear());
  });
});