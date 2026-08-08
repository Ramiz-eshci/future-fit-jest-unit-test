import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be01FormComponent } from './be01-form.component';

describe('Be01FormComponent', () => {
  let component: Be01FormComponent;
  let fixture: ComponentFixture<Be01FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE01',
    goal_name: 'Renewable Energy',
    goal_short_name: 'BE01',
    fitness_criteria: 'All sites must use renewable energy',
    notes: 'Test notes',
    ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'Renewable energy usage' }],
    ContextIndicators: [{ context_indicator_id: 2, context_indicator: 'Total energy', unit: 'kWh' }],
  };

  function createParentForm(): FormGroup {
    return fb.group({ sites: fb.array([createSite()]) });
  }

  function createSite(): FormGroup {
    const inputs = fb.array([createFitnessInput()]);
    return fb.group({ siteName: 'Site A', siteId: '1', location: 'Loc', fitnessInputs: inputs });
  }

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1), [Validators.required]],
      relevance: [1],
      renewableEnergyUsed: ['100'],
      totalEnergyUsed: ['200'],
      siteFitness: [''],
      comments: [''],
    });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [Be01FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be01FormComponent);
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

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });

  it('should calculate site fitness percentage for included relevance', () => {
    component.calculateSiteFitness(0, 0);
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    expect(inputs.at(0).get('siteFitness')?.value).toBe('50%');
  });

  it('should set formSubmittedFlag and global submitted on submitForm', () => {
    component.submitForm(false);
    expect(component.formSubmittedFlag).toBeTruthy();
    expect(mockGlobalFlagService.setSubmitted).toHaveBeenCalledWith(true);
    expect(mockCommonService.addData).toHaveBeenCalled();
  });
});