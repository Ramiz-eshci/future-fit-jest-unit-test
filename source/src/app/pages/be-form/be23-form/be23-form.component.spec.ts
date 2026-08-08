import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be23FormComponent } from './be23-form.component';

describe('Be23FormComponent', () => {
  let component: Be23FormComponent;
  let fixture: ComponentFixture<Be23FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE23',
      goal_name: 'Financial assets',
      goal_short_name: 'FA23',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'PI1' }],
      ContextIndicators: [{ context_indicator_id: 1, context_indicator: 'CI1', unit: '$' }],
    };
  }

  function buildFinancialForm(assetName = 'Asset A'): void {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      financial: fb.array([
        fb.group({
          financialAsset: assetName,
          financialAssetId: 1,
          reportingPeriod: '365',
          PurchaseType: 'Product input',
          categories: fb.array([
            fb.group({
              categoryId: 1,
              categoryName: 'Category 1',
              fitnessInputs: fb.array([
                fb.group({
                  id: 0,
                  year: new Date(2023, 0, 1),
                  monetaryValue: '100',
                  relevance: 1,
                  financialAssetDoes: true,
                  hotspotAssessment: true,
                  potentialHotspotsIdentified: true,
                  actualHotspots: true,
                  allHighIntensityHotspot: true,
                  allHotspotsHaveBeen: true,
                  financialFitness: null,
                  comments: '',
                  contextDescription: '',
                  finanical_id: 0,
                  categoryId: 1,
                }),
              ]),
            }),
          ]),
        }),
      ]),
    });
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
      imports: [Be23FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be23FormComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormBuilder().group({
      financial: new FormBuilder().array([]),
    });
    component.arrayName = 'financial';
    component.goal = buildGoal();
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load relevance options and categories from the common service', () => {
    expect(mockCommonService.getData).toHaveBeenCalledWith('list/relevanace4data');
    expect(mockCommonService.getData).toHaveBeenCalledWith('list/be04_category');
    expect(component.relevantsArr.length).toBe(2);
    expect(component.be004Tabs.length).toBe(2);
    expect(component.selectedCategory).toBeTruthy();
  });

  it('should calculate 100% financial fitness when all hotspots are addressed', () => {
    buildFinancialForm();

    component.calculateFinancialFitness(0, 0, 0);

    const input = (component.products.at(0).get('categories') as any).at(0).get('fitnessInputs').at(0);
    expect(input.get('financialFitness').value).toBe('100%');
  });

  it('should calculate the progress indicator for a category and year', () => {
    buildFinancialForm();
    component.calculateFinancialFitness(0, 0, 0);

    expect(component.calculateProgressIndicator(2023, 0)).toBe('100%');
  });

  it('should total monetary values for a category and year', () => {
    buildFinancialForm();
    const fb = new FormBuilder();
    const inputs = (component.products.at(0).get('categories') as any).at(0).get('fitnessInputs');
    inputs.push(fb.group({
      id: 1,
      year: new Date(2023, 0, 1),
      monetaryValue: '200',
      relevance: 1,
    }));

    expect(component.getMonetaryTotal(2023, 0)).toBe('300');
  });
});