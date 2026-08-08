import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be16FormComponent } from './be16-form.component';

describe('Be16FormComponent', () => {
  let component: Be16FormComponent;
  let fixture: ComponentFixture<Be16FormComponent>;
  let fb: FormBuilder;

  const checkboxFields = [
    'legitimacy',
    'positive_outcomes',
    'accessibility',
    'reduce_uncertainty',
    'fairness_concerns_investigated',
    'fairness_policies_consult',
    'transparency_throughout_investigation',
    'transparency_process_investigating',
    'transparency_valid_acknowledged',
    'transparency_alternatively_investigation',
    'engage_actively',
    'improve_continuously_performance',
    'improve_continuously_implement',
  ];

  const mkInput = (year: number, relevance: number, flags: Record<string, boolean> = {}, revenue = 100): FormGroup => {
    const base: any = {
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      revenue: new FormControl(revenue),
      product_fitness_percentage: new FormControl(null),
    };
    checkboxFields.forEach(field => { base[field] = new FormControl(flags[field] === true); });
    return new FormGroup(base);
  };

  const mkProduct = (inputs: FormGroup[]): FormGroup =>
    new FormGroup({
      productName: new FormControl('Product A'),
      productId: new FormControl(1),
      fitnessInputs: new FormArray(inputs),
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [Be16FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be16FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ products: fb.array([]) });
    component.arrayName = 'products';
    component.goal = {
      goal_code: 'BE16',
      goal_name: 'Disclosure',
      goal_short_name: 'Dsc',
      ProgressIndicators: [],
      ContextIndicators: [{ unit: 'GBP' }],
    };
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the products array under the configured arrayName', () => {
    const products = component.parentForm.get('products') as FormArray;
    products.push(mkProduct([mkInput(2024, 1, {})]));
    expect(component.formArray).toBe(products);
    expect(component.products.length).toBe(1);
  });

  it('scores 100% when every criterion is met', () => {
    const allTrue: Record<string, boolean> = {};
    checkboxFields.forEach(f => { allTrue[f] = true; });
    (component.parentForm.get('products') as FormArray).push(
      mkProduct([mkInput(2024, 1, allTrue)])
    );
    component.calculateSiteFitnessForInput(0, 0);
    const input = (component.products.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('product_fitness_percentage')?.value).toBe('100%');
  });

  it('scores 30% when only the gateway criteria are met', () => {
    (component.parentForm.get('products') as FormArray).push(
      mkProduct([
        mkInput(2024, 1, {
          legitimacy: true,
          positive_outcomes: true,
        }),
      ])
    );
    component.calculateSiteFitnessForInput(0, 0);
    const input = (component.products.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('product_fitness_percentage')?.value).toBe('30%');
  });

  it('creates a fitness input group with required controls', () => {
    const group = component.createFitnessInput({ relevance_id: 1 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('year')?.value).toBeInstanceOf(Date);
    expect(group.get('revenue')?.value).toBeNull();
  });

  it('reports complete data when every included product is relevant', () => {
    (component.parentForm.get('products') as FormArray).push(
      new FormGroup({ relevance: new FormControl(1) })
    );
    expect(component.calculateBE16DataCompleteness()).toBe('Calculation based on complete data');
  });
});