import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be20FormComponent } from './be20-form.component';

describe('Be20FormComponent', () => {
  let component: Be20FormComponent;
  let fixture: ComponentFixture<Be20FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE20',
      goal_name: 'Employee',
      goal_short_name: 'EF20',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'PI1' }],
      ContextIndicators: [{ context_indicator_id: 1, context_indicator: 'CI1', unit: 'employees' }],
    };
  }

  function buildEmployeeForm(allChecked: boolean): FormBuilder {
    const fb = new FormBuilder();
    const checkboxValues = {};
    ['hotspot_assessment', 'hotspot_Procedures', 'ethics_inplace', 'ethics_positions',
      'internal_breaches', 'internal_issues', 'internal_employees', 'internal_processes',
    ].forEach((field) => {
      (checkboxValues as any)[field] = allChecked;
    });
    component.parentForm = fb.group({
      employee: fb.array([
        fb.group({
          employeeId: 1,
          fitnessInputs: fb.array([
            fb.group({
              id: 0,
              year: new Date(2023, 0, 1),
              relevance: 1,
              fitnessnumber_of_employees: 100,
              ...checkboxValues,
              employee_fitness_percentage: null,
            }),
          ]),
        }),
      ]),
    });
    return fb;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockCommonService.getData as jest.Mock).mockReturnValue(of({
      status: true,
      data: [
        { id: 1, name: 'Included' },
        { id: 2, name: 'Not relevant' },
      ],
    }));

    await TestBed.configureTestingModule({
      imports: [Be20FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be20FormComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormBuilder().group({
      employee: new FormBuilder().array([]),
    });
    component.arrayName = 'employee';
    component.goal = buildGoal();
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load relevance options from the common service', () => {
    expect(component.relevantsArr.length).toBe(2);
  });

  it('should set employee fitness to 100% when all checkboxes are checked', () => {
    buildEmployeeForm(true);

    component.calculateSiteFitness(0, 0);

    const fitness = (component.employee.at(0).get('fitnessInputs') as any).at(0).get('employee_fitness_percentage');
    expect(fitness.value).toBe('100%');
  });

  it('should set employee fitness to 0% when not all checkboxes are checked', () => {
    buildEmployeeForm(false);

    component.calculateSiteFitness(0, 0);

    const fitness = (component.employee.at(0).get('fitnessInputs') as any).at(0).get('employee_fitness_percentage');
    expect(fitness.value).toBe('0%');
  });

  it('should calculate the weighted progress indicator for a year', () => {
    buildEmployeeForm(true);
    const input = (component.employee.at(0).get('fitnessInputs') as any).at(0);
    input.get('employee_fitness_percentage').setValue('100%');

    expect(component.calculateProgressIndicator(2023)).toBe('100%');
  });
});