import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from 'src/app/components/help-dialog/help-dialog.component';
import { GlobalFlagService } from 'src/app/services/global-flag.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ViewChild, TemplateRef } from '@angular/core';

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-be17-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatOptionModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
    MaterialModule,
    NgApexchartsModule],
  animations: [
    trigger('indicatorExpand', [
      state('void', style({ height: '0', opacity: 0, overflow: 'hidden' })),
      state('*', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('rotateChevron', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],

  templateUrl: './be17-form.component.html',
  styleUrl: './be17-form.component.scss'
})
export class Be17FormComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Output() calculate = new EventEmitter<void>();
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;

  SupplementarygoodsUsephase: any = 0
  SupplementarygoodsEndOfLife: any = 0
  loading: boolean = false;
  relevantsArr: any = [];
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  routeId: any = '';
  contextUnit: string = '';
  commonOptions = [
    { id: null, name: '-- Select --' },
    { id: 1, name: 'Yes' },
    { id: 0, name: 'No' }
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status == true) {
        this.relevantsArr = response.data
      }
    });
  }


  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '700px',
      data: { criteria, notes }
    });
  }
  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
  }
  get products(): FormArray {

    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);

  }

  ngOnInit(): void {
    this.applyDisableLogic();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.applyDisableLogic(), 0);
  }

  ngOnChanges(): void {
    this.applyDisableLogic();
  }

  ngDoCheck(): void {
    this.applyDisableLogic();
  }

  openProgressGraph() {

    this.prepareChartData();

    const dialogRef = this.dialog.open(this.progressGraphDialog, {
      width: '950px',
      maxWidth: '95vw'
    });

    dialogRef.afterOpened().subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });

  }

  _old_prepareChartData() {

    const years = [...this.uniqueYearsFromFitnessInputs].sort((a, b) => a - b);

    // Progress Indicators
    const usePhaseProgress = years.map(year => {
      const value = this.calculateProgressIndicator(0, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const endOfLifeProgress = years.map(year => {
      const value = this.calculateProgressIndicator(1, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    // Context Indicator (Revenue OR Cost)
    const contextData = years.map(year => {

      const revenue = Number(
        String(this.calculateContextIndicator(0, year)).replace(/,/g, '')
      ) || 0;

      const cost = Number(
        String(this.calculateContextIndicator(1, year)).replace(/,/g, '')
      ) || 0;

      // Show whichever one exists for that year
      return revenue > 0 ? revenue : cost;

    });
    console.log('contextData', contextData);
    console.log('usePhaseProgress', usePhaseProgress);
    console.log('endOfLifeProgress', endOfLifeProgress);

    this.chartOptions = {

      series: [

        {
          name: 'Revenue / Cost',
          type: 'column',
          data: contextData,
          color: '#43A047',
          yAxisIndex: 1
        },

        {
          name: 'Use Phase Fitness',
          type: 'line',
          data: usePhaseProgress,
          color: '#1976D2',
          yAxisIndex: 0
        },

        {
          name: 'End of Life Fitness',
          type: 'line',
          data: endOfLifeProgress,
          color: '#EF6C00',
          yAxisIndex: 0
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 3, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 4, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: ['Use Phase Fitness', 'End of Life Fitness'],
          min: 0,
          max: 100,
          tickAmount: 5,

          title: {
            text: 'Progress Indicator (%)'
          },

          labels: {
            formatter: (value: number) => value + '%'
          }
        },

        {
          seriesName: ['Revenue / Cost'],
          opposite: true,
          min: 0,
          max: Math.max(...contextData) * 1.1,

          title: {
            text: 'Revenue / Cost'
          },

          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            // Column
            if (opts.seriesIndex === 0) {
              return Number(value).toLocaleString();
            }

            // Lines
            return value + '%';

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }
  prepareChartData() {

    const years = [...this.uniqueYearsFromFitnessInputs].sort((a, b) => a - b);

    // Context Indicators
    const serviceRevenue = years.map(year =>
      Number(
        String(this.calculateContextIndicator(0, year)).replace(/,/g, '')
      ) || 0
    );

    const supplementaryRevenue = years.map(year =>
      Number(
        String(this.calculateContextIndicator(1, year)).replace(/,/g, '')
      ) || 0
    );

    // Progress Indicators
    const serviceUsePhase = years.map(year => {
      const value = this.calculateProgressIndicator(0, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const serviceEndOfLife = years.map(year => {
      const value = this.calculateProgressIndicator(1, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const supplementaryUsePhase = years.map(year => {
      const value = this.calculateProgressIndicator(2, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const supplementaryEndOfLife = years.map(year => {
      const value = this.calculateProgressIndicator(3, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const maxRevenue = Math.max(
      ...serviceRevenue,
      ...supplementaryRevenue,
      0
    );

    this.chartOptions = {

      series: [

        {
          name: 'Services / Sold Revenue',
          type: 'column',
          data: serviceRevenue,
          color: '#43A047',
          yAxisIndex: 1
        },

        {
          name: 'Supplementary Revenue',
          type: 'column',
          data: supplementaryRevenue,
          color: '#7CB342',
          yAxisIndex: 1
        },

        {
          name: 'Use Phase (Services/Sold)',
          type: 'line',
          data: serviceUsePhase,
          color: '#1976D2',
          yAxisIndex: 0
        },

        {
          name: 'End of Life (Services/Sold)',
          type: 'line',
          data: serviceEndOfLife,
          color: '#EF6C00',
          yAxisIndex: 0
        },

        {
          name: 'Use Phase (Supplementary)',
          type: 'line',
          data: supplementaryUsePhase,
          color: '#8E24AA',
          yAxisIndex: 0
        },

        {
          name: 'End of Life (Supplementary)',
          type: 'line',
          data: supplementaryEndOfLife,
          color: '#D81B60',
          yAxisIndex: 0
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 3, 3, 3, 3],
        curve: 'straight'
      },

      markers: {
        size: [0, 0, 4, 4, 4, 4]
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: ['End of Life (Services/Sold)', 'Use Phase (Supplementary)', 'End of Life (Supplementary)'],
          min: 0,
          max: 100,
          tickAmount: 5,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (value: number) => value + '%'
          }
        },

        {
          seriesName: ['Services / Sold Revenue', 'Supplementary Revenue'],
          opposite: true,
          min: 0,
          max: maxRevenue * 1.1,

          title: {
            text: 'Revenue'
          },

          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            // Revenue columns
            if (opts.seriesIndex === 0 || opts.seriesIndex === 1) {
              return Number(value).toLocaleString();
            }

            return value + '%';

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }



  private applyDisableLogic() {
    if (!this.products) return;

    this.products.controls.forEach((group: AbstractControl) => {
      const productGroup = group as FormGroup;
      const productType = productGroup.get('productType')?.value?.toLowerCase();
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach((inputControl) => {
        const inputGroup = inputControl as FormGroup;

        const relevance = inputGroup.get('relevance')?.value;

        const serviceFields = [
          'service_result_in_negative_impacts',
          'service_could_harm_ecosystems',
          'service_ngtv_impacts_physcl_mntl_wlbng',
          'service_reinforce_bhvr_undrm_ftns',
          'service_perpetuates_orx_rlc_infr_ngtv_impacts'
        ];

        const nonServiceFields = [
          'GDMMusePhase', 'GDMMendOfLife', 'WDKMPusePhase', 'CWUILHRusePhase',
          'EDVPusePhase', 'EDVendOfLife', 'GFUPEusePhase', 'GFUPEendOfLife',
          'GCSCusePhase', 'GCSCendOfLife', 'phycal_gd_is_an_intrmdt_gd',
          'intrmdt_gd_asses_reprvv_user', 'RPUFGusePhase', 'RPUFGendOfLife'
        ];

        if (relevance != 1) {
          [...serviceFields, ...nonServiceFields].forEach(ctrl => {
            const control = inputGroup.get(ctrl);
            if (control) {
              control.setValue(null, { emitEvent: false });
              control.disable({ emitEvent: false });
            }
          });

          inputGroup.get('productFitnessusePhase')?.setValue('', { emitEvent: false });
          inputGroup.get('productFitnessendOfLife')?.setValue('', { emitEvent: false });

          return;
        }

        if (productType == 'services') {
          nonServiceFields.forEach(ctrl => {
            const control = inputGroup.get(ctrl);
            if (control) {
              control.setValue(null, { emitEvent: false });
              control.disable({ emitEvent: false });
            }
          });
          serviceFields.forEach(ctrl => inputGroup.get(ctrl)?.enable({ emitEvent: false }));

        } else {
          serviceFields.forEach(ctrl => {
            const control = inputGroup.get(ctrl);
            if (control) {
              control.setValue(null, { emitEvent: false });
              control.disable({ emitEvent: false });
            }
          });
          nonServiceFields.forEach(ctrl => inputGroup.get(ctrl)?.enable({ emitEvent: false }));

          const phycalValue = inputGroup.get('phycal_gd_is_an_intrmdt_gd')?.value;
          const conditionalFields = ['intrmdt_gd_asses_reprvv_user', 'RPUFGusePhase', 'RPUFGendOfLife'];

          if (phycalValue == 1) {
            conditionalFields.forEach(ctrl => inputGroup.get(ctrl)?.enable({ emitEvent: false }));
          } else {
            conditionalFields.forEach(ctrl => {
              const control = inputGroup.get(ctrl);
              if (control) {
                control.setValue(null, { emitEvent: false });
                control.disable({ emitEvent: false });
              }
            });
          }
        }
      });
    });
  }


  recalculateFitness(productIndex: number, inputIndex: number): void {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;

    const fieldsToDisable = [
      'GDMMusePhase',
      'GDMMendOfLife',
      'WDKMPusePhase',
      'CWUILHRusePhase',
      'EDVPusePhase',
      'EDVendOfLife',
      'GFUPEusePhase',
      'GFUPEendOfLife',
      'GCSCusePhase',
      'GCSCendOfLife',
      'phycal_gd_is_an_intrmdt_gd',
      'intrmdt_gd_asses_reprvv_user',
      'RPUFGusePhase',
      'RPUFGendOfLife',
      'service_result_in_negative_impacts',
      'service_could_harm_ecosystems',
      'service_ngtv_impacts_physcl_mntl_wlbng',
      'service_reinforce_bhvr_undrm_ftns',
      'service_perpetuates_orx_rlc_infr_ngtv_impacts'
    ];

    if (relevance != 1) {

      fieldsToDisable.forEach(field => {
        const ctrl = inputGroup.get(field);
        if (ctrl) {
          ctrl.setValue(null, { emitEvent: false });
          ctrl.disable({ emitEvent: false });
        }
      });

      inputGroup.get('productFitnessusePhase')?.setValue('', { emitEvent: false });
      inputGroup.get('productFitnessendOfLife')?.setValue('', { emitEvent: false });
    } else {
      fieldsToDisable.forEach(field => inputGroup.get(field)?.enable({ emitEvent: false }));
      this.calculateProductUsePhaseFitness(inputGroup, productGroup);
      this.calculateProductEndOfLifeFitness(inputGroup, productGroup);
    }
    this.cdr.detectChanges();
  }




  // Normalize to boolean true/false
  private normalizeToBool(val: any): boolean {
    if (val === null || val === undefined || val === '') return false;

    const strVal = val.toString().toLowerCase();

    return (
      val === true ||
      val === 1 ||
      strVal === 'yes' ||
      strVal === 'true'
    );
  }


  private isYes(val: any): boolean {
    return this.normalizeToBool(val);
  }

  private isNo(val: any): boolean {
    if (val === null || val === undefined || val === '') return false;

    const strVal = val.toString().toLowerCase();

    return (
      val === false ||
      val === 0 ||
      strVal === 'no' ||
      strVal === 'false'
    );
  }


  calculateProductUsePhaseFitness(inputGroup: FormGroup, productGroup: FormGroup): string | number {

    const productType = (productGroup.get('productType')?.value || '').toString().toLowerCase();
    const revenue = productGroup.get('revenueCost')?.value;
    // const rawRevenue = productGroup.get('revenueCost')?.value || '0';
    // const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;


    const relevance = inputGroup.get('relevance')?.value;

    const GDMMusePhase = inputGroup.get('GDMMusePhase')?.value;
    const WDKMPusePhase = inputGroup.get('WDKMPusePhase')?.value;
    const CWUILHRusePhase = inputGroup.get('CWUILHRusePhase')?.value;
    const EDVPusePhase = inputGroup.get('EDVPusePhase')?.value;
    const GFUPEusePhase = inputGroup.get('GFUPEusePhase')?.value;
    const GCSCusePhase = inputGroup.get('GCSCusePhase')?.value;
    const phycal_gd_is_an_intrmdt_gd = inputGroup.get('phycal_gd_is_an_intrmdt_gd')?.value;
    const intrmdt_gd_asses_reprvv_user = inputGroup.get('intrmdt_gd_asses_reprvv_user')?.value;
    const RPUFGusePhase = inputGroup.get('RPUFGusePhase')?.value;

    const service_result_in_negative_impacts = inputGroup.get('service_result_in_negative_impacts')?.value;
    const service_could_harm_ecosystems = inputGroup.get('service_could_harm_ecosystems')?.value;
    const service_ngtv_impacts_physcl_mntl_wlbng = inputGroup.get('service_ngtv_impacts_physcl_mntl_wlbng')?.value;
    const service_reinforce_bhvr_undrm_ftns = inputGroup.get('service_reinforce_bhvr_undrm_ftns')?.value;
    const service_perpetuates_orx_rlc_infr_ngtv_impacts = inputGroup.get('service_perpetuates_orx_rlc_infr_ngtv_impacts')?.value;


    let AF12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AF12 = '';
    }
    else if (this.isNo(phycal_gd_is_an_intrmdt_gd) && (productType.toLowerCase() == "sold or leased goods" || productType.toLowerCase() == "supplementary goods")) {
      AF12 = 1;
    }
    else {
      AF12 = 0;
    }


    let AG12: any = '';
    if (AF12 != 1) {
      AG12 = '';
    } else {
      AG12 =
        (this.isNo(GDMMusePhase) ? 1 : 0) +
        (this.isNo(WDKMPusePhase) ? 1 : 0) +
        (this.isNo(CWUILHRusePhase) ? 1 : 0) +
        (this.isNo(EDVPusePhase) ? 1 : 0) +
        (this.isNo(GFUPEusePhase) ? 1 : 0) +
        (this.isNo(GCSCusePhase) ? 1 : 0);
    }

    const AH12 = AG12 == 6 ? 1 : 0;


    let AK12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AK12 = '';
    } else if (productType.toLowerCase() == "sold or leased goods" && this.isYes(phycal_gd_is_an_intrmdt_gd)) {
      AK12 = 1;
    } else {
      AK12 = 0;
    }


    let AL12: any = '';
    if (AK12 != 1) {
      AL12 = '';
    } else {
      AL12 =
        (this.isNo(GDMMusePhase) ? 1 : 0) +
        (this.isNo(WDKMPusePhase) ? 1 : 0) +
        (this.isNo(CWUILHRusePhase) ? 1 : 0) +
        (this.isNo(EDVPusePhase) ? 1 : 0) +
        (this.isNo(GFUPEusePhase) ? 1 : 0) +
        (this.isNo(GCSCusePhase) ? 1 : 0) +
        (this.isYes(intrmdt_gd_asses_reprvv_user) ? 1 : 0) +
        (this.isNo(RPUFGusePhase) ? 1 : 0);
    }

    const AM12 = AL12 == 8 ? 1 : 0;


    let AP12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AP12 = '';
    } else if (productType.toLowerCase() == "services") {
      AP12 = 1;
    } else {
      AP12 = 0;
    }


    let AQ12: any = '';
    if (AP12 != 1) {
      AQ12 = '';
    } else {
      AQ12 =
        (this.isNo(service_result_in_negative_impacts) ? 1 : 0) +
        (this.isNo(service_could_harm_ecosystems) ? 1 : 0) +
        (this.isNo(service_ngtv_impacts_physcl_mntl_wlbng) ? 1 : 0) +
        (this.isNo(service_reinforce_bhvr_undrm_ftns) ? 1 : 0) +
        (this.isNo(service_perpetuates_orx_rlc_infr_ngtv_impacts) ? 1 : 0);
    }

    const AR12 = AQ12 == 5 ? 1 : 0;


    let result: any = '';
    if (AF12 == 1) result = AH12;
    else if (AK12 == 1) result = AM12;
    else if (AP12 == 1) result = AR12;
    else if (AF12 == '' || AK12 == '' || AP12 == '') result = '';
    let finalResult = result == 1 ? '100%' : '0%';
    inputGroup.get('productFitnessusePhase')?.setValue(finalResult, { emitEvent: false });
    return result;
  }



  calculateProductEndOfLifeFitness(inputGroup: FormGroup, productGroup: FormGroup): string | number {

    const productType = (productGroup.get('productType')?.value || '').toString().toLowerCase();
    const relevance = inputGroup.get('relevance')?.value;


    const GDMMendOfLife = inputGroup.get('GDMMendOfLife')?.value;
    const EDVendOfLife = inputGroup.get('EDVendOfLife')?.value;
    const GFUPEendOfLife = inputGroup.get('GFUPEendOfLife')?.value;
    const GCSCendOfLife = inputGroup.get('GCSCendOfLife')?.value;
    const phycal_gd_is_an_intrmdt_gd = inputGroup.get('phycal_gd_is_an_intrmdt_gd')?.value;
    const intrmdt_gd_asses_reprvv_user = inputGroup.get('intrmdt_gd_asses_reprvv_user')?.value;
    const RPUFGendOfLife = inputGroup.get('RPUFGendOfLife')?.value;


    let AF12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AF12 = '';
    } else if (this.isNo(phycal_gd_is_an_intrmdt_gd) &&
      (productType.toLowerCase() == "sold or leased goods" || productType.toLowerCase() == "supplementary goods")) {
      AF12 = 1;
    } else {
      AF12 = 0;
    }


    let AI12: any = '';
    if (AF12 !== 1) {
      AI12 = '';
    } else {
      AI12 =
        (this.isNo(GDMMendOfLife) ? 1 : 0) +
        (this.isNo(EDVendOfLife) ? 1 : 0) +
        (this.isNo(GFUPEendOfLife) ? 1 : 0) +
        (this.isNo(GCSCendOfLife) ? 1 : 0);
    }


    const AJ12 = AI12 == 4 ? 1 : 0;


    let AK12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AK12 = '';
    } else if (productType.toLowerCase() == "sold or leased goods" && this.isYes(phycal_gd_is_an_intrmdt_gd)) {
      AK12 = 1;
    } else {
      AK12 = 0;
    }


    let AN12: any = '';
    if (AK12 !== 1) {
      AN12 = '';
    } else {
      AN12 =
        (this.isNo(GDMMendOfLife) ? 1 : 0) +
        (this.isNo(EDVendOfLife) ? 1 : 0) +
        (this.isNo(GFUPEendOfLife) ? 1 : 0) +
        (this.isNo(GCSCendOfLife) ? 1 : 0) +
        (this.isYes(intrmdt_gd_asses_reprvv_user) ? 1 : 0) +
        (this.isNo(RPUFGendOfLife) ? 1 : 0);
    }


    const AO12 = AN12 == 6 ? 1 : 0;


    let AP12: any = '';
    if (relevance != 1 && !this.isYes(relevance)) {
      AP12 = '';
    } else if (productType.toLowerCase() == "services") {
      AP12 = 1;
    } else {
      AP12 = 0;
    }

    const AS12 = 1;

    let result: any = '';
    if (AF12 == 1) result = AJ12;
    else if (AK12 == 1) result = AO12;
    else if (AP12 == 1) result = AS12;
    else if (AF12 == '' || AK12 == '' || AP12 == '') result = '';
    let finalResult = result == 1 ? '100%' : '0%';
    // Set value back to form
    inputGroup.get('productFitnessendOfLife')?.setValue(finalResult, { emitEvent: false });
    return result;
  }




  calculateProgressIndicator(index: number, year: number): string {
    let numerator = 0;
    this.products.controls.forEach(productGroup => {
      const productType = (productGroup.get('productType')?.value || '').toString().toLowerCase();
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputControl => {
        const inputGroup = inputControl as FormGroup;
        const relevance = inputGroup.get('relevance')?.value;
        // const revenue = +inputGroup.get('revenue')?.value || 0;
        const rawRevenue = inputGroup.get('revenue')?.value || '0';
        const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;


        const inputYearRaw = inputGroup.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : Number(inputYearRaw) || 0;

        if (relevance == 1 && inputYear == year) {

          const usePhaseRaw = inputGroup.get('productFitnessusePhase')?.value || '0';
          const endOfLifeRaw = inputGroup.get('productFitnessendOfLife')?.value || '0';

          const usePhase = parseFloat(usePhaseRaw.toString().replace('%', '').trim()) / 100;
          const endOfLife = parseFloat(endOfLifeRaw.toString().replace('%', '').trim()) / 100;


          if (index == 0) {
            if (productType == 'sold or leased goods' || productType == 'services') {
              numerator += revenue * usePhase;
            }
          } else if (index == 1) {
            if (productType == 'sold or leased goods' || productType == 'services') {
              numerator += revenue * endOfLife;
            }
          } else if (index == 2) {
            if (productType == 'supplementary goods') {
              numerator += revenue * usePhase;
            }
          } else if (index == 3) {
            if (productType == 'supplementary goods') {
              numerator += revenue * endOfLife;
            }
          }
        }
      });
    });


    let denominator = 0;
    if (index == 0 || index == 1) {
      // denominator = this.calculateContextIndicator(0, year); 
      const ctxValue = this.calculateContextIndicator(0, year);
      denominator = parseFloat(ctxValue.toString().replace(/,/g, '')) || 0;
    } else if (index == 2 || index == 3) {
      // denominator = this.calculateContextIndicator(1, year); 
      const ctxValue = this.calculateContextIndicator(1, year);
      denominator = parseFloat(ctxValue.toString().replace(/,/g, '')) || 0;
    }

    if (!denominator || denominator == 0) return '';
    const percentage = Math.round((numerator / denominator) * 100);
    return percentage + '%';
  }

  calculateContextIndicator(index: number, year: number): string | number {
    let totalRevenue = 0;
    this.products.controls.forEach(productGroup => {
      const productType = (productGroup.get('productType')?.value || '').toString().toLowerCase();
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;

      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputControl => {
        const inputGroup = inputControl as FormGroup;
        const relevance = inputGroup.get('relevance')?.value;
        //const revenue = +inputGroup.get('revenue')?.value || 0;
        const rawRevenue = inputGroup.get('revenue')?.value || '0';
        const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;


        const inputYearRaw = inputGroup.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : Number(inputYearRaw) || 0;

        if (relevance == 1 && inputYear == year) {
          if (
            index == 0 &&
            (productType == 'sold or leased goods' || productType == 'services')
          ) {
            totalRevenue += revenue;
          } else if (index == 1 && productType == 'supplementary goods') {
            totalRevenue += revenue;
          }
        }
      });
    });

    //return totalRevenue;
    return totalRevenue == 0 ? '' : new Intl.NumberFormat('en-US').format(totalRevenue);
  }






  //  calculateDataCompleteness(year: number, index: number): string {
  // const selectedYear = year;


  // let productTypes: string[] = [];
  // if (index == 0 || index == 1) {
  //   productTypes = ['sold or leased goods', 'services'];
  // } else if (index == 2 || index == 3) {
  //   productTypes = ['supplementary goods'];
  // } else {
  //   productTypes = [(this.goal.ProgressIndicators[index]?.progress_indicator || '').toLowerCase()];
  // }

  // for (let i = this.products.length - 1; i >= 0; i--) {
  //   const site = this.products.at(i);
  //   const siteProductType = (site.get('productType')?.value || '').toString().toLowerCase();

  //   if (!productTypes.includes(siteProductType)) continue;

  //   const fitnessInputs = site.get('fitnessInputs') as FormArray;
  //   if (!fitnessInputs || !fitnessInputs.length) continue;

  //   const relevanceValues: number[] = fitnessInputs.controls
  //     .filter(input => {
  //       const inputYear = input.get('year')?.value;
  //       const inputYearVal =
  //         inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  //       return inputYearVal == selectedYear;
  //     })
  //     .map(input => input.get('relevance')?.value)
  //     .filter(val => val !== null && val !== undefined && !isNaN(val));

  //   if (relevanceValues.length > 0) {
  //     if (relevanceValues.includes(2)) return 'Calculation based on complete data';
  //     if (relevanceValues.includes(3)) return 'Calculation based on incomplete data';
  //     if (relevanceValues.includes(4)) return 'Calculation may be based on incomplete data';
  //     if (relevanceValues.every(val => val == 1)) return 'Calculation based on complete data';
  //   }
  // }

  // return '';
  // }

  calculateDataCompleteness(year: number, index: number): string {
    const selectedYear = year;


    let productTypes: string[] = [];

    if (index == 0 || index == 1) {
      productTypes = ['sold or leased goods', 'services'];
    } else if (index == 2 || index == 3) {
      productTypes = ['supplementary goods'];
    } else {
      productTypes = [(this.goal.ProgressIndicators[index]?.progress_indicator || '').toLowerCase()];
    }

    const allRelevanceValues: number[] = [];


    this.products.controls.forEach(product => {
      const productType = (product.get('productType')?.value || '').toString().toLowerCase();
      if (!productTypes.includes(productType)) return;

      const fitnessInputs = product.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevance')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(Number(relevanceVal));
          }
        }
      });
    });


    if (allRelevanceValues.length == 0) return '';

    const hasIncluded = allRelevanceValues.includes(1);
    const hasNotRelevant = allRelevanceValues.includes(2);
    const hasInsufficient = allRelevanceValues.includes(3);
    const hasOther = allRelevanceValues.includes(4);


    if (allRelevanceValues.every(v => v == 1)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.every(v => v == 2)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.length == 1) {
      const val = allRelevanceValues[0];
      switch (val) {
        case 1: return 'Calculation based on complete data';
        case 2: return 'Calculation based on complete data';
        case 3: return 'Calculation based on incomplete data';
        case 4: return 'Calculation may be based on incomplete data';
      }
    }


    if (hasIncluded && hasNotRelevant && !hasInsufficient && !hasOther) {
      return 'Calculation based on complete data';
    }


    if (hasIncluded && hasInsufficient) {
      return 'Calculation based on incomplete data';
    }


    if (hasIncluded && hasOther && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }


    if (hasNotRelevant && hasInsufficient && !hasIncluded && !hasOther) {
      return 'Calculation based on incomplete data';
    }


    if (hasNotRelevant && hasOther && !hasIncluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }


    if (hasInsufficient && hasOther && !hasIncluded) {
      return 'Calculation based on incomplete data';
    }


    if (hasInsufficient && !hasIncluded && !hasNotRelevant && !hasOther) {
      return 'Calculation based on incomplete data';
    }

    if (hasOther && !hasIncluded && !hasNotRelevant && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    return '';
  }




  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }
  onSubmit(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    const productArray = this.parentForm.get(this.arrayName) as FormArray;
    productArray.controls.forEach(productGroup => {
      productGroup.markAllAsTouched();
    });

    this.loading = true;
    const validProducts = productArray.controls
      .map(productGroup => {
        const fitnessInputs = (productGroup.get('fitnessInputs') as FormArray).controls
          .filter(input => {
            const relevance = input.get('relevance')?.value;
            const yearRaw = input.get('year')?.value;
            const isValidYear = yearRaw instanceof Date && !isNaN(yearRaw.getTime());
            return !!relevance && isValidYear;
          })
          .map(input => {
            const val = input.value;
            return {
              ...val,
              year: val.year instanceof Date ? val.year.getFullYear() : val.year,
              revenue: this.parseNumber(val.revenue),
            };
          });

        return {
          ...productGroup.value,
          fitnessInputs
        };
      })
      .filter(product => product.fitnessInputs.length > 0);

    if (validProducts.length == 0) return;


    const years = Array.from(new Set(
      validProducts.flatMap(product => product.fitnessInputs.map((fi: any) => fi.year))
    ));

    const progressIndicatorIds = this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
    const contextIndicatorIds = this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
    const goalCodeId = this.goal?.goal_code || '';

    if (this.routeId !== null && this.routeId !== undefined) {
      this.fitEntryId = this.routeId;
    }


    const progressIndicators = years.map(year => ([
      {
        id: progressIndicatorIds[0],
        score: this.calculateProgressIndicator(0, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 0)
      },
      {
        id: progressIndicatorIds[1],
        score: this.calculateProgressIndicator(1, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 1)
      },
      {
        id: progressIndicatorIds[2],
        score: this.calculateProgressIndicator(2, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 2)
      },
      {
        id: progressIndicatorIds[3],
        score: this.calculateProgressIndicator(3, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 3)
      }
    ])).flat();


    const contextIndicators = years.map(year => ([
      {
        id: contextIndicatorIds[0],
        score: this.parseNumber(this.calculateContextIndicator(0, year)),
        year
      },
      {
        id: contextIndicatorIds[1],
        score: this.parseNumber(this.calculateContextIndicator(1, year)),
        year
      }
    ])).flat();

    const formData = {
      products: validProducts,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    console.log('BE17 Form Submitted:', formData);

    this.commonService.addData('be-form/submit/be17', formData).subscribe(
      response => {
        if (showMessageAndRedirect) {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/be-form']);
          }, 2000);
        }

      },
      error => {
        console.error('An error occurred:', error);
        this._snackBar.open('Something went wrong. Please try again.', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customErrorClass']
        });
        this.loading = false;
      }
    );
  }



  isAtLeastOneProductValid(): boolean {
    const productArray = this.parentForm.get(this.arrayName) as FormArray;
    return productArray.controls.some(productGroup => !!productGroup.get('relevance')?.value);
  }
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }

  getFitnessInputs(product: AbstractControl): FormArray {
    return product.get('fitnessInputs') as FormArray;
  }
  addFitnessInput(productIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const inputs = productGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    // this.initializeSiteFitnessWatchers();
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      // year: [data?.year || new Date().getFullYear()],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      revenue: [data?.revenue || null],
      relevance: [data?.relevance || '', Validators.required],
      GDMMusePhase: [data?.GDMMMusePhase ?? null],
      GDMMendOfLife: [data?.GDMMendOfLife ?? null],
      WDKMPusePhase: [data?.WDKMPusePhase ?? null],
      CWUILHRusePhase: [data?.CWUILHRusePhase ?? null],
      EDVPusePhase: [data?.EDVPusePhase ?? null],
      EDVendOfLife: [data?.EDVendOfLife ?? null],
      GFUPEusePhase: [data?.GFUPEusePhase ?? null],
      GFUPEendOfLife: [data?.GFUPEendOfLife ?? null],
      GCSCusePhase: [data?.GCSCusePhase ?? null],
      GCSCendOfLife: [data?.GCSCendOfLife ?? null],
      phycal_gd_is_an_intrmdt_gd: [data?.intermediate_physical ?? null],
      intrmdt_gd_asses_reprvv_user: [data?.intermediate_representative ?? null],
      RPUFGusePhase: [data?.intermediate_classified_use ?? null],
      RPUFGendOfLife: [data?.intermediate_classified_end ?? null],

      service_result_in_negative_impacts: [data?.services_negative ?? null],
      service_could_harm_ecosystems: [data?.services_harm ?? null],
      service_ngtv_impacts_physcl_mntl_wlbng: [data?.services_physical ?? null],
      service_reinforce_bhvr_undrm_ftns: [data?.services_behaviours ?? null],
      service_perpetuates_orx_rlc_infr_ngtv_impacts: [data?.services_infrastructure ?? null],
      productFitnessusePhase: [data?.product_fitness_usephase || 0],
      productFitnessendOfLife: [data?.product_fitness_end || 0],



      comments: [data?.comments || '']
    });
  }
  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
  }

  removeFitnessInput(productIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const inputs = productGroup.get('fitnessInputs') as FormArray;
    const inputGroup = inputs.at(inputIndex) as FormGroup;
    const inputId = inputGroup.get('id')?.value;

    Swal.fire({
      title: 'Are you sure you want to delete this record?',
      text: 'Once deleted, this data cannot be recovered.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {

        if (!inputId || inputId == 0) {
          if (inputs.length > 1) {
            inputs.removeAt(inputIndex);
          } else {
            this._snackBar.open('At least one input is required.', 'Close', { duration: 3000 });
          }
          return;
        }

        this.commonService.postData('be-form/soft-delete', {
          id: inputId,
          form: 'be17'
        }).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('Deleted!', 'Your data has been successfully deleted', 'success');
              inputs.removeAt(inputIndex);
              this.onSubmit(false);
              this.loading = false;
            } else {
              Swal.fire('Error', res.message || 'Delete failed.', 'error');
            }
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Something went wrong while deleting.', 'error');
          }
        });
      }
    });
  }

  get uniqueYearsFromFitnessInputs(): number[] {
    const yearsSet = new Set<number>();

    this.products.controls.forEach(product => {
      const fitnessInputs = product.get('fitnessInputs') as FormArray;
      fitnessInputs.controls.forEach(input => {
        const yearVal = input.get('year')?.value;
        const relevanceVal = input.get('relevance')?.value;
        let year: number | null = null;

        if (yearVal instanceof Date) {
          year = yearVal.getFullYear();
        } else if (typeof yearVal === 'number') {
          year = yearVal;
        } else if (typeof yearVal === 'string' && yearVal.length === 4) {
          year = parseInt(yearVal, 10);
        }

        const isRelevanceValid =
          relevanceVal !== null &&
          relevanceVal !== undefined &&
          relevanceVal !== '' &&
          relevanceVal != 0;

        if (year && !isNaN(year) && isRelevanceValid) {
          yearsSet.add(year);
        }
      });
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }


  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value; // skip formatting for text like "Error"
    return num.toLocaleString('en-US'); // adds commas (12,000)
  }

  private formatCalculatedRevenueFields(inputGroup: FormGroup): void {
    const fieldNames = ['revenue']; //  field to format in BE15
    fieldNames.forEach(name => {
      const control = inputGroup.get(name);
      if (control) {
        const formattedValue = this.formatNumberForDisplay(control.value);
        control.setValue(formattedValue, { emitEvent: false });
      }
    });
  }
  setYear(event: any, datepicker: any, productIndex: number, inputIndex: number): void {
    let selectedYear: number;

    //  Extract the year properly based on picker or manual input
    if (event && typeof event.year === 'function') {
      selectedYear = event.year();
    } else if (typeof event === 'number') {
      selectedYear = event;
    } else if (event instanceof Date) {
      selectedYear = event.getFullYear();
    } else {
      console.error('Unexpected yearSelected event value:', event);
      return;
    }

    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    //  Prevent duplicate years within same product
    const isDuplicate = fitnessInputs.controls.some((input, idx) => {
      if (idx == inputIndex) return false;
      const yearVal = input.get('year')?.value;
      const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
      return year == selectedYear;
    });

    if (isDuplicate) {
      inputGroup.get('year')?.setValue(null);
      inputGroup.get('year')?.setErrors({ duplicateYear: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker.close();
      return;
    }

    //  Set selected year to control
    const dateForInput = new Date(selectedYear, 0, 1);
    const yearControl = inputGroup.get('year');
    yearControl?.setValue(dateForInput);
    yearControl?.setErrors(null);
    datepicker.close();

    //  Fetch productYearMap (like in BE15)
    const productYearMap = productGroup.get('productYearMap')?.value || {};
    const matchedRevenue = productYearMap[selectedYear] ?? null;

    //  Auto-fill revenue based on map data
    if (matchedRevenue) {
      inputGroup.get('revenue')?.setValue(matchedRevenue, { emitEvent: false });
      this.formatCalculatedRevenueFields(inputGroup);
    } else {
      inputGroup.get('revenue')?.reset('', { emitEvent: false });
    }

    //  Recalculate all dependent logic after year selection
    this.recalculateFitness(productIndex, inputIndex);

    //  Trigger progress indicator recalculation for selected year
    this.calculateProgressIndicator(productIndex, selectedYear);

    //  Force re-render if needed
    this.cdr.detectChanges();
  }


  onYearTyped(event: Event, productIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, productIndex, inputIndex);
    }
  }
  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }




}

