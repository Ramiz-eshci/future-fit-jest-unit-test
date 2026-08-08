import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be08FormComponent } from './be08-form.component';

describe('Be08FormComponent', () => {
  let component: Be08FormComponent;
  let fixture: ComponentFixture<Be08FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE08',
    goal_name: 'Biodiversity',
    goal_short_name: 'BE08',
    fitness_criteria: 'criteria',
    notes: 'notes',
    ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'Area managed' }],
    ContextIndicators: [{ context_indicator_id: 2, context_indicator: 'Area', unit: 'ha' }],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1)],
      relevance: ['', Validators.required],
      siteArea: [100],
      localImpactIdentified: [false],
      valueAreaIdentified: [false],
      valueAreaProtected: [false],
      noImpactOnPristineEcosystems: [false],
      landRightsUncontested: [false],
      communityConsentObtained: [false],
      pastDamageNeutralized: [false],
      siteFitness: [null],
      comments: [''],
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
      imports: [Be08FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be08FormComponent);
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

  it('should set 100% fitness when all criteria are met', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const input = inputs.at(0) as FormGroup;
    input.get('relevance')?.setValue(1);
    ['localImpactIdentified', 'valueAreaIdentified', 'valueAreaProtected', 'noImpactOnPristineEcosystems',
     'landRightsUncontested', 'communityConsentObtained', 'pastDamageNeutralized'].forEach(field => {
      input.get(field)?.setValue(true);
    });

    component.calculateSiteFitness(0, 0);

    expect(input.get('siteFitness')?.value).toBe('100%');
  });

  it('should compute progress indicator weighted by site area', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const input = inputs.at(0) as FormGroup;
    input.get('relevance')?.setValue(1);
    input.get('siteArea')?.setValue(100);
    input.get('siteFitness')?.setValue('50%');

    expect(component.calculateProgressIndicator(2022)).toBe('50%');
  });

  it('should add a fitness input to a site', () => {
    const inputs = component.sites.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0);
    expect(inputs.length).toBe(before + 1);
  });
});