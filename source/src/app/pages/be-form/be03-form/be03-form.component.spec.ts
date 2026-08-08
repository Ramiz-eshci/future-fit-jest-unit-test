import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be03FormComponent } from './be03-form.component';

describe('Be03FormComponent', () => {
  let component: Be03FormComponent;
  let fixture: ComponentFixture<Be03FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE03',
    goal_name: 'Natural resources',
    goal_short_name: 'BE03',
    fitness_criteria: 'criteria',
    notes: 'notes',
    ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'Natural resource fitness' }],
    ContextIndicators: [{ context_indicator_id: 2, context_indicator: 'Resource use', unit: 't' }],
  };

  function createSite(): FormGroup {
    return fb.group({
      siteName: ['Site A'],
      siteId: ['1', Validators.required],
      location: ['Loc'],
      SiteID: ['1'],
      id: [0],
      fitEntryId: [1],
      year: [2022, Validators.required],
      naturalResource: [''],
      resourceID: [''],
      locations: [''],
      valueOfNaturalResource: ['100', Validators.required],
      relevance: [1, Validators.required],
      resourceType: [2, Validators.required],
      commonFitnessCriteriaId: [4],
      renewableRespectRegenerationRates: [false],
      renewableEcosystemHealth: [false],
      renewableAquaticProtection: [false],
      renewableInvasiveSpeciesControl: [false],
      renewableNoDestructiveTechniques: [false],
      renewableSourcingIndustryStandards: [false],
      animalWelfareMaintained: [false],
      animalNoEndangeredHunting: [false],
      animalSourcingstandards: [false],
      nonrenewableSourcingIndustryStandards: [false],
      nonrenewableNoConflictOrHrViolation: [false],
      nonrenewableNoDestructiveExtraction: [false],
      nonrenewableEcosystemHealthMaintained: [false],
      nonrenewableEcosystemProductionImpactControl: [false],
      resourceFitnessPercent: [''],
      comments: [''],
      contextDescription: [''],
    });
  }

  function createParentForm(): FormGroup {
    return fb.group({ sites: fb.array([createSite()]) });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [Be03FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be03FormComponent);
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

  it('should add a new site group to the array', () => {
    const before = component.sites.length;
    component.addSite();
    expect(component.sites.length).toBe(before + 1);
  });

  it('should enable buttonEnable when a site is relevant', () => {
    component.calculateSiteFitness();
    expect(component.buttonEnable).toBeTruthy();
  });

  it('should compute progress indicator from resource fitness', () => {
    component.sites.at(0).get('resourceFitnessPercent')?.setValue('50%');
    expect(component.calculateProgressIndicator(2022)).toBe('50%');
  });
});