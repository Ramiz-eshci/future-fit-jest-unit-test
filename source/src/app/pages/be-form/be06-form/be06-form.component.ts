import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from 'src/app/material.module';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from 'src/app/components/help-dialog/help-dialog.component';
import { GlobalFlagService } from 'src/app/services/global-flag.service';
import { NgApexchartsModule } from 'ng-apexcharts';
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
  selector: 'app-be06-form',
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
    MatCardModule,
    NgApexchartsModule,
    MaterialModule
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
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './be06-form.component.html',
  styleUrl: './be06-form.component.scss'
})
export class Be06FormComponent implements OnInit, OnChanges {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;
  contextUnit: string = '';
  loading: boolean = false;
  relevantsArr: any = [];
  noGhgEmission: any = [];
  showIndicators: boolean = false;
  routeId: any = '';
  initialLoad = true;
  ref_data: any = [];
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  netEmissionMessages: boolean[][] = [];



  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
  }

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }


  ngOnInit(): void {
    setTimeout(() => {
      if (this.sites?.length > 0) {
        this.loadReferenceYears();


        this.netEmissionMessages = this.sites.controls.map(site => {
          const fitnessInputs = site.get('fitnessInputs') as FormArray;
          return Array(fitnessInputs.length).fill(false);
        });
      }
    }, 0);
    this.enableGHGFieldsOnLoad();
  }



  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.loadReferenceYears();
    }, 0);
  }



  constructor(private commonService: CommonService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
    this.commonService.getData('list/Siteassessed').subscribe((response) => {
      if (response.status === true) {
        this.noGhgEmission = response.data
      }
    });

  }
  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '700px',
      data: { criteria, notes }
    });
  }
  enableGHGFieldsOnLoad(): void {
    this.sites.controls.forEach(siteGroup => {
      ['ghgReferenceYear', 'ghgReportingYear', 'ghgAdequatelyOffset'].forEach(field => {
        const control = siteGroup.get(field);
        if (control) {
          control.enable({ emitEvent: false });
        }
      });
    });
  }

  get uniqueYearsFromFitnessInputs(): number[] {

    const yearsSet = new Set<number>();
    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
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
        const isRelevanceValid = relevanceVal !== null && relevanceVal !== undefined && relevanceVal !== '' && relevanceVal != 0;
        if (year && !isNaN(year) && isRelevanceValid) {
          yearsSet.add(year);
        }
      });
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }



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

                  input.get('ghgReferenceYear')?.setValue(
                    this.formatNumberWithCommas(ref.be06ghgemmison_ref_year_value) || '',
                    { emitEvent: false }
                  );

                  input.get('GHGemissionsyear')?.setValue(ref.be06ghgemmison_ref_year || '', { emitEvent: false });

                } else {
                  input.get('ghgReferenceYear')?.setValue('', { emitEvent: false });
                  input.get('GHGemissionsyear')?.setValue('', { emitEvent: false });
                }

                this.calculateSiteFitness(siteIndex, inputIndex);
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



  private formatNumberWithCommas(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  }

  calculateSiteFitness(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;
    const noGHG = inputGroup.get('NOGHGemissionsAreReleased')?.value;
    const refYearRaw = inputGroup.get('ghgReferenceYear')?.value;
    const repYearRaw = inputGroup.get('ghgReportingYear')?.value;
    const offsetRaw = inputGroup.get('ghgAdequatelyOffset')?.value;

    const refYear = +(refYearRaw?.toString().replace(/,/g, '') || 0);
    const repYear = +(repYearRaw?.toString().replace(/,/g, '') || 0);
    const offset = +offsetRaw || 0;
    let fitness: string = '';

    if (!this.netEmissionMessages[index]) {
      this.netEmissionMessages[index] = [];
    }

    if (relevance == 1 && noGHG != 1 && (repYear - offset) < 0) {
      this.netEmissionMessages[index][inputIndex] = true;
    } else {
      this.netEmissionMessages[index][inputIndex] = false;
    }

    const ghgControls = ['ghgReportingYear', 'ghgAdequatelyOffset'];
    if (!relevance) {
      // Relevance not selected yet — keep all GHG fields editable
      ghgControls.forEach(control => {
        siteGroup.get(control)?.enable({ emitEvent: false });
      });
      return;
    }

    // Enable/Disable fields based on relevance and GHG toggle
    if (relevance != 1 || noGHG == 1) {
      ghgControls.forEach(control => {
        const ctrl = siteGroup.get(control);
        if (ctrl) {
          ctrl.disable({ emitEvent: false });
          ctrl.setValue('', { emitEvent: false });  // clear values
        }
      });
    } else {
      ghgControls.forEach(control => {
        inputGroup.get(control)?.enable({ emitEvent: false });
      });
    }

    // Calculate fitness logic
    if (noGHG == 1) {
      fitness = '100%';
      ghgControls.forEach(control => {
        inputGroup.get(control)?.setValue('', { emitEvent: false });
      });
    } else if (relevance != 1) {
      fitness = '';
      ghgControls.forEach(control => {
        inputGroup.get(control)?.setValue('', { emitEvent: false });
      });
    } else if (refYear == 0) {
      fitness = '';
    } else if ((repYear - offset) > refYear) {
      fitness = '0%';
    } else {
      const raw = ((refYear - (repYear - offset)) / refYear);
      // const percent = Math.round(raw * 100);
      let percent = Math.round(raw * 100);
      if (percent > 100) {
        percent = 100;
      }
      fitness = `${percent}%`;
    }

    inputGroup.get('siteFitnessPercent')?.setValue(fitness, { emitEvent: false });
  }
  calculateProgressIndicator(year: number): string {
    let sumGhgReferenceYear = 0;
    let sumGhgReportingYear = 0;
    let sumGhgOffset = 0;

    let relevantInputsCount = 0;
    let allNoGHG = true;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (fitnessInputs && fitnessInputs.length > 0) {
        fitnessInputs.controls.forEach(input => {
          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;

          if (!year || inputYearVal === year) {
            const relevance = input.get('relevance')?.value;
            const noGHG = input.get('NOGHGemissionsAreReleased')?.value;

            if (relevance == 1) {
              relevantInputsCount++;

              if (noGHG != 1) {
                allNoGHG = false;

                sumGhgReferenceYear += this.parseNumber(input.get('ghgReferenceYear')?.value);
                sumGhgReportingYear += this.parseNumber(input.get('ghgReportingYear')?.value);
                sumGhgOffset += this.parseNumber(input.get('ghgAdequatelyOffset')?.value);

              }
            }
          }
        });
      }
    });

    if (relevantInputsCount === 0) return '';
    if (allNoGHG) return '100%';

    if (sumGhgReferenceYear === 0) return '';
    if (sumGhgReportingYear > sumGhgReferenceYear) return '0%';

    const progress = ((sumGhgReferenceYear - sumGhgReportingYear + sumGhgOffset) / sumGhgReferenceYear) * 100;
    return Math.round(progress) + '%';
  }
  calculateContextIndicator(year: number | null): string {
    let totalReporting = 0;
    let countNoEmissions = 0;
    let countWithEmissions = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (fitnessInputs && fitnessInputs.length > 0) {
        fitnessInputs.controls.forEach(input => {
          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
          const isYearMatched = year == null || inputYearVal === year;

          if (!isYearMatched) return; // year filter

          const relevance = input.get('relevance')?.value;
          const noGHG = input.get('NOGHGemissionsAreReleased')?.value;

          if (relevance == 1) {
            if (noGHG == 1) {
              countNoEmissions++;
            } else if (noGHG == 2) {
              countWithEmissions++;
              totalReporting += +input.get('ghgReportingYear')?.value || 0;
            }
          }
        });
      }
    });

    if (countNoEmissions > 0 && countWithEmissions === 0) {
      return '0';
    }

    return new Intl.NumberFormat('en-US').format(totalReporting);
  }



  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }


  openProgressGraph() {
    this.prepareChartData();
    const dialogRef = this.dialog.open(this.progressGraphDialog, {
      width: '1000px',
      maxWidth: '95vw'
    });
    dialogRef.afterOpened().subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
 
  prepareChartData() {

    const years = this.uniqueYearsFromFitnessInputs.sort();

    const progressData = years.map(y => {
      const value = this.calculateProgressIndicator(y);
      return Number(value.replace('%', ''));
    });

    const contextData = years.map(y => {
      return Number(
        this.calculateContextIndicator(y).replace(/,/g, '')
      );
    });
    this.contextUnit =
      this.goal?.ContextIndicators?.[0]?.unit || '';

    this.chartOptions = {
      series: [
        {
          name: 'Progress Indicator',
          type: 'line',
          data: progressData,
          color: '#0B6FA4'
        },
        {
          name: 'Context Indicator',
          type: 'column',
          data: contextData,
          color: '#ED7D31'
        }
      ],



      chart: {
        type: 'line',
        height: 400,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          columnWidth: years.length <= 3 ? '15%' : '50%'
        }
      },

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [
        {
          min: 0,
          max: 100,
          tickAmount: 10,

          title: {
            text: 'Progress Indicator (%)',
            style: {
              fontSize: '12px',
              fontweight: 400,
              color: '#161515'
            }
          },

          labels: {
            formatter: function (val: number) {
              return val + '%';
            }
          }
        },
        {
          opposite: true,

          title: {
            text: 'Context Indicator',
            style: {
              fontSize: '12px',
              fontweight: 400,
              color: '#161515',

            }
          },

          labels: {
            // minWidth: 90,
            offsetX: -10,
            formatter: function (val: number) {
              return Number(val).toLocaleString();
            }
          }
        }
      ],

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }
    };

  }


  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    this.formSubmittedFlag = true;

    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    siteArray.controls.forEach(siteGroup => {
      siteGroup.markAllAsTouched();
    });
    this.loading = true;
    // Filter valid sites
    const validSites = siteArray.controls
      .map(siteGroup => {
        const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

        // Filter only valid inputs
        const validFitnessInputs = fitnessInputs.controls.filter(input => {
          const relevance = input.get('relevance')?.value;
          const year = input.get('year')?.value;
          const isValidYear = year instanceof Date && !isNaN(year.getTime());
          return !!relevance && isValidYear;
        }).map(input => {
          const val = input.value;
          return {
            ...val,
            year: (val.year instanceof Date) ? val.year.getFullYear() : val.year,
            ghgReferenceYear: this.parseNumber(val.ghgReferenceYear), // comma remove   
            ghgReportingYear: this.parseNumber(val.ghgReportingYear)  // comma remove
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
      const years = Array.from(new Set(validSites.flatMap(site => site.fitnessInputs.map((fi: any) => fi.year))));
      const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
      const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
      const goalCodeId = this.goal.goal_code;
      const progressIndicators = years.map(year => ({
        id: progressIndicatorIds[0],
        score: this.calculateProgressIndicator(year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year)
      }));


      const contextIndicators = years.map(year => ({
        id: contextIndicatorIds[0],
        score: this.parseNumber(this.calculateContextIndicator(year)),
        year
      }));

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

      console.log('BE06 Form Submitted:', formData);

      this.commonService.addData('be-form/submit/be06', formData).subscribe(
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


  isAtLeastOneSiteValid(): boolean {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    return siteArray.controls.some(siteGroup => siteGroup.valid);
  }

  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }

  resetBE06FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: null,
          ghgReferenceYear: null,
          ghgReportingYear: null,
          ghgAdequatelyOffset: null,
          siteFitnessPercent: null,
          NOGHGemissionsAreReleased: '',
          comments: ''
        });

        [
          'relevance', 'ghgReferenceYear', 'ghgReportingYear',
          'ghgAdequatelyOffset', 'siteFitnessPercent',
          'NOGHGemissionsAreReleased', 'comments'
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

  calculateDataCompleteness(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevance')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(relevanceVal);
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

    const ghgRefYear = inputGroup.get('GHGemissionsyear')?.value;
    const ghgRefYearNum = ghgRefYear ? Number(ghgRefYear) : null;

    // Validation: selectedYear must be >= reference year
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

  getFitnessInputs(site: AbstractControl): FormArray {
    return site.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(siteIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const inputs = siteGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.loadReferenceYears()
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      relevance: [data?.relevance_id || '', Validators.required],
      ghgReferenceYear: [data?.ghg_reference_year || this.ref_data.ref_year_value],
      ghgReportingYear: [data?.ghg_reporting_year || null],
      ghgAdequatelyOffset: [data?.ghg_adequately_offset || null],
      siteFitnessPercent: [data?.site_fitness_percent || null],
      NOGHGemissionsAreReleased: [data?.no_ghg_emission_id || ''],
      comments: [data?.comments || ''],
      GHGemissionsyear: [''],
    });
  }


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
          form: 'be06'
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
