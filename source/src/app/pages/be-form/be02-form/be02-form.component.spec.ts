import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be02FormComponent } from './be02-form.component';

describe('Be02FormComponent', () => {
  let component: Be02FormComponent;
  let fixture: ComponentFixture<Be02FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE02',
    goal_name: 'Water',
    ProgressIndicators: [
      { progress_indicator_id: 1 },
      { progress_indicator_id: 2 },
    ],
    ContextIndicators: [
      { context_indicator_id: 3 },
      { context_indicator_id: 4 },
      { context_indicator_id: 5 },
    ],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      relevance: ['', Validators.required],
      relevance1: ['', Validators.required],
      year: [new Date(2022, 0, 1)],
      fitWaterVolume: [0],
      unfitWaterVolume: [0],
      commercialOffset: [0],
      workerFitWater: [0],
      workerUnfitWater: [0],
      commercialFit: [0],
      commercialUnfit: [0],
      commercialTotal: [0],
      siteFitness: [''],
      siteFitness1: [''],
      dischargeRelevance: [0],
      fitDischarged: [0],
      totalDischarged: [0],
      contextDescription: [''],
      comments: [''],
    });
  }

  function createSite(): FormGroup {
    return fb.group({
      siteName: 'Site A',
      siteId: '1',
      location: 'L',
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
      imports: [Be02FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be02FormComponent);
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

  it('should calculate commercial fit and site fitness for relevant water', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('fitWaterVolume')?.setValue(100);
    inputs.at(0).get('workerFitWater')?.setValue(60);

    component.calculateSiteFitness(0, 0);

    expect(inputs.at(0).get('commercialFit')?.value).toBe(40);
    expect(inputs.at(0).get('siteFitness')?.value).toBe('100%');
  });

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });

  it('should set formSubmittedFlag and global submitted on submitForm', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('year')?.setValue(new Date(2022, 0, 1));
    component.submitForm(false);
    expect(component.formSubmittedFlag).toBeTruthy();
    expect(mockGlobalFlagService.setSubmitted).toHaveBeenCalledWith(true);
    expect(mockCommonService.addData).toHaveBeenCalled();
  });
});