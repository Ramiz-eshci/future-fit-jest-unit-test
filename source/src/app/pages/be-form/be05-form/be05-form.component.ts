
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
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
  selector: 'app-be05-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    MatIconModule,
    MaterialModule,
    NgApexchartsModule
  ],
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
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // en-GB gives DD/MM/YYYY by default
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './be05-form.component.html',
  styleUrl: './be05-form.component.scss'
})
export class Be05FormComponent implements OnInit, OnChanges {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;

  relevantsArr: any = []
  loading: boolean = false;
  showIndicators: boolean = false;
  routeId: any = '';
  gaseousCompleteness: string = '';
  liquidCompleteness: string = '';
  solidCompleteness: string = '';
  ref_data: any = [];
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  activeTab: 'progress' | 'context' = 'progress';
  contextUnit: string = '';

  get sites(): FormArray {
    // return this.parentForm.get(this.arrayName) as FormArray;
    // console.log(this.parentForm,'-----parent form222')
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }




  constructor(private cdr: ChangeDetectorRef, private commonService: CommonService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {

    this.routeId = this.route.snapshot.paramMap.get('editFitId');

    this.commonService.getData('list/relevanaceBE05').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });




  }
  ngOnInit(): void {
    setTimeout(() => {
      if (this.sites?.length > 0) {
        this.loadReferenceYears();
      }
    }, 0);
  }
  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.loadReferenceYears();
    }, 0);
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

  prepareChartData() {

    const years = [...this.uniqueYearsFromFitnessInputs].sort((a, b) => a - b);

    const gaseousProgress = years.map(year => {
      const value = this.calculateProgressIndicator(0, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const liquidProgress = years.map(year => {
      const value = this.calculateProgressIndicator(1, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const solidProgress = years.map(year => {
      const value = this.calculateProgressIndicator(2, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const gaseousContext = years.map(year =>
      Number(this.calculateContextIndicator(0, year).replace(/,/g, ''))
    );

    const liquidContext = years.map(year =>
      Number(this.calculateContextIndicator(1, year).replace(/,/g, ''))
    );

    const solidContext = years.map(year =>
      Number(this.calculateContextIndicator(2, year).replace(/,/g, ''))
    );

    this.chartOptions = {

      series: [

        {
          name: 'Harmful Gaseous Emissions',
          type: 'column',
          data: gaseousContext,
          color: '#2E7D32'
        },

        {
          name: 'Harmful Liquid Emissions',
          type: 'column',
          data: liquidContext,
          color: '#29B6F6'
        },

        {
          name: 'Harmful Solid Emissions',
          type: 'column',
          data: solidContext,
          color: '#8E24AA'
        },

        {
          name: 'Gaseous Emissions',
          type: 'line',
          data: gaseousProgress,
          color: '#1565C0'
        },

        {
          name: 'Liquid Emissions',
          type: 'line',
          data: liquidProgress,
          color: '#EF6C00'
        },

        {
          name: 'Solid Emissions',
          type: 'line',
          data: solidProgress,
          color: '#D81B60'
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
        width: [0, 0, 0, 3, 3, 3],
        curve: 'straight'
      },

      markers: {
        size: [0, 0, 0, 4, 4, 4]
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
          seriesName: ['Gaseous Emissions', 'Liquid Emissions', 'Solid Emissions'],
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
          seriesName: ['Harmful Gaseous Emissions', 'Harmful Liquid Emissions', 'Harmful Solid Emissions'],
          opposite: true,

          title: {
            text: 'Emissions'
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

            console.log(opts, '====opts.seriesIndex')

            if (opts.seriesIndex === 3 || opts.seriesIndex === 4 || opts.seriesIndex === 5) {
              return value + '%';
            }

            return Number(value).toLocaleString();
            // const seriesName = opts.w.config.series[opts.seriesIndex].name;

            // switch (seriesName) {

            //   case 'Solid Emissions':
            //   case 'Liquid Emissions':
            //   case 'Gaseous Emissions':
            //     return value + '%';

            //   default:
            //     return value.toLocaleString() + ' ' + this.contextUnit;
            // }

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

  // loadReferenceYears(): void {
  //   this.sites.controls.forEach((site, siteIndex) => {
  //     const site_id = site.get('site_id')?.value;

  //     this.commonService.getData(`reference-year/getById/${site_id}`).subscribe((response) => {
  //       const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //       if (fitnessInputs && fitnessInputs.length > 0) {
  //         fitnessInputs.controls.forEach((input, inputIndex) => {
  //           if (response.status === true && response.data.length > 0) {
  //             const ref = response.data[0];

  //             input.get('gaseousReferenceYear')?.setValue(
  //               this.formatNumberWithCommas(ref.be05gaseous_ref_year_value) || '',
  //               { emitEvent: false }
  //             );
  //             input.get('liquidReferenceYear')?.setValue(
  //               this.formatNumberWithCommas(ref.be05liquid_ref_year_value) || '',
  //               { emitEvent: false }
  //             );
  //             input.get('solidReferenceYear')?.setValue(
  //               this.formatNumberWithCommas(ref.be05solid_ref_year_value) || '',
  //               { emitEvent: false }
  //             );

  //             input.get('liquidemissionyear')?.setValue(ref.be05liquid_ref_year || '', { emitEvent: false });
  //             input.get('Solidemissionyear')?.setValue(ref.be05solid_reference_year || '', { emitEvent: false });
  //             input.get('Gaseousemissionyear')?.setValue(ref.be05gaseous_ref_year || '', { emitEvent: false });


  //           } else {
  //             input.get('gaseousReferenceYear')?.setValue('', { emitEvent: false });
  //             input.get('liquidReferenceYear')?.setValue('', { emitEvent: false });
  //             input.get('solidReferenceYear')?.setValue('', { emitEvent: false });

  //             input.get('liquidemissionyear')?.setValue('', { emitEvent: false });
  //             input.get('Solidemissionyear')?.setValue('', { emitEvent: false });
  //             input.get('Gaseousemissionyear')?.setValue('', { emitEvent: false });
  //           }


  //           this.calculateSiteFitness(siteIndex, inputIndex);
  //           this.calculateLiquidSiteFitness(siteIndex, inputIndex);
  //           this.calculateSolidSiteFitness(siteIndex, inputIndex)
  //         });
  //       }
  //     });
  //   });
  // }
  loadReferenceYears(): void {
    const checkReady = () => {
      if (this.sites?.length > 0 && this.sites.controls.every(site => {
        const fitnessInputs = site.get('fitnessInputs') as FormArray;
        return fitnessInputs && fitnessInputs.length > 0;
      })) {

        this.sites.controls.forEach((site, siteIndex) => {
          const site_id = site.get('site_id')?.value;

          this.commonService.getData(`reference-year/getById/${site_id}`).subscribe((response) => {
            const fitnessInputs = site.get('fitnessInputs') as FormArray;

            if (fitnessInputs && fitnessInputs.length > 0) {
              fitnessInputs.controls.forEach((input, inputIndex) => {
                if (response.status === true && response.data.length > 0) {
                  const ref = response.data[0];

                  input.get('gaseousReferenceYear')?.setValue(
                    this.formatNumberWithCommas(ref.be05gaseous_ref_year_value) || '',
                    { emitEvent: false }
                  );
                  input.get('liquidReferenceYear')?.setValue(
                    this.formatNumberWithCommas(ref.be05liquid_ref_year_value) || '',
                    { emitEvent: false }
                  );
                  input.get('solidReferenceYear')?.setValue(
                    this.formatNumberWithCommas(ref.be05solid_ref_year_value) || '',
                    { emitEvent: false }
                  );

                  input.get('liquidemissionyear')?.setValue(ref.be05liquid_ref_year || '', { emitEvent: false });
                  input.get('Solidemissionyear')?.setValue(ref.be05solid_reference_year || '', { emitEvent: false });
                  input.get('Gaseousemissionyear')?.setValue(ref.be05gaseous_ref_year || '', { emitEvent: false });

                } else {
                  input.get('gaseousReferenceYear')?.setValue('', { emitEvent: false });
                  input.get('liquidReferenceYear')?.setValue('', { emitEvent: false });
                  input.get('solidReferenceYear')?.setValue('', { emitEvent: false });

                  input.get('liquidemissionyear')?.setValue('', { emitEvent: false });
                  input.get('Solidemissionyear')?.setValue('', { emitEvent: false });
                  input.get('Gaseousemissionyear')?.setValue('', { emitEvent: false });
                }

                this.calculateSiteFitness(siteIndex, inputIndex);
                this.calculateLiquidSiteFitness(siteIndex, inputIndex);
                this.calculateSolidSiteFitness(siteIndex, inputIndex);
              });
            }
          });
        });
      } else {

        setTimeout(checkReady, 200);
      }
    };

    checkReady();
  }
  getContextDescription(year: number): { siteName: string; contextDescription: string }[] {
    if (!this.sites?.length) return [];

    const entries: any[] = [];

    this.sites.controls.forEach((site: AbstractControl) => {

      const siteGroup = site as FormGroup;
      const siteName = siteGroup.get('siteName')?.value;

      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {
        const yearVal = input.get('year')?.value;
        const inputYear =
          yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);

        const desc = input.get('contextDescription')?.value?.trim();

        if (inputYear == year && desc) {
          entries.push({
            siteName,
            contextDescription: desc
          });
        }
      });

    });

    return entries;
  }






  private formatNumberWithCommas(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  }
  get uniqueYearsFromFitnessInputs(): number[] {
    const yearsSet = new Set<number>();

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      fitnessInputs.controls.forEach(input => {
        const yearVal = input.get('year')?.value;
        const relevanceGaseous = input.get('relevanceGaseous')?.value;
        const relevanceLiquid = input.get('relevanceLiquid')?.value;
        const relevanceSolid = input.get('relevanceSolid')?.value;
        let year: number | null = null;
        if (yearVal instanceof Date) {
          year = yearVal.getFullYear();
        } else if (typeof yearVal === 'number') {
          year = yearVal;
        } else if (typeof yearVal === 'string' && yearVal.length === 4) {
          year = parseInt(yearVal, 10);
        }


        const isRelevanceValid =
          [relevanceGaseous, relevanceLiquid, relevanceSolid].some(
            val => val !== null && val !== undefined && val !== '' && val != 0
          );

        if (year && !isNaN(year) && isRelevanceValid) {
          yearsSet.add(year);
        }
      });
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }

  getlatestYeardata() {
    const allYears = this.uniqueYearsFromFitnessInputs;
    this.topYear = allYears[0];
    this.remainingYears = allYears.slice(1);
  }
  onNumberInput(event: any, formGroup: FormGroup, fieldName: string): void {
    const rawValue = event.target.value.replace(/,/g, '');
    const numberValue = Number(rawValue);


    if (!isNaN(numberValue)) {
      formGroup.get(fieldName)?.setValue(numberValue);
      event.target.value = this.formatNumber(numberValue);
    }


  }
  formatNumber(value: any): string {
    if (value === null || value === undefined) return '';
    // Remove commas and convert to number before formatting
    const num = Number(String(value).replace(/,/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('en-US');
  }
  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
  }
  setYear(event: any, datepicker: any, siteIndex: number, inputIndex: number): void {
    let selectedYear: number;

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

    const fitnessInputs = this.sites.at(siteIndex).get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const isDuplicate = fitnessInputs.controls.some((input, idx) => {
      if (idx === inputIndex) return false;
      const yearVal = input.get('year')?.value;
      const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
      return year === selectedYear;
    });

    if (isDuplicate) {

      inputGroup.get('year')?.setValue(null);
      inputGroup.get('year')?.setErrors({ duplicateYear: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker.close();
      return;
    }
    const ghgRefYear = inputGroup.get('Gaseousemissionyear')?.value;
    const ghgRefYearNum = ghgRefYear ? Number(ghgRefYear) : null;


    if (ghgRefYearNum && selectedYear <= ghgRefYearNum) {
      inputGroup.get('year')?.setValue(null);
      inputGroup.get('year')?.setErrors({ lessThanReference: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker.close();
      return;
    }


    const dateForInput = new Date(selectedYear, 0, 1);
    const yearControl = inputGroup.get('year');
    yearControl?.setValue(dateForInput);
    yearControl?.setErrors(null);
    datepicker.close();
    const years = this.uniqueYearsFromFitnessInputs;
  }
  onYearTyped(event: Event, siteIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, siteIndex, inputIndex);
    }
  }


  // calculateSiteFitness(index: number, inputIndex: number): void {
  //   console.log(index, '====indexxx')
  //   const siteGroup = this.sites.at(index);
  //   const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //   fitnessInputs.controls.forEach(input => {
  //     const inputGroup = input as FormGroup;

  //     const relevance = inputGroup.get('relevanceGaseous')?.value;
  //     const refYearRaw = inputGroup.get('gaseousReferenceYear')?.value;
  //     const reportYearRaw = inputGroup.get('gaseousReportingYear')?.value;

  //     const refYear = +refYearRaw;
  //     const reportYear = +reportYearRaw;
  //     let fitness: string = '';

  //     if ([2, 3, 4, 5].includes(relevance)) {

  //      // inputGroup.get('gaseousReferenceYear')?.setValue('', { emitEvent: false });
  //       inputGroup.get('gaseousReportingYear')?.setValue('', { emitEvent: false });
  //       fitness = relevance === 2 ? '100%' : '';
  //     } else if (relevance !== 1) {
  //       fitness = '';
  //     } else if (
  //       refYearRaw === '' || refYearRaw == null ||
  //       reportYearRaw === '' || reportYearRaw == null
  //     ) {
  //       inputGroup.get('gaseousReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
  //       fitness = '';
  //     } else if (reportYear > refYear) {
  //       fitness = '';
  //     } else {
  //       const percent = Math.round(((refYear - reportYear) / refYear) * 100);
  //       fitness = percent + '%';
  //     }
  //     inputGroup.get('gaseousSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });
  //   });

  //   const years = this.uniqueYearsFromFitnessInputs;


  // } 
  calculateSiteFitness(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

    fitnessInputs.controls.forEach(input => {
      const inputGroup = input as FormGroup;

      const relevance = inputGroup.get('relevanceGaseous')?.value;
      const refYearRaw = inputGroup.get('gaseousReferenceYear')?.value;
      const reportYearRaw = inputGroup.get('gaseousReportingYear')?.value;
      const refYear = this.parseNumber(refYearRaw);
      const reportYear = this.parseNumber(reportYearRaw);

      let fitness: string = '';

      if ([2, 3, 4, 5].includes(relevance)) {
        inputGroup.get('gaseousReportingYear')?.setValue('', { emitEvent: false });
        fitness = relevance === 2 ? '100%' : '';
      }
      else if (relevance !== 1) {
        fitness = '';
      }
      else if (relevance === 1) {
        if (refYearRaw === '' || refYearRaw == null) {
          inputGroup.get('gaseousReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
        }

        if (!isNaN(reportYear)) {
          if (reportYear > refYear) {
            fitness = '0%';
          } else {
            const percent = Math.round(((refYear - reportYear) / refYear) * 100);
            fitness = percent + '%';
          }
        } else {
          fitness = '';
        }
      }

      inputGroup.get('gaseousSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });
    });

    const years = this.uniqueYearsFromFitnessInputs;
  }


  // calculateLiquidSiteFitness(index: number, inputIndex: number): void {

  //   const siteGroup = this.sites.at(index);
  //   const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //   const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

  //   const relevance = inputGroup.get('relevanceLiquid')?.value;
  //   const refYearRaw = inputGroup.get('liquidReferenceYear')?.value;
  //   const reportYearRaw = inputGroup.get('liquidReportingYear')?.value;

  //   let fitness: string = '';
  //   const refYear = +refYearRaw;
  //   const reportYear = +reportYearRaw;

  //   if ([2, 3, 4, 5].includes(relevance)) {
  //    // inputGroup.get('liquidReferenceYear')?.setValue('', { emitEvent: false });
  //     inputGroup.get('liquidReportingYear')?.setValue('', { emitEvent: false });
  //     fitness = relevance === 2 ? '100%' : '';
  //   } else if (relevance !== 1) {
  //     fitness = '';
  //   } else if (
  //     refYearRaw === '' || refYearRaw == null ||
  //     reportYearRaw === '' || reportYearRaw == null
  //   ) {
  //     inputGroup.get('liquidReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
  //     fitness = '';
  //   } else if (reportYear > refYear) {
  //     fitness = '0%';
  //   } else {
  //     const percent = Math.round(((refYear - reportYear) / refYear) * 100);
  //     fitness = percent + '%';
  //   }


  //   inputGroup.get('liquidSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });

  // }
  calculateLiquidSiteFitness(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevanceLiquid')?.value;
    const refYearRaw = inputGroup.get('liquidReferenceYear')?.value;
    const reportYearRaw = inputGroup.get('liquidReportingYear')?.value;

    // Parse numbers safely (commas remove, empty safe)
    const refYear = this.parseNumber(refYearRaw);
    const reportYear = this.parseNumber(reportYearRaw);

    let fitness: string = '';

    if ([2, 3, 4, 5].includes(relevance)) {
      inputGroup.get('liquidReportingYear')?.setValue('', { emitEvent: false });
      fitness = relevance === 2 ? '100%' : '';
    }
    else if (relevance !== 1) {
      fitness = '';
    }
    else if (relevance === 1) {
      if (refYearRaw === '' || refYearRaw == null) {
        inputGroup.get('liquidReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
      }

      if (!isNaN(reportYear)) {
        if (reportYear > refYear) {
          fitness = '0%';
        } else {
          const percent = Math.round(((refYear - reportYear) / refYear) * 100);
          fitness = percent + '%';
        }
      } else {
        fitness = '';
      }
    }

    inputGroup.get('liquidSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });
  }


  // calculateSolidSiteFitness(index: number, inputIndex: number): void {
  //   const siteGroup = this.sites.at(index);
  //   const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //   const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
  //   fitnessInputs.controls.forEach(inputGroup => {

  //     const relevance = inputGroup.get('relevanceSolid')?.value;
  //     const refYearRaw = inputGroup.get('solidReferenceYear')?.value;
  //     const reportYearRaw = inputGroup.get('solidReportingYear')?.value;

  //     let fitness: string = '';
  //     const refYear = +refYearRaw;
  //     const reportYear = +reportYearRaw;

  //     if ([2, 3, 4, 5].includes(relevance)) {

  //      // inputGroup.get('solidReferenceYear')?.setValue('', { emitEvent: false });
  //       inputGroup.get('solidReportingYear')?.setValue('', { emitEvent: false });
  //       fitness = relevance === 2 ? '100%' : '';
  //     } else if (relevance !== 1) {

  //       fitness = '';
  //     } else if (
  //       refYearRaw === '' || refYearRaw == null ||
  //       reportYearRaw === '' || reportYearRaw == null
  //     ) {
  //       inputGroup.get('solidReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
  //       fitness = '';
  //     } else if (reportYear > refYear) {
  //       fitness = '0%';
  //     } else {
  //       const percent = Math.round(((refYear - reportYear) / refYear) * 100);
  //       fitness = percent + '%';
  //     }


  //     inputGroup.get('solidSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });
  //   });

  // }
  calculateSolidSiteFitness(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

    fitnessInputs.controls.forEach(inputGroup => {
      const relevance = inputGroup.get('relevanceSolid')?.value;
      const refYearRaw = inputGroup.get('solidReferenceYear')?.value;
      const reportYearRaw = inputGroup.get('solidReportingYear')?.value;


      const refYear = this.parseNumber(refYearRaw);
      const reportYear = this.parseNumber(reportYearRaw);

      let fitness: string = '';

      if ([2, 3, 4, 5].includes(relevance)) {
        inputGroup.get('solidReportingYear')?.setValue('', { emitEvent: false });
        fitness = relevance === 2 ? '100%' : '';
      }
      else if (relevance !== 1) {
        fitness = '';
      }
      else if (relevance === 1) {

        if (refYearRaw === '' || refYearRaw == null) {
          inputGroup.get('solidReferenceYear')?.setValue(this.ref_data.ref_year_value, { emitEvent: false });
        }


        if (!isNaN(reportYear)) {
          if (reportYear > refYear) {
            fitness = '0%';
          } else {
            const percent = Math.round(((refYear - reportYear) / refYear) * 100);
            fitness = percent + '%';
          }
        } else {
          fitness = '';
        }
      }

      inputGroup.get('solidSiteFitnessPercent')?.setValue(fitness, { emitEvent: false });
    });
  }


  // calculateProgressIndicator(index: number): string {
  //   let totalReference = 0;
  //   let totalReporting = 0;
  //   let errorFound = false;
  //   let includedWithEmissions = 0;
  //   let includedNoEmissions = 0;

  //   this.sites.controls.forEach(site => {
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //     if (fitnessInputs && fitnessInputs.controls.length > 0) {
  //       fitnessInputs.controls.forEach(input => {
  //         if (index === 0) {
  //           // Gaseous
  //           const relevance = input.get('relevanceGaseous')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReference += +input.get('gaseousReferenceYear')?.value || 0;
  //             totalReporting += +input.get('gaseousReportingYear')?.value || 0;
  //           }
  //         }

  //         if (index === 1) {
  //           // Liquid
  //           const relevance = input.get('relevanceLiquid')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReference += +input.get('liquidReferenceYear')?.value || 0;
  //             totalReporting += +input.get('liquidReportingYear')?.value || 0;
  //           }
  //         }

  //         if (index === 2) {
  //           // Solid
  //           const relevance = input.get('relevanceSolid')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReference += +input.get('solidReferenceYear')?.value || 0;
  //             totalReporting += +input.get('solidReportingYear')?.value || 0;
  //           }
  //         }
  //       });
  //     }
  //   });

  //   // 100% if only "no emissions" entries exist
  //   if (includedNoEmissions > 0 && includedWithEmissions === 0) {
  //     return '100%';
  //   }

  //   if (totalReporting > totalReference) return '0%';
  //   if (totalReference === 0) return '';

  //   const percentage = Math.round(((totalReference - totalReporting) / totalReference) * 100);
  //   return percentage + '%';
  // }
  calculateProgressIndicator(index: number, year: number): string {
    let totalReference = 0;
    let totalReporting = 0;
    let includedWithEmissions = 0;
    let includedNoEmissions = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (fitnessInputs && fitnessInputs.controls.length > 0) {
        fitnessInputs.controls.forEach(input => {

          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;

          if (year && inputYearVal !== year) return;

          if (index === 0) {
            // Gaseous
            const relevance = input.get('relevanceGaseous')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReference += this.parseNumber(input.get('gaseousReferenceYear')?.value);
              totalReporting += this.parseNumber(input.get('gaseousReportingYear')?.value);
            }
          }

          if (index === 1) {
            // Liquid
            const relevance = input.get('relevanceLiquid')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReference += this.parseNumber(input.get('liquidReferenceYear')?.value);
              totalReporting += this.parseNumber(input.get('liquidReportingYear')?.value);
            }
          }

          if (index === 2) {
            // Solid
            const relevance = input.get('relevanceSolid')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReference += this.parseNumber(input.get('solidReferenceYear')?.value);
              totalReporting += this.parseNumber(input.get('solidReportingYear')?.value);
            }
          }
        });
      }
    });

    // 100% if only "no emissions" entries exist
    if (includedNoEmissions > 0 && includedWithEmissions === 0) {
      return '100%';
    }

    if (totalReporting > totalReference) return '0%';
    if (totalReference === 0) return '';

    const percentage = Math.round(((totalReference - totalReporting) / totalReference) * 100);
    return percentage + '%';
  }




  // calculateContextIndicator(index: number): string {
  //   let totalReporting = 0;
  //   let includedWithEmissions = 0;
  //   let includedNoEmissions = 0;

  //   this.sites.controls.forEach(site => {
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //     if (fitnessInputs && fitnessInputs.length > 0) {
  //       fitnessInputs.controls.forEach(input => {
  //         if (index === 0) {
  //           const relevance = input.get('relevanceGaseous')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReporting += +input.get('gaseousReportingYear')?.value || 0;
  //           }
  //         }

  //         if (index === 1) {
  //           const relevance = input.get('relevanceLiquid')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReporting += +input.get('liquidReportingYear')?.value || 0;
  //           }
  //         }

  //         if (index === 2) {
  //           const relevance = input.get('relevanceSolid')?.value;
  //           if (relevance == 2) includedNoEmissions++;
  //           if (relevance == 1) {
  //             includedWithEmissions++;
  //             totalReporting += +input.get('solidReportingYear')?.value || 0;
  //           }
  //         }
  //       });
  //     }
  //   });

  //   if (includedNoEmissions > 0 && includedWithEmissions === 0) {
  //     return '0';
  //   }

  //   return totalReporting > 0 ? totalReporting.toString() : '0';
  // }
  calculateContextIndicator(index: number, year: number | null): string {
    if (index == 3) {
      return 'Description of emissions occurring during incidents such as spills and leaks';
    }
    let totalReporting = 0;
    let includedWithEmissions = 0;
    let includedNoEmissions = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (fitnessInputs && fitnessInputs.length > 0) {
        fitnessInputs.controls.forEach(input => {
          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
          const isYearMatched = year == null || inputYearVal === year;

          if (!isYearMatched) return;

          if (index === 0) {
            const relevance = input.get('relevanceGaseous')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReporting += +input.get('gaseousReportingYear')?.value || 0;
            }
          }

          if (index === 1) {
            const relevance = input.get('relevanceLiquid')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReporting += +input.get('liquidReportingYear')?.value || 0;
            }
          }

          if (index === 2) {
            const relevance = input.get('relevanceSolid')?.value;
            if (relevance == 2) includedNoEmissions++;
            if (relevance == 1) {
              includedWithEmissions++;
              totalReporting += +input.get('solidReportingYear')?.value || 0;
            }
          }

        });
      }
    });

    if (includedNoEmissions > 0 && includedWithEmissions === 0) {
      return '0';
    }

    return totalReporting > 0
      ? new Intl.NumberFormat('en-US').format(totalReporting)
      : '0';
  }
  parseNumber(val: any): number {
    return Number(val?.toString().replace(/,/g, '')) || 0;
  }
  switchTab(tab: 'progress' | 'context') {
    this.activeTab = tab;
  }


  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id == id);
    return match ? match.name : 'Not set';
  }

  // submitForm() {
  //   const siteArray = this.parentForm.get(this.arrayName) as FormArray;

  //   siteArray.controls.forEach(siteGroup => {
  //     siteGroup.markAllAsTouched();
  //   });

  //   const validSites = siteArray.controls
  //     .map(siteGroup => {
  //       const site = siteGroup.value;
  //       return {
  //         ...site,
  //         fitnessInputs: (siteGroup.get('fitnessInputs') as FormArray).getRawValue()
  //       };
  //     });

  //   const atLeastOneValid = validSites.length > 0;
  //   if (atLeastOneValid) {
  //     const progressIndicator_Gaseous_emissions = this.calculateProgressIndicator(0);
  //     const progressIndicator_Liquid_emissions = this.calculateProgressIndicator(1);
  //     const progressIndicator_Solid_emissions = this.calculateProgressIndicator(2);

  //     const contextIndixator_Total_harmful_gas = this.calculateContextIndicator(0);
  //     const contextIndixator_liquid_gas = this.calculateContextIndicator(1);
  //     const contextIndixator_solid = this.calculateContextIndicator(2);
  //     const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
  //     const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
  //     const goalCodeId = this.goal.goal_code;
  //     if (this.routeId !== null && this.routeId !== undefined) {
  //       this.fitEntryId = this.routeId; // Convert to number if routeId is not null or undefined
  //     }

  //     const formData = {
  //       sites: validSites,
  //       progressIndicator_Gaseous_emissions,
  //       progressIndicator_Liquid_emissions,
  //       progressIndicator_Solid_emissions,

  //       contextIndixator_Total_harmful_gas,
  //       contextIndixator_liquid_gas,
  //       contextIndixator_solid,
  //       data_completeness: {
  //         gaseous_emissions: this.calculateDataCompletenessForGaseous(),
  //         liquid_emissions: this.calculateDataCompletenessForLiquid(),
  //         solid_emissions: this.calculateDataCompletenessForSolid()
  //       },
  //       progress_indicator_ids: progressIndicatorIds,
  //       context_indicator_ids: contextIndicatorIds,
  //       goalCode_id: goalCodeId,
  //       fit_entry_id: this.fitEntryId
  //     };


  //     console.log('BE05 Form Submitted:', formData);
  //     //  

  //     this.commonService.addData('be-form/submit/be05', formData).subscribe(
  //       response => {
  //         this._snackBar.open(response.message, '', {
  //           duration: 2000,
  //           verticalPosition: 'top',
  //           horizontalPosition: 'end',
  //           panelClass: ['customSuccessClass']
  //         });
  //         // this.resetBE05FormFields()
  //         setTimeout(() => {
  //           this.loading = false;
  //           this.router.navigate(['/be-form']);
  //         }, 2000);
  //         // this.formSubmitted.emit({
  //         //   fitEntryId: this.fitEntryId,        // whatever your logic
  //         //   nextForm: 'BE06'                    // or dynamic based on logic
  //         // });
  //       },
  //       error => {
  //         console.error('An error occurred:', error);
  //       }
  //     );
  //   }
  // }
  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    this.formSubmittedFlag = true;

    const siteArray = this.parentForm.get(this.arrayName) as FormArray;

    siteArray.controls.forEach(siteGroup => {
      siteGroup.markAllAsTouched();
    });
    this.loading = true;
    // Valid fitness inputs filter karo jaise BE02 me:
    const validSites = siteArray.controls
      .map(siteGroup => {
        const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

        const validFitnessInputs = fitnessInputs.controls.filter(input => {
          const relevance = input.get('relevanceGaseous')?.value;
          const relevanceLiquid = input.get('relevanceLiquid')?.value;
          const relevanceSolid = input.get('relevanceSolid')?.value;
          const year = input.get('year')?.value;
          const isValidYear = year instanceof Date && !isNaN(year.getTime());
          return !!relevance && !!relevanceLiquid && !!relevanceSolid && isValidYear;
        }).map(input => {
          const val = input.value;
          return {
            ...val,
            year: (val.year instanceof Date) ? val.year.getFullYear() : val.year,
            gaseousReferenceYear: this.parseNumber(val.gaseousReferenceYear),
            gaseousReportingYear: this.parseNumber(val.gaseousReportingYear),

            liquidReferenceYear: this.parseNumber(val.liquidReferenceYear),
            liquidReportingYear: this.parseNumber(val.liquidReportingYear),

            solidReferenceYear: this.parseNumber(val.solidReferenceYear),
            solidReportingYear: this.parseNumber(val.solidReportingYear),
          };
        });

        return {
          ...siteGroup.value,
          fitnessInputs: validFitnessInputs
        };
      })
      .filter(site => site.fitnessInputs.length > 0);

    const atLeastOneValid = validSites.length > 0;

    if (atLeastOneValid) {
      // Unique years nikal lo:
      const years = Array.from(new Set(validSites.flatMap(site => site.fitnessInputs.map((fi: any) => fi.year))));

      const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
      const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
      const goalCodeId = this.goal.goal_code;

      // Per year progress indicators calculate karo, har type ke liye
      const progressIndicators = years.map(year => ([
        {
          id: progressIndicatorIds[0],
          score: this.calculateProgressIndicator(0, year),
          year,
          dataCompleteness: this.calculateDataCompletenessForGaseous(year)
        },
        {
          id: progressIndicatorIds[1],
          score: this.calculateProgressIndicator(1, year),
          year,
          dataCompleteness: this.calculateDataCompletenessForLiquid(year)
        },
        {
          id: progressIndicatorIds[2],
          score: this.calculateProgressIndicator(2, year),
          year,
          dataCompleteness: this.calculateDataCompletenessForSolid(year)
        }
      ])).flat();

      // Per year context indicators calculate karo
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
        },
        {
          id: contextIndicatorIds[2],
          score: this.parseNumber(this.calculateContextIndicator(2, year)),
          year
        }
      ])).flat();

      if (this.routeId !== null && this.routeId !== undefined) {
        this.fitEntryId = this.routeId;
      }

      const formData = {
        sites: validSites,
        progress_indicators: progressIndicators,
        context_indicators: contextIndicators,
        progress_indicator_ids: progressIndicatorIds,
        context_indicator_ids: contextIndicatorIds,
        goalCode_id: goalCodeId,
        fit_entry_id: this.fitEntryId
      };

      // console.log('BE05 Form Submitted:', formData);

      this.commonService.addData('be-form/submit/be05', formData).subscribe(
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
          this.loading = false;
          console.error('An error occurred:', error);
        }
      );
    }
  }



  // calculateDataCompletenessForGaseous(year: number): string {
  //   const selectedYear = year;

  //   for (let i = this.sites.length - 1; i >= 0; i--) {
  //     const site = this.sites.at(i);
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //     if (!fitnessInputs || !fitnessInputs.length) continue;

  //     const relevanceValues: number[] = fitnessInputs.controls
  //       .filter(input => {
  //         const inputYear = input.get('year')?.value;
  //         const inputYearVal =
  //           inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  //         return inputYearVal === selectedYear;
  //       })
  //       .map(input => input.get('relevanceGaseous')?.value) //  Gaseous specific
  //       .filter(val => val !== null && val !== undefined && !isNaN(val));

  //     if (relevanceValues.length > 0) {
  //       const hasNotRelevant = relevanceValues.includes(2);
  //       const hasInsufficient = relevanceValues.includes(3);
  //       const hasOtherExcluded = relevanceValues.includes(4);
  //       const hasOtherExcluded1 = relevanceValues.includes(5);
  //       const hasIncluded = relevanceValues.includes(1);

  //       if (hasNotRelevant) return 'Calculation based on complete data';
  //       if (hasInsufficient) return 'Calculation based on incomplete data';
  //       if (hasOtherExcluded) return 'Calculation may be based on incomplete data';
  //       if (hasOtherExcluded1) return 'Calculation may be based on incomplete data';
  //       if (hasIncluded && relevanceValues.every(val => val === 1))
  //         return 'Calculation based on complete data';

  //       return '';
  //     }
  //   }
  //   return '';
  // }
  calculateDataCompletenessForGaseous(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    for (const siteControl of this.sites.controls) {
      const site = siteControl as FormGroup;
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) continue;

      for (const input of fitnessInputs.controls) {
        const inputYear = input.get('year')?.value;
        const inputYearVal =
          inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevanceGaseous')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(Number(relevanceVal));
          }
        }
      }
    }


    if (allRelevanceValues.length == 0) return '';


    const hasIncluded1 = allRelevanceValues.includes(1);
    const hasIncluded2 = allRelevanceValues.includes(2);
    const hasInsufficient = allRelevanceValues.includes(3);
    const hasNotRelevant = allRelevanceValues.includes(4);
    const hasOtherExcluded = allRelevanceValues.includes(5);


    const hasIncluded = hasIncluded1 || hasIncluded2;


    if (allRelevanceValues.every(v => v == 1 || v == 2)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.every(v => v == 4)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.length == 1) {
      const val = allRelevanceValues[0];
      switch (val) {
        case 1:
        case 2:
        case 4:
          return 'Calculation based on complete data';
        case 3:
          return 'Calculation based on incomplete data';
        case 5:
          return 'Calculation may be based on incomplete data';
      }
    }


    if (hasIncluded && hasNotRelevant && !hasInsufficient && !hasOtherExcluded) {
      return 'Calculation based on complete data';
    }


    if (hasIncluded && hasInsufficient) {
      return 'Calculation based on incomplete data';
    }


    if (hasIncluded && hasOtherExcluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    if (hasNotRelevant && hasInsufficient && !hasIncluded && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }


    if (hasNotRelevant && hasOtherExcluded && !hasIncluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }


    if (hasInsufficient && hasOtherExcluded && !hasIncluded) {
      return 'Calculation based on incomplete data';
    }


    if (hasInsufficient && !hasIncluded && !hasNotRelevant && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }


    if (hasOtherExcluded && !hasIncluded && !hasNotRelevant && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    return '';
  }




  // calculateDataCompletenessForLiquid(year: number): string {
  //   const selectedYear = year;

  //   for (let i = this.sites.length - 1; i >= 0; i--) {
  //     const site = this.sites.at(i);
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //     if (!fitnessInputs || !fitnessInputs.length) continue;

  //     const relevanceValues: number[] = fitnessInputs.controls
  //       .filter(input => {
  //         const inputYear = input.get('year')?.value;
  //         const inputYearVal =
  //           inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  //         return inputYearVal === selectedYear;
  //       })
  //       .map(input => input.get('relevanceLiquid')?.value) // 👈 Liquid specific
  //       .filter(val => val !== null && val !== undefined && !isNaN(val));

  //     if (relevanceValues.length > 0) {
  //       const hasNotRelevant = relevanceValues.includes(2);
  //       const hasInsufficient = relevanceValues.includes(3);
  //       const hasOtherExcluded = relevanceValues.includes(4);
  //        const hasOtherExcluded1 = relevanceValues.includes(5);
  //       const hasIncluded = relevanceValues.includes(1);

  //       if (hasNotRelevant) return 'Calculation based on complete data';
  //       if (hasInsufficient) return 'Calculation based on incomplete data';
  //       if (hasOtherExcluded) return 'Calculation may be based on incomplete data';
  //        if (hasOtherExcluded1) return 'Calculation may be based on incomplete data';
  //       if (hasIncluded && relevanceValues.every(val => val === 1))
  //         return 'Calculation based on complete data';

  //       return '';
  //     }
  //   }
  //   return '';
  // }
  calculateDataCompletenessForLiquid(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    for (const siteControl of this.sites.controls) {
      const site = siteControl as FormGroup;
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) continue;

      for (const input of fitnessInputs.controls) {
        const inputYear = input.get('year')?.value;
        const inputYearVal =
          inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevanceLiquid')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(Number(relevanceVal));
          }
        }
      }
    }

    if (allRelevanceValues.length == 0) return '';

    const hasIncluded1 = allRelevanceValues.includes(1);
    const hasIncluded2 = allRelevanceValues.includes(2);
    const hasInsufficient = allRelevanceValues.includes(3);
    const hasNotRelevant = allRelevanceValues.includes(4);
    const hasOtherExcluded = allRelevanceValues.includes(5);

    const hasIncluded = hasIncluded1 || hasIncluded2;

    if (allRelevanceValues.every(v => v == 1 || v == 2)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.every(v => v == 4)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.length == 1) {
      const val = allRelevanceValues[0];
      switch (val) {
        case 1:
        case 2:
        case 4:
          return 'Calculation based on complete data';
        case 3:
          return 'Calculation based on incomplete data';
        case 5:
          return 'Calculation may be based on incomplete data';
      }
    }


    if (hasIncluded && hasNotRelevant && !hasInsufficient && !hasOtherExcluded) {
      return 'Calculation based on complete data';
    }


    if (hasIncluded && hasInsufficient) {
      return 'Calculation based on incomplete data';
    }


    if (hasIncluded && hasOtherExcluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    if (hasNotRelevant && hasInsufficient && !hasIncluded && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasNotRelevant && hasOtherExcluded && !hasIncluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    if (hasInsufficient && hasOtherExcluded && !hasIncluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasInsufficient && !hasIncluded && !hasNotRelevant && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasOtherExcluded && !hasIncluded && !hasNotRelevant && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    return '';
  }




  // calculateDataCompletenessForSolid(year: number): string {
  //   const selectedYear = year;

  //   for (let i = this.sites.length - 1; i >= 0; i--) {
  //     const site = this.sites.at(i);
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

  //     if (!fitnessInputs || !fitnessInputs.length) continue;

  //     const relevanceValues: number[] = fitnessInputs.controls
  //       .filter(input => {
  //         const inputYear = input.get('year')?.value;
  //         const inputYearVal =
  //           inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  //         return inputYearVal === selectedYear;
  //       })
  //       .map(input => input.get('relevanceSolid')?.value) // Solid specific
  //       .filter(val => val !== null && val !== undefined && !isNaN(val));

  //     if (relevanceValues.length > 0) {
  //       const hasNotRelevant = relevanceValues.includes(2);
  //       const hasInsufficient = relevanceValues.includes(3);
  //       const hasOtherExcluded = relevanceValues.includes(4);
  //        const hasOtherExcluded1 = relevanceValues.includes(5);
  //       const hasIncluded = relevanceValues.includes(1);

  //       if (hasNotRelevant) return 'Calculation based on complete data';
  //       if (hasInsufficient) return 'Calculation based on incomplete data';
  //       if (hasOtherExcluded) return 'Calculation may be based on incomplete data';
  //        if (hasOtherExcluded1) return 'Calculation may be based on incomplete data';
  //       if (hasIncluded && relevanceValues.every(val => val === 1))
  //         return 'Calculation based on complete data';

  //       return '';
  //     }
  //   }
  //   return '';
  // }
  calculateDataCompletenessForSolid(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    for (const siteControl of this.sites.controls) {
      const site = siteControl as FormGroup;
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) continue;

      for (const input of fitnessInputs.controls) {
        const inputYear = input.get('year')?.value;
        const inputYearVal =
          inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevanceSolid')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(Number(relevanceVal));
          }
        }
      }
    }

    if (allRelevanceValues.length == 0) return '';

    const hasIncluded1 = allRelevanceValues.includes(1);
    const hasIncluded2 = allRelevanceValues.includes(2);
    const hasInsufficient = allRelevanceValues.includes(3);
    const hasNotRelevant = allRelevanceValues.includes(4);
    const hasOtherExcluded = allRelevanceValues.includes(5);

    const hasIncluded = hasIncluded1 || hasIncluded2;

    if (allRelevanceValues.every(v => v == 1 || v == 2)) {
      return 'Calculation based on complete data';
    }

    if (allRelevanceValues.every(v => v == 4)) {
      return 'Calculation based on complete data';
    }


    if (allRelevanceValues.length == 1) {
      const val = allRelevanceValues[0];
      switch (val) {
        case 1:
        case 2:
        case 4:
          return 'Calculation based on complete data';
        case 3:
          return 'Calculation based on incomplete data';
        case 5:
          return 'Calculation may be based on incomplete data';
      }
    }


    if (hasIncluded && hasNotRelevant && !hasInsufficient && !hasOtherExcluded) {
      return 'Calculation based on complete data';
    }


    if (hasIncluded && hasInsufficient) {
      return 'Calculation based on incomplete data';
    }


    if (hasIncluded && hasOtherExcluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    if (hasNotRelevant && hasInsufficient && !hasIncluded && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasNotRelevant && hasOtherExcluded && !hasIncluded && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    if (hasInsufficient && hasOtherExcluded && !hasIncluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasInsufficient && !hasIncluded && !hasNotRelevant && !hasOtherExcluded) {
      return 'Calculation based on incomplete data';
    }

    if (hasOtherExcluded && !hasIncluded && !hasNotRelevant && !hasInsufficient) {
      return 'Calculation may be based on incomplete data';
    }

    return '';
  }





  resetBE05FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevanceGaseous: null,
          gaseousReferenceYear: null,
          gaseousReportingYear: null,
          gaseousSiteFitnessPercent: null,

          relevanceLiquid: null,
          liquidReferenceYear: null,
          liquidReportingYear: null,
          liquidSiteFitnessPercent: null,

          relevanceSolid: null,
          solidReferenceYear: null,
          solidReportingYear: null,
          solidSiteFitnessPercent: null,

          comments: ''
        });

        [
          'relevanceGaseous', 'gaseousReferenceYear', 'gaseousReportingYear', 'gaseousSiteFitnessPercent',
          'relevanceLiquid', 'liquidReferenceYear', 'liquidReportingYear', 'liquidSiteFitnessPercent',
          'relevanceSolid', 'solidReferenceYear', 'solidReportingYear', 'solidSiteFitnessPercent',
          'comments'
        ].forEach(field => {
          const control = siteGroup.get(field);
          if (control) {
            control.markAsPristine();
            control.markAsUntouched();
          }
        });
      });
    }
  }
  isAtLeastOneSiteValid(): boolean {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    return siteArray.controls.some(siteGroup => siteGroup.valid);
  }

  getFitnessInputs(site: AbstractControl): FormArray {
    return site.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(siteIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const inputs = siteGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.loadReferenceYears()
  }
  triggerChangeDetection(): void {
    this.cdr.detectChanges();
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()], // the Coma thAll the Allthe ALL the Comes the A dhA Ajd Ajfjrhthe 
      relevanceGaseous: [data?.relevance_id_gaseous || '', Validators.required],
      gaseousReferenceYear: [this.ref_data.ref_year_value || data?.gaseous_reference_year],
      gaseousReportingYear: [data?.gaseous_reporting_year || null],
      gaseousSiteFitnessPercent: [data?.gaseous_site_fitness_percent || null],
      relevanceLiquid: [data?.relevance_id_liquid || '', Validators.required],
      liquidReferenceYear: [data?.liquid_reference_year || this.ref_data.ref_year_value],
      liquidReportingYear: [data?.liquid_reporting_year || null],
      liquidSiteFitnessPercent: [data?.liquid_site_fitness_percent || null],
      relevanceSolid: [data?.relevance_id_solid || '', Validators.required],
      solidReferenceYear: [data?.solid_reference_year || this.ref_data.ref_year_value],
      solidReportingYear: [data?.solid_reporting_year || null],
      solidSiteFitnessPercent: [data?.solid_site_fitness_percent || null],
      comments: [data?.comments || ''],
      contextDescription: [data?.context_description || ''],
      liquidemissionyear: [''],
      Solidemissionyear: [''],
      Gaseousemissionyear: [''],
    });
  }

  // removeFitnessInput(siteIndex: number, inputIndex: number) {
  //   const siteGroup = this.sites.at(siteIndex) as FormGroup;
  //   const inputs = siteGroup.get('fitnessInputs') as FormArray;

  //   if (inputs.length > 1) {
  //     inputs.removeAt(inputIndex);
  //   }
  // }
  removeFitnessInput(siteIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const inputs = siteGroup.get('fitnessInputs') as FormArray;
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
          form: 'be05'
        }).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('Deleted!', 'Your data has been successfully deleted', 'success');
              inputs.removeAt(inputIndex);
              this.submitForm(false);
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

}
