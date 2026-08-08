import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be21FormComponent } from './be21-form.component';

describe('Be21FormComponent', () => {
  let component: Be21FormComponent;
  let fixture: ComponentFixture<Be21FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE21',
      goal_name: 'Tax transparency',
      goal_short_name: 'TT21',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'PI1' }],
      ContextIndicators: [{ context_indicator_id: 1, context_indicator: 'CI1', unit: '%' }],
    };
  }

  function buildSiteForm(allTrue: boolean): FormBuilder {
    const fb = new FormBuilder();
    const fields = [
      'companyis_mnc', 'public_website', 'public_tax_appointed', 'public_tax_strategy',
      'public_tax_marketed', 'public_tax_no_tax', 'public_tax_direct', 'public_tax_stated',
      'public_tax_independent', 'public_tax_discloses', 'transparency_company',
      'transparency_evidence', 'transparency_address', 'transparency_ultimate',
      'taxrate_reconciliation', 'taxrate_current', 'taxrate_narrative', 'taxrate_deferred',
      'country_by_disclose', 'country_by_residence', 'country_by_net_asset_value',
      'country_by_net_period_provided', 'country_by_income', 'country_by_current_tax_charge',
      'country_by_average_number',
    ];
    const values: any = {
      id: 0,
      year: new Date(2023, 0, 1),
      tax_policies_totalescore: null,
      transparency_totalescore: null,
      taxrate_totalescore: null,
      country_by_total_context_score: null,
    };
    fields.forEach((field) => (values[field] = allTrue));
    component.parentForm = fb.group({
      sites: fb.array([
        fb.group({
          fitnessInputs: fb.array([fb.group(values)]),
        }),
      ]),
    });
    return fb;
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
      imports: [Be21FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be21FormComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormBuilder().group({
      sites: new FormBuilder().array([]),
    });
    component.arrayName = 'sites';
    component.goal = buildGoal();
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the sites form array from the parent form', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      sites: fb.array([fb.group({ year: new Date(2023, 0, 1) })]),
    });

    expect(component.sites.length).toBe(1);
  });

  it('should calculate per-site sub scores', () => {
    buildSiteForm(true);

    component.calculateSiteFitness(0);

    const input = (component.sites.at(0).get('fitnessInputs') as any).at(0);
    expect(input.get('tax_policies_totalescore').value).toBe(9);
    expect(input.get('transparency_totalescore').value).toBe(4);
    expect(input.get('taxrate_totalescore').value).toBe(4);
    expect(input.get('country_by_total_context_score').value).toBe(7);
  });

  it('should calculate a 100% progress indicator when all tax criteria are met', () => {
    buildSiteForm(true);

    expect(component.calculateProgressIndicator(2023)).toBe('100%');
  });

  it('should return N/A for the context indicator when the company is not an MNC', () => {
    buildSiteForm(true);
    const input = (component.sites.at(0).get('fitnessInputs') as any).at(0);
    input.get('companyis_mnc').setValue(false);

    expect(component.calculateContextIndicator(2023)).toBe('N/A');
  });
});