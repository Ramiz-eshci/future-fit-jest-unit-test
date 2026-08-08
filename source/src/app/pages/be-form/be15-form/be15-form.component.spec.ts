import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be15FormComponent } from './be15-form.component';

describe('Be15FormComponent', () => {
  let component: Be15FormComponent;
  let fixture: ComponentFixture<Be15FormComponent>;
  let fb: FormBuilder;

  const dropdownFields = [
    'user_groups_communicationplans',
    'communications_are_considered',
    'communications_crucial_information',
    'communications_product_information',
    'purchase_information_needed',
    'purchase_physical_goods',
    'purchase_nature_andquantities',
    'purchase_characteristics_ofproducts',
    'purchase_ambiguous_term',
    'purchase_comparative',
    'purchase_user_groups',
    'use_users_provided',
    'use_nutrition_information',
    'use_with_guidance',
    'use_guidance_provided',
    'post_physical_good',
    'post_improper_disposal',
  ];

  const mkInput = (year: number, relevance: number, values: Record<string, any> = {}, revenue = 100): FormGroup => {
    const base: any = {
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      revenue: new FormControl(revenue),
      product_fitness_percentage: new FormControl(null),
    };
    dropdownFields.forEach(field => { base[field] = new FormControl(values[field] ?? false); });
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
      imports: [Be15FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be15FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ products: fb.array([]) });
    component.arrayName = 'products';
    component.goal = {
      goal_code: 'BE15',
      goal_name: 'Products',
      goal_short_name: 'Prd',
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

  it('scores 100% when every criterion group passes', () => {
    const allTruthy: Record<string, any> = {};
    dropdownFields.forEach(field => { allTruthy[field] = 1; });
    (component.parentForm.get('products') as FormArray).push(
      mkProduct([mkInput(2024, 1, allTruthy)])
    );
    component.calculateProductFitness(0, 0);
    const input = (component.products.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('product_fitness_percentage')?.value).toBe('100%');
  });

  it('scores 25% when only the communication group passes', () => {
    (component.parentForm.get('products') as FormArray).push(
      mkProduct([
        mkInput(2024, 1, {
          user_groups_communicationplans: 1,
          communications_are_considered: 1,
          communications_crucial_information: 1,
          communications_product_information: 1,
        }),
      ])
    );
    component.calculateProductFitness(0, 0);
    const input = (component.products.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('product_fitness_percentage')?.value).toBe('25%');
  });

  it('clears the fitness score when the input is not relevant', () => {
    (component.parentForm.get('products') as FormArray).push(
      mkProduct([mkInput(2024, 2, {})])
    );
    component.calculateProductFitness(0, 0);
    const input = (component.products.at(0) as FormGroup).get('fitnessInputs') as FormArray;
    expect(input.at(0).get('product_fitness_percentage')?.value).toBe('');
  });

  it('creates a fitness input group with required relevance', () => {
    const group = component.createFitnessInput({ relevance_id: 1 });
    expect(group.get('relevance')?.value).toBe(1);
    expect(group.get('relevance')?.validator).toBeTruthy();
    expect(group.get('year')?.value).toBe(new Date().getFullYear());
  });
});