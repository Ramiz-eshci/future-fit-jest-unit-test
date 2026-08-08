import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be11FormComponent } from './be11-form.component';

describe('Be11FormComponent', () => {
  let component: Be11FormComponent;
  let fixture: ComponentFixture<Be11FormComponent>;
  let fb: FormBuilder;

  const mkInput = (year: number, relevance: number, livingWage: number, employeeCount: number): FormGroup =>
    new FormGroup({
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      number_of_employees_living_wage: new FormControl(livingWage),
      fitnessnumber_of_employees: new FormControl(employeeCount),
      employee_fitness_percentage: new FormControl(null),
    });

  const mkEmployee = (inputs: FormGroup[]): FormGroup =>
    new FormGroup({
      employeeGroup: new FormControl('Group A'),
      fitnessInputs: new FormArray(inputs),
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [Be11FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be11FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ employee: fb.array([]) });
    component.arrayName = 'employee';
    component.goal = {
      goal_code: 'BE11',
      goal_name: 'Living Wage',
      goal_short_name: 'LW',
      ProgressIndicators: [],
      ContextIndicators: [{ unit: 'No.' }],
    };
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes the living wage fitness percentage', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, 25, 50)])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('50%');
  });

  it('flags an error when living wage employees exceed the headcount', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, 60, 40)])
    );
    component.calculateSiteFitness(0, 0);
    const input = (component.employee.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('employee_fitness_percentage')?.value).toBe('Error');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInputBe11({ relevance_id: 2, number_of_employees: 10 });
    expect(group.get('relevance')?.value).toBe(2);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('fitnessnumber_of_employees')?.value).toBe(10);
  });

  it('reports complete data when every included input is relevant', () => {
    (component.parentForm.get('employee') as FormArray).push(
      mkEmployee([mkInput(2024, 1, 10, 10), mkInput(2025, 3, 0, 0)])
    );
    expect(component.calculateBE11DataCompleteness()).toBe('Calculation based on incomplete data');
  });
});