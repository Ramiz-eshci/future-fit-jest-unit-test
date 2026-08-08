import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be07FormComponent } from './be07-form.component';

describe('Be07FormComponent', () => {
  let component: Be07FormComponent;
  let fixture: ComponentFixture<Be07FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE07',
    goal_name: 'Waste',
    goal_short_name: 'BE07',
    fitness_criteria: 'criteria',
    notes: 'notes',
    ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'Waste reduction' }],
    ContextIndicators: [{ context_indicator_id: 2, context_indicator: 'Waste volume', unit: 't' }],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1), [Validators.required]],
      relevance: ['', Validators.required],
      site_assessed_waste_id: [''],
      waste_reference_year: [100],
      waste_reporting_year: [80],
      site_fitness_percent: [null],
      comments: [''],
      wastegeneratedyear: [''],
    });
  }

  function createSite(): FormGroup {
    return fb.group({
      site_id: ['1'],
      siteName: ['Site A'],
      fitnessInputs: fb.array([createFitnessInput()]),
    });
  }

  function createParentForm(): FormGroup {
    return fb.group({ sites: fb.array([createSite()]) });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [Be07FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be07FormComponent);
    component = fixture.componentInstance;
    component.parentForm = createParentForm();
    component.arrayName = 'sites';
    component.goal = goal;
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the parent form array bound to arrayName', () => {
    expect(component.sites).toBeInstanceOf(FormArray);
    expect(component.sites.length).toBe(1);
  });

  it('should calculate site fitness from reference and reporting waste', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('site_assessed_waste_id')?.setValue(2);
    inputs.at(0).get('waste_reference_year')?.setValue(100);
    inputs.at(0).get('waste_reporting_year')?.setValue(80);

    component.calculateSiteFitness(0, 0);

    expect(inputs.at(0).get('site_fitness_percent')?.value).toBe('20%');
  });

  it('should compute progress indicator from aggregated waste years', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('site_assessed_waste_id')?.setValue(2);
    inputs.at(0).get('waste_reference_year')?.setValue(100);
    inputs.at(0).get('waste_reporting_year')?.setValue(80);

    expect(component.calculateProgressIndicator(2022)).toBe('20%');
  });

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });
});