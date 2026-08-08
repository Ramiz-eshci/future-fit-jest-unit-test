import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be18FormComponent } from './be18-form.component';

describe('Be18FormComponent', () => {
  let component: Be18FormComponent;
  let fixture: ComponentFixture<Be18FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE18',
      goal_name: 'Products',
      goal_short_name: 'PF18',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'PI1' }],
      ContextIndicators: [{ context_indicator_id: 1, context_indicator: 'CI1', unit: 'CO2e' }],
    };
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
      imports: [Be18FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be18FormComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormBuilder().group({
      products: new FormBuilder().array([]),
    });
    component.arrayName = 'products';
    component.goal = buildGoal();
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load relevance options from the common service', () => {
    expect(mockCommonService.getData).toHaveBeenCalledWith('list/relevanace4data');
    expect(component.relevantsArr.length).toBe(2);
  });

  it('should set product fitness to 100% when GHG emissions are not relevant', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: 'services',
          fitnessInputs: fb.array([
            fb.group({
              id: 0,
              year: new Date(2023, 0, 1),
              relevance: 1,
              emitGHGs: false,
              productFitness: null,
            }),
          ]),
        }),
      ]),
    });

    component.calculateProductFitness(0, 0);

    const fitness = (component.products.at(0).get('fitnessInputs') as any).at(0).get('productFitness');
    expect(fitness.value).toBe('100%');
  });

  it('should leave product fitness empty when emitGHGs is unanswered', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: 'services',
          fitnessInputs: fb.array([
            fb.group({ id: 0, year: 2023, relevance: 1, emitGHGs: null, productFitness: 'prev' }),
          ]),
        }),
      ]),
    });

    component.calculateProductFitness(0, 0);

    const fitness = (component.products.at(0).get('fitnessInputs') as any).at(0).get('productFitness');
    expect(fitness.value).toBe('');
  });

  it('should report incomplete data completeness when insufficient relevance is included', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({ relevance: 1 }),
        fb.group({ relevance: 3 }),
      ]),
    });

    expect(component.calculateBE18DataCompleteness()).toBe('Calculation based on incomplete data');
  });
});