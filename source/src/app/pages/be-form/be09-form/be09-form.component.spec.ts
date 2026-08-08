import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be09FormComponent } from './be09-form.component';

describe('Be09FormComponent', () => {
  let component: Be09FormComponent;
  let fixture: ComponentFixture<Be09FormComponent>;
  let fb: FormBuilder;

  const mkInput = (year: number, relevance: number, fitness = '', affected: any = 1): FormGroup =>
    new FormGroup({
      id: new FormControl(0),
      year: new FormControl(new Date(year, 0, 1)),
      relevance: new FormControl(relevance),
      affected_communities_identified: new FormControl(affected),
      site_fitness_percentage: new FormControl(fitness),
    });

  const mkSite = (inputs: FormGroup[]): FormGroup =>
    new FormGroup({
      siteName: new FormControl('Site A'),
      siteId: new FormControl(1),
      location: new FormControl('Loc'),
      fitnessInputs: new FormArray(inputs),
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    fb = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [Be09FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be09FormComponent);
    component = fixture.componentInstance;
    component.parentForm = fb.group({ sites: fb.array([]) });
    component.arrayName = 'sites';
    component.goal = {
      goal_code: 'BE09',
      goal_name: 'Community',
      goal_short_name: 'Comm',
      ProgressIndicators: [],
      ContextIndicators: [{ unit: '%' }],
    };
    component.fitEntryId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the sites array under the configured arrayName', () => {
    const sites = component.parentForm.get('sites') as FormArray;
    sites.push(mkSite([mkInput(2024, 1)]));
    expect(component.formArray).toBe(sites);
    expect(component.sites.length).toBe(1);
  });

  it('calculates the progress indicator as the average site fitness for the year', () => {
    (component.parentForm.get('sites') as FormArray).push(
      mkSite([mkInput(2024, 1, '80%'), mkInput(2024, 1, '60%'), mkInput(2025, 1, '100%')])
    );
    expect(component.calculateProgressIndicator(2024)).toBe('70%');
  });

  it('reports complete data when every included input for the year is relevant', () => {
    (component.parentForm.get('sites') as FormArray).push(
      mkSite([mkInput(2024, 1), mkInput(2024, 1)])
    );
    expect(component.calculateDataCompleteness(2024)).toBe('Calculation based on complete data');
  });

  it('fetches relevance options from the service on construction', () => {
    expect(mockCommonService.getData).toHaveBeenCalledWith('list/relevanace4data');
  });

  it('maps relevance ids to names from the loaded relevance list', () => {
    component.relevantsArr = [{ id: 1, name: 'Relevant' }];
    expect(component.getRelevanceNameById(1)).toBe('Relevant');
    expect(component.getRelevanceNameById(99)).toBe('Not set');
  });
});