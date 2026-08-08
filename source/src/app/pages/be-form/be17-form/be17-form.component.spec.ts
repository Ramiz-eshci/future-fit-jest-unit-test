import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { Be17FormComponent } from './be17-form.component';

describe('Be17FormComponent', () => {
  let component: Be17FormComponent;
  let fixture: ComponentFixture<Be17FormComponent>;

  function buildGoal(): any {
    return {
      goal_code: 'BE17',
      goal_name: 'Products proportion of fitness',
      goal_short_name: 'PF17',
      fitness_criteria: 'criteria',
      notes: 'notes',
      ProgressIndicators: [1, 2, 3, 4].map((id) => ({ progress_indicator_id: id, progress_indicator: 'PI' + id })),
      ContextIndicators: [1, 2].map((id) => ({ context_indicator_id: id, context_indicator: 'CI' + id, unit: '$' })),
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
      imports: [Be17FormComponent],
      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be17FormComponent);
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

  it('should render the products from the bound parent form', () => {
    const fb = new FormBuilder();
    component.parentForm = fb.group({
      products: fb.array([
        fb.group({
          productType: ['services'],
          fitnessInputs: fb.array([]),
        }),
      ]),
    });
    expect(component.products.length).toBe(1);
  });

  it('should calculate 100% use-phase fitness when all service criteria are met', () => {
    const fb = new FormBuilder();
    const inputGroup = fb.group({
      relevance: [1],
      GDMMusePhase: [0],
      WDKMPusePhase: [0],
      CWUILHRusePhase: [0],
      EDVPusePhase: [0],
      GFUPEusePhase: [0],
      GCSCusePhase: [0],
      phycal_gd_is_an_intrmdt_gd: [0],
      intrmdt_gd_asses_reprvv_user: [0],
      RPUFGusePhase: [0],
      service_result_in_negative_impacts: [0],
      service_could_harm_ecosystems: [0],
      service_ngtv_impacts_physcl_mntl_wlbng: [0],
      service_reinforce_bhvr_undrm_ftns: [0],
      service_perpetuates_orx_rlc_infr_ngtv_impacts: [0],
      productFitnessusePhase: [null],
      productFitnessendOfLife: [null],
    });
    const productGroup = fb.group({ productType: 'services' });

    const result = component.calculateProductUsePhaseFitness(inputGroup, productGroup);

    expect(result).toBe(1);
    expect(inputGroup.get('productFitnessusePhase')?.value).toBe('100%');
  });

  it('should set product fitness to 0% when the input is not relevant', () => {
    const fb = new FormBuilder();
    const inputGroup = fb.group({
      relevance: [2],
      GDMMusePhase: [1],
      WDKMPusePhase: [1],
      CWUILHRusePhase: [1],
      EDVPusePhase: [1],
      GFUPEusePhase: [1],
      GCSCusePhase: [1],
      phycal_gd_is_an_intrmdt_gd: [1],
      intrmdt_gd_asses_reprvv_user: [1],
      RPUFGusePhase: [1],
      service_result_in_negative_impacts: [1],
      service_could_harm_ecosystems: [1],
      service_ngtv_impacts_physcl_mntl_wlbng: [1],
      service_reinforce_bhvr_undrm_ftns: [1],
      service_perpetuates_orx_rlc_infr_ngtv_impacts: [1],
      productFitnessusePhase: [null],
      productFitnessendOfLife: [null],
    });
    const productGroup = fb.group({ productType: 'services' });

    component.calculateProductUsePhaseFitness(inputGroup, productGroup);

    expect(inputGroup.get('productFitnessusePhase')?.value).toBe('0%');
  });
});