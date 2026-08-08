import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be05FormComponent } from './be05-form.component';

describe('Be05FormComponent', () => {
  let component: Be05FormComponent;
  let fixture: ComponentFixture<Be05FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE05',
    goal_name: 'Emissions',
    goal_short_name: 'BE05',
    fitness_criteria: 'criteria',
    notes: 'notes',
    ProgressIndicators: [
      { progress_indicator_id: 1 },
      { progress_indicator_id: 2 },
      { progress_indicator_id: 3 },
    ],
    ContextIndicators: [
      { context_indicator_id: 4 },
      { context_indicator_id: 5 },
      { context_indicator_id: 6 },
    ],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1)],
      relevanceGaseous: [1, Validators.required],
      gaseousReferenceYear: [100],
      gaseousReportingYear: [80],
      gaseousSiteFitnessPercent: [null],
      relevanceLiquid: [1, Validators.required],
      liquidReferenceYear: [100],
      liquidReportingYear: [80],
      liquidSiteFitnessPercent: [null],
      relevanceSolid: [1, Validators.required],
      solidReferenceYear: [100],
      solidReportingYear: [80],
      solidSiteFitnessPercent: [null],
      comments: [''],
      contextDescription: [''],
      liquidemissionyear: [''],
      Solidemissionyear: [''],
      Gaseousemissionyear: [''],
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
      imports: [Be05FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be05FormComponent);
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

  it('should calculate gaseous site fitness from reference and reporting years', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevanceGaseous')?.setValue(1);
    inputs.at(0).get('gaseousReferenceYear')?.setValue(100);
    inputs.at(0).get('gaseousReportingYear')?.setValue(80);

    component.calculateSiteFitness(0, 0);

    expect(inputs.at(0).get('gaseousSiteFitnessPercent')?.value).toBe('20%');
  });

  it('should compute progress indicator from aggregated emission years', () => {
    expect(component.calculateProgressIndicator(0, 2022)).toBe('20%');
  });

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });
});