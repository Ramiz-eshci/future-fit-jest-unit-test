import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be22FormComponent } from './be22-form.component';

describe('Be22FormComponent', () => {
  let component: Be22FormComponent;
  let fixture: ComponentFixture<Be22FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE22',
      goal_name: 'Lobbying and contributions',
      goal_short_name: 'LC22',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [{ progress_indicator_id: 1, progress_indicator: 'PI1' }],
      ContextIndicators: [{ context_indicator_id: 1, context_indicator: 'CI1', unit: '$' }],
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockCommonService.getData as jest.Mock).mockReturnValue(of({ status: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [Be22FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be22FormComponent);
    component = fixture.componentInstance;
    component.parentForm = new FormBuilder().group({
      sites: new FormBuilder().array([]),
    });
    component.arrayName = 'sites';
    component.goal = buildGoal();
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  function buildSiteForm(allTrue: boolean): void {
    const fb = new FormBuilder();
    const fields = [
      'lobbying_seek_to_influence', 'lobbying_supporting_individuals',
      'lobbying_specific_positions', 'lobbying_all_departments',
      'contributions_directly_undertake', 'contributions_diligence_before',
      'contributions_recipient_engages', 'contributions_due_diligence',
      'contributions_regular_review', 'contributions_clear_guidance',
      'disclosure_recipient_name', 'disclosure_amount',
      'disclosure_date_of_contribution', 'disclosure_company_raised',
    ];
    const values: any = { id: 0, year: new Date(2023, 0, 1), amount_contributed_toLobby: '1000' };
    fields.forEach((field) => (values[field] = allTrue));
    component.parentForm = fb.group({
      sites: fb.array([
        fb.group({
          fitnessInputs: fb.array([fb.group(values)]),
        }),
      ]),
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute a 100% progress score when all criteria are met', () => {
    buildSiteForm(true);

    expect(component.calculateProgressIndicator(2023)).toBe('100%');
  });

  it('should compute 0% when lobbying criteria are not met', () => {
    buildSiteForm(false);

    expect(component.calculateProgressIndicator(2023)).toBe('0%');
  });

  it('should sum contribution amounts for the context indicator', () => {
    buildSiteForm(true);
    const fb = new FormBuilder();
    (component.sites.at(0).get('fitnessInputs') as any).push(fb.group({
      id: 1,
      year: new Date(2023, 0, 1),
      amount_contributed_toLobby: '500',
    }));

    expect(component.calculateContextIndicator(2023)).toBe('1,500');
  });
});