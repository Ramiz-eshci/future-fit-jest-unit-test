import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockGlobalFlagService } from 'src/app/testing/test-helpers';

import { Be04FormComponent } from './be04-form.component';

describe('Be04FormComponent', () => {
  let component: Be04FormComponent;
  let fixture: ComponentFixture<Be04FormComponent>;
  let fb: FormBuilder;

  const goal = {
    goal_code: 'BE04',
    ProgressIndicators: [{ progress_indicator_id: 1 }],
    ContextIndicators: [{ context_indicator_id: 2 }],
  };

  function createFitnessInput(): FormGroup {
    return fb.group({
      id: [0],
      year: [new Date(2022, 0, 1), [Validators.required]],
      fitnessCost: [100],
      relevance: [1],
      categoryId: [''],
      purchaseDoesNotUsePhase: [false],
      hotspotConducted: [false],
      potentialHotspot: [false],
      actualHotspots: [false],
      allHighIntensityHotspots: [false],
      allHotspotsHaveBeenAvoided: [false],
      allHotspotFromCardle: [false],
      companyContinuously: [false],
      contextDescription: [''],
      purchaseFitness: [''],
      comments: [''],
    });
  }

  function createCategory(): FormGroup {
    return fb.group({
      id: [1],
      categoryId: [1],
      categoryName: ['Category 1'],
      fitnessInputs: fb.array([createFitnessInput()]),
    });
  }

  function createSite(): FormGroup {
    return fb.group({
      Purchase: ['Purchase A'],
      id: [0],
      Purchase_id: [0],
      Cost: [0],
      PurchaseType: ['Product input'],
      categories: fb.array([createCategory()]),
    });
  }

  function createParentForm(): FormGroup {
    return fb.group({ sites: fb.array([createSite()]) });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [Be04FormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(Be04FormComponent);
    component = fixture.componentInstance;
    component.parentForm = createParentForm();
    component.arrayName = 'sites';
    component.goal = goal;
    component.be004Tabs = [{ id: 1, name: 'Category 1' }];
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

  it('should add a fitness input to a category', () => {
    const categories = component.sites.at(0).get('categories') as FormArray;
    const inputs = categories.at(0).get('fitnessInputs') as FormArray;
    const before = inputs.length;
    component.addFitnessInput(0, 0);
    expect(inputs.length).toBe(before + 1);
  });

  it('should calculate purchase fitness for relevant product input', () => {
    const categories = component.sites.at(0).get('categories') as FormArray;
    const inputs = categories.at(0).get('fitnessInputs') as FormArray;
    const input = inputs.at(0) as FormGroup;
    input.get('relevance')?.setValue(1);
    input.get('purchaseDoesNotUsePhase')?.setValue(true);
    input.get('hotspotConducted')?.setValue(true);

    component.calculatePurchaseFitness(0, 0, 0);

    expect(input.get('purchaseFitness')?.value).toBe('100%');
  });

  it('should compute progress indicator weighted by cost', () => {
    const categories = component.sites.at(0).get('categories') as FormArray;
    const inputs = categories.at(0).get('fitnessInputs') as FormArray;
    inputs.at(0).get('relevance')?.setValue(1);
    inputs.at(0).get('purchaseFitness')?.setValue('50%');

    expect(component.calculateProgressIndicator(2022, 0)).toBe('50%');
  });
});