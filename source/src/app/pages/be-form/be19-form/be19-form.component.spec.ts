import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be19FormComponent } from './be19-form.component';

describe('Be19FormComponent', () => {
  let component: Be19FormComponent;
  let fixture: ComponentFixture<Be19FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE19',
      goal_name: 'Products',
      goal_short_name: 'PF19',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [
        { progress_indicator_id: 1, progress_indicator: 'sold or leased goods' },
        { progress_indicator_id: 2, progress_indicator: 'supplementary goods' },
      ],
      ContextIndicators: [
        { context_indicator_id: 1, context_indicator: 'CI1', unit: '$' },
        { context_indicator_id: 2, context_indicator: 'CI2', unit: '$' },
      ],
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
      imports: [Be19FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be19FormComponent);
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
    expect(component.relevantsArr.length).toBe(2);
  });

  it('should calculate site fitness from distinct products', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: 'Sold or leased goods',
          fitnessInputs: fb.array([
            fb.group({
              relevance: 1,
              numberof_distinct: 2,
              fitness1_repurposing: '50%',
              fitness1_sold: '100',
              fitness2_repurposing: '0%',
              fitness2_sold: '100',
              product_fitness_percentage: null,
            }),
          ]),
        }),
      ]),
    });

    component.calculateSiteFitness(0, 0);

    const fitness = (component.products.at(0).get('fitnessInputs') as any).at(0).get('product_fitness_percentage');
    expect(fitness.value).toBe('25%');
  });

  it('should clear fitness and disable distinct fields when not relevant', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: 'Sold or leased goods',
          fitnessInputs: fb.array([
            fb.group({
              relevance: 2,
              numberof_distinct: 3,
              fitness1_repurposing: '10%',
              fitness1_sold: '50',
              product_fitness_percentage: '50%',
            }),
          ]),
        }),
      ]),
    });

    component.calculateSiteFitness(0, 0);

    const input = (component.products.at(0).get('fitnessInputs') as any).at(0);
    expect(input.get('product_fitness_percentage').value).toBe('');
    expect(input.get('numberof_distinct').disabled).toBe(true);
  });

  it('should calculate the progress indicator for sold goods', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: 'Sold or leased goods',
          fitnessInputs: fb.array([
            fb.group({
              relevance: 1,
              year: new Date(2023, 0, 1),
              revenue: '100',
              product_fitness_percentage: '50%',
            }),
          ]),
        }),
      ]),
    });

    expect(component.calculateProgressIndicator(0, 2023)).toBe('50%');
  });
});