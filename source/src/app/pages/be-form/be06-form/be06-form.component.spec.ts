import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be06FormComponent } from './be06-form.component';

describe('Be06FormComponent', () => {
  let component: Be06FormComponent;
  let fixture: ComponentFixture<Be06FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE06',
    goal_name: 'GHG emissions',
    goal_short_name: 'BE06',
    fitness_criteria: 'criteria',
    notes: 'notes',
    ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'GHG reduction' }],
    ContextIndicators: [{ context_indicator_id: 2, context_indicator: 'Emissions', unit: 'tCO2e' }],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1)],
      relevance: ['', Validators.required],
      ghgReferenceYear: [100],
      ghgReportingYear: [80],
      ghgAdequatelyOffset: [0],
      siteFitnessPercent: [null],
      NOGHGemissionsAreReleased: [''],
      comments: [''],
      GHGemissionsyear: [''],
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
      imports: [Be06FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be06FormComponent);
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

  it('should calculate GHG site fitness from reference and reporting years', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('ghgReferenceYear')?.setValue(100);
    inputs.at(0).get('ghgReportingYear')?.setValue(80);

    component.calculateSiteFitness(0, 0);

    expect(inputs.at(0).get('siteFitnessPercent')?.value).toBe('20%');
  });

  it('should compute progress indicator from aggregated GHG years', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('ghgReferenceYear')?.setValue(100);
    inputs.at(0).get('ghgReportingYear')?.setValue(80);

    expect(component.calculateProgressIndicator(2022)).toBe('20%');
  });

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });
});