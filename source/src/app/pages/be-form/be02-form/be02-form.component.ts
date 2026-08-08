
import { Component, Input, OnChanges, OnInit, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NumberFormatterDirective } from 'src/app/shared/directives/number-format.directive';
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
  selector: 'app-be02-form',
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
    MaterialModule, SharedModule, MatDatepickerModule, NgApexchartsModule
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
  templateUrl: './be02-form.component.html',
  styleUrl: './be02-form.component.scss'
})
export class Be02FormComponent implements OnChanges, OnInit {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;
  fit_entry: any = '';
  relevantsArr: any = []
  inputWaterCompleteness: string = '';
  dischargedWaterCompleteness: string = '';

  loading: boolean = false;
  routeId: any = '';
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  activeTab: 'progress' | 'context' = 'progress';
  contextUnit: string = '';


  constructor(private globalFlagService: GlobalFlagService, private cd: ChangeDetectorRef, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private dialog: MatDialog) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });

  }
  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '800px',
      data: { criteria, notes }
    });
  }
  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
  }
  getlatestYeardata() {
    const allYears = this.uniqueYearsFromFitnessInputs;
    this.topYear = allYears[0];
    this.remainingYears = allYears.slice(1);
  }
  triggerChangeDetection(): void {
    this.cd.detectChanges();
  }
  parseNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(val.toString().replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }
  switchTab(tab: 'progress' | 'context') {
    this.activeTab = tab;
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

    const waterConsumption = years.map(year => {
      const value = this.calculateProgressIndicator(0, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const waterDischarge = years.map(year => {
      const value = this.calculateProgressIndicator(1, year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const fitSources = years.map(year =>
      Number(this.calculateContextIndicator(0, year).replace(/,/g, ''))
    );

    const unfitSources = years.map(year =>
      Number(this.calculateContextIndicator(1, year).replace(/,/g, ''))
    );

    const totalDischarged = years.map(year =>
      Number(this.calculateContextIndicator(2, year).replace(/,/g, ''))
    );

    // this.contextUnit =
    //   this.goal?.ContextIndicators?.[0]?.unit || '';

    this.chartOptions = {

      series: [

        {
          name: 'Water Consumption Fit sources',
          type: 'column',
          data: fitSources,
          color: '#2E7D32'
        },

        {
          name: 'Water Consumption Unfit sources',
          type: 'column',
          data: unfitSources,
          color: '#29B6F6'
        },

        {
          name: 'Total water discharged',
          type: 'column',
          data: totalDischarged,
          color: '#8E24AA'
        },

        {
          name: 'Water Consumption',
          type: 'line',
          data: waterConsumption,
          color: '#1565C0'
        },

        {
          name: 'Water Discharge',
          type: 'line',
          data: waterDischarge,
          color: '#EF6C00'
        }

      ],

      chart: {
        height: 430,
        type: 'line',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: [0, 0, 0, 3, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 0, 0, 4, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [
        {
          seriesName: ['Water Consumption', 'Water Discharge'],
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
          seriesName: [
            'Water Consumption Fit sources',
            'Water Consumption Unfit sources',
            'Total water discharged'
          ],
          opposite: true,
          title: {
            text: 'Context Indicator'
          },
          labels: {
            formatter: (value: number) => Number(value).toLocaleString()
          }
        }
      ],

      legend: {
        position: 'bottom'
      },

      tooltip: {
        shared: true,

        y: {
          formatter: (value: number, opts: any) => {

            const seriesName = opts.w.config.series[opts.seriesIndex].name;

            switch (seriesName) {

              case 'Water Consumption':
              case 'Water Discharge':
                return value + '%';

              default:
                return value.toLocaleString() + ' ' + this.contextUnit;
            }

          }
        }
      },

      dataLabels: {
        enabled: false
      }

    };

  }


  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
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

    // return Array.from(yearsSet).sort();
    return Array.from(yearsSet).sort((a, b) => b - a);
  }

  ngOnInit(): void {
    // console.log('Received fitEntryId from BE01:', this.fitEntryId);
    // Trigger initial fitness calculation for existing values
    this.sites.controls.forEach((siteGroup, siteIndex) => {
      const fitnessInputs = (siteGroup.get('fitnessInputs') as FormArray);
      if (fitnessInputs && fitnessInputs.length > 0) {
        fitnessInputs.controls.forEach((_, inputIndex) => {
          this.calculateSiteFitness(siteIndex, inputIndex);
        });
      }
    });
  }
  onNumberInput(event: any, formGroup: FormGroup, fieldName: string): void {
    const rawValue = event.target.value.replace(/,/g, '');
    const numberValue = Number(rawValue);

    if (!isNaN(numberValue)) {
      formGroup.get(fieldName)?.setValue(numberValue);
      event.target.value = this.formatNumber(numberValue); // Formatted in UI
    }


  }
  formatNumber(value: any): string {
    if (value === null || value === undefined) return '';

    const num = Number(String(value).replace(/,/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('en-US');
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


    const dateForInput = new Date(selectedYear, 0, 1);
    const yearControl = inputGroup.get('year');
    yearControl?.setValue(dateForInput);
    yearControl?.setErrors(null);
    datepicker.close();
  }
  onYearTyped(event: Event, siteIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, siteIndex, inputIndex);
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['fitEntryId']?.currentValue) {
      // console.log('ngOnChanges fitEntryId:', this.fitEntryId); // Should be defined here
    }
  }


  calculateSiteFitness(index: number, inputIndex: number) {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;
    const relevance1 = inputGroup.get('relevance1')?.value;
    const year = inputGroup.get('year')?.value;
    //const year = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

    if (relevance != 1) {
      const fieldsToClear = [
        'fitWaterVolume',
        'unfitWaterVolume',
        'commercialOffset',
        'workerFitWater',
        'workerUnfitWater',
        'commercialFit',
        'commercialUnfit',
        'commercialTotal',
        'siteFitness'
      ];
      fieldsToClear.forEach(field => {
        inputGroup.get(field)?.setValue('', { emitEvent: false });
      });
    } else {
      // const fit = +inputGroup.get('fitWaterVolume')?.value;
      // const workerFit = +inputGroup.get('workerFitWater')?.value;
      const fit = this.parseNumber(inputGroup.get('fitWaterVolume')?.value);
      const workerFit = this.parseNumber(inputGroup.get('workerFitWater')?.value);

      let commercialFit: number | string = '';

      if (!fit) {
        commercialFit = '';
      } else if (workerFit > fit) {
        commercialFit = 0;
      } else {
        commercialFit = +(fit - workerFit).toFixed(2);
      }
      inputGroup.get('commercialFit')?.setValue(commercialFit, { emitEvent: false });

      // const unfit = +inputGroup.get('unfitWaterVolume')?.value || 0;
      // const workerUnfit = +inputGroup.get('workerUnfitWater')?.value || 0;
      // const offset = +inputGroup.get('commercialOffset')?.value || 0;
      const unfit = this.parseNumber(inputGroup.get('unfitWaterVolume')?.value);
      const workerUnfit = this.parseNumber(inputGroup.get('workerUnfitWater')?.value);
      const offset = this.parseNumber(inputGroup.get('commercialOffset')?.value);

      const result = unfit - workerUnfit - offset;
      const commercialUnfit = isNaN(result) ? '' : +Math.max(0, result).toFixed(2);
      inputGroup.get('commercialUnfit')?.setValue(commercialUnfit, { emitEvent: false });

      // const commFit = +inputGroup.get('commercialFit')?.value;
      // const commUnfit = +inputGroup.get('commercialUnfit')?.value;
      const commFit = parseFloat((inputGroup.get('commercialFit')?.value || '0').toString().replace(/,/g, '')) || 0;
      const commUnfit = parseFloat((inputGroup.get('commercialUnfit')?.value || '0').toString().replace(/,/g, '')) || 0;


      let commercialTotal: number | string = '';
      if (inputGroup.get('commercialFit')?.value === '' && inputGroup.get('commercialUnfit')?.value === '') {
        commercialTotal = '';
      } else {
        // commercialTotal = +(commFit + commUnfit).toFixed(2);
        commercialTotal = Number((commFit + commUnfit).toFixed(2));

      }
      inputGroup.get('commercialTotal')?.setValue(commercialTotal, { emitEvent: false });
      const M = +commercialTotal || 0;
      const K = +commFit || 0;
      const fitness = M === 0 ? '0%' : Math.round((K / M) * 100) + '%';
      inputGroup.get('siteFitness')?.setValue(fitness, { emitEvent: false });
      this.inputWaterCompleteness = this.calculateDataCompletenessGeneric(year, 'relevance');
    }

    // ---- Relevance1 Block ----
    if (relevance1 != 1) {
      inputGroup.get('dischargeRelevance')?.setValue('', { emitEvent: false });
      inputGroup.get('fitDischarged')?.setValue('', { emitEvent: false });
      inputGroup.get('siteFitness1')?.setValue('', { emitEvent: false });
    } else {
      const dischargeRelevance = +inputGroup.get('dischargeRelevance')?.value || 0;
      const fitDischarged = +inputGroup.get('fitDischarged')?.value || 0;

      let siteFitness1: string = '';
      if (!dischargeRelevance || !fitDischarged) {
        siteFitness1 = '';
      } else if (fitDischarged < dischargeRelevance) {
        siteFitness1 = 'Error';
      } else {
        siteFitness1 = Math.round((dischargeRelevance / fitDischarged) * 100) + '%';
      }

      inputGroup.get('siteFitness1')?.setValue(siteFitness1, { emitEvent: false });
      this.dischargedWaterCompleteness = this.calculateDataCompletenessGeneric(year, 'relevance1');
      // At the end of calculateSiteFitness()
      this.formatCalculatedFields(inputGroup);

    }

  }
  private formatCalculatedFields(inputGroup: FormGroup): void {
    const fieldsToFormat = ['commercialFit', 'commercialUnfit', 'commercialTotal'];

    setTimeout(() => {
      fieldsToFormat.forEach(fieldName => {
        const control = inputGroup.get(fieldName);
        if (control && control.value !== null && control.value !== '' && !isNaN(control.value)) {
          const formatted = Number(control.value).toLocaleString('en-US');
          control.setValue(formatted, { emitEvent: false });
        }
      });
    }, 0);
  }


  getDataCompleteness(i: number, year: number) {

    const fieldName = i === 0 ? 'relevance' : i === 1 ? 'relevance1' : '';
    if (!fieldName) return '';
    return this.calculateDataCompletenessGeneric(year, fieldName);
  }


  calculateDataCompletenessGeneric(year: number, fieldName: string): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

        if (inputYearVal === selectedYear) {
          const relevanceVal = input.get(fieldName)?.value;
          if (relevanceVal !== null && relevanceVal !== undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(relevanceVal);
          }
        }
      });
    });

    if (allRelevanceValues.length === 0) return '';

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


  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  }










  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }




  calculateProgressIndicator(index: number, year: number): string {
    let totalFit = 0;
    let total = 0;
    let errorFound = false;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (fitnessInputs && fitnessInputs.controls.length > 0) {
        fitnessInputs.controls.forEach(input => {
          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;


          if (year && inputYearVal !== year) return;

          const relevance = input.get('relevance')?.value;
          const relevance1 = input.get('relevance1')?.value;


          const commercialFit = this.parseNumber(input.get('commercialFit')?.value);
          const commercialTotal = this.parseNumber(input.get('commercialTotal')?.value);
          const dischargeRelevance = this.parseNumber(input.get('dischargeRelevance')?.value);
          const fitDischarged = this.parseNumber(input.get('fitDischarged')?.value);

          if (index == 0 && relevance == 1) {
            totalFit += commercialFit;
            total += commercialTotal;
          }

          if (index == 1 && relevance1 == 1) {
            if (dischargeRelevance > fitDischarged) {
              errorFound = true;
            }
            totalFit += dischargeRelevance;
            total += fitDischarged;
          }
        });
      }
    });

    if (index == 1 && errorFound) return 'Error';
    if (total == 0) return '';

    const percentage = Math.round((totalFit / total) * 100);
    return percentage + '%';
  }


  calculateContextIndicator(index: number, year: number | null): string {
    let totalFit = 0;
    let totalUnfit = 0;
    let totalFitDischarged = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || fitnessInputs.length == 0) return;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
        const isYearMatched = year == null || inputYearVal == year;
        if (!isYearMatched) return;

        const relevance = input.get('relevance')?.value;
        const relevance1 = input.get('relevance1')?.value;


        const commercialFit = this.parseNumber(input.get('commercialFit')?.value);
        const commercialUnfit = this.parseNumber(input.get('commercialUnfit')?.value);
        const fitDischarged = this.parseNumber(input.get('fitDischarged')?.value);

        if (index == 0 && relevance == 1) {
          totalFit += commercialFit;
        }

        if (index == 1 && relevance == 1) {
          totalUnfit += commercialUnfit;
        }

        if (index == 2 && relevance1 == 1) {
          totalFitDischarged += fitDischarged;
        }
      });
    });

    //  Return properly formatted values
    if (index == 0) return new Intl.NumberFormat('en-US').format(totalFit);
    if (index == 1) return new Intl.NumberFormat('en-US').format(totalUnfit);
    if (index == 2) return new Intl.NumberFormat('en-US').format(totalFitDischarged);
    if (index == 3) return 'Description';
    return '';
  }





  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    this.formSubmittedFlag = true;
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;

    siteArray.controls.forEach(siteGroup => {
      siteGroup.markAllAsTouched();
    });
    this.loading = true;
    const validSites = siteArray.controls
      .map(siteGroup => {
        const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
        const validFitnessInputs = fitnessInputs.controls.filter(input => {
          const relevance = input.get('relevance')?.value;
          const year = input.get('year')?.value;
          const isValidYear = year instanceof Date && !isNaN(year.getTime());
          return !!relevance && isValidYear;
        });

        if (validFitnessInputs.length > 0) {
          return {
            ...siteGroup.value,
            fitnessInputs: validFitnessInputs.map(input => {
              const val = input.value;
              return {
                ...val,
                year: (val.year instanceof Date) ? val.year.getFullYear() : val.year,
                fitWaterVolume: this.parseNumber(val.fitWaterVolume),
                unfitWaterVolume: this.parseNumber(val.unfitWaterVolume),
                commercialOffset: this.parseNumber(val.commercialOffset),
                workerFitWater: this.parseNumber(val.workerFitWater),
                workerUnfitWater: this.parseNumber(val.workerUnfitWater),
                commercialFit: this.parseNumber(val.commercialFit),
                commercialUnfit: this.parseNumber(val.commercialUnfit),
                commercialTotal: this.parseNumber(val.commercialTotal),
                fitDischarged: this.parseNumber(val.fitDischarged),
                totalDischarged: this.parseNumber(val.totalDischarged)
              };
            })
          };
        }
        return null;
      })
      .filter(group => group !== null);

    const atLeastOneValid = validSites.length > 0;
    if (atLeastOneValid) {
      const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
      const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
      const goalCodeId = this.goal.goal_code;
      const years = this.uniqueYearsFromFitnessInputs;


      const progressIndicators = years.map(year => ([
        {
          id: progressIndicatorIds[0],
          score: this.calculateProgressIndicator(0, year),
          year,
          dataCompleteness: this.calculateDataCompletenessGeneric(year, 'relevance')
        },
        {
          id: progressIndicatorIds[1],
          score: this.calculateProgressIndicator(1, year),
          year,
          dataCompleteness: this.calculateDataCompletenessGeneric(year, 'relevance1')
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
        //  data_completeness: this.dataCompletenessStatus, // ya aggregated from per-year if needed
        goalCode_id: goalCodeId,
        fit_entry_id: this.fitEntryId
      };

      // console.log('BE02 Form Submitted:', formData);

      this.commonService.addData('be-form/submit/be02', formData).subscribe(
        response => {
          if (showMessageAndRedirect) {

            this._snackBar.open(response.message, '', {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
              panelClass: ['customSuccessClass'],

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






  resetBE02FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;
        siteGroup.patchValue({
          relevance: null,
          fitWaterVolume: 0,
          unfitWaterVolume: 0,
          commercialOffset: 0,
          workerFitWater: 0,
          workerUnfitWater: 0,
          commercialFit: 0,
          commercialUnfit: '',
          commercialTotal: 0,
          siteFitness: '',
          relevance1: null,
          dischargeRelevance: null,
          fitDischarged: 0,
          siteFitness1: '',
          comments: ''
        });

        [
          'relevance', 'fitWaterVolume', 'unfitWaterVolume', 'commercialOffset',
          'workerFitWater', 'workerUnfitWater', 'commercialFit', 'commercialUnfit',
          'commercialTotal', 'siteFitness', 'relevance1', 'dischargeRelevance',
          'fitDischarged', 'siteFitness1', 'comments'
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
  }
  getContextDescription(year: number): { financialAsset: string; contextDescription: string }[] {

    if (!this.sites?.length) return [];

    const entries: { financialAsset: string; contextDescription: string }[] = [];

    this.sites.controls.forEach((site: AbstractControl) => {
      const siteGroup = site as FormGroup;

      // BE02 field name
      const financialAsset = siteGroup.get('siteName')?.value;

      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {
        const yearVal = input.get('year')?.value;
        const inputYear = yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);

        const desc = input.get('contextDescription')?.value?.trim();

        if (inputYear == year && desc) {
          entries.push({
            financialAsset,
            contextDescription: desc
          });
        }
      });
    });

    return entries;
  }


  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      relevance: ['', Validators.required],
      relevance1: ['', Validators.required],
      year: [data?.year || new Date().getFullYear()],
      fitWaterVolume: [data?.water_consumption_fit_sources ?? 0],
      unfitWaterVolume: [data?.water_consumption_unfit_sources ?? 0],
      commercialOffset: [data?.commercial_water_consumption_offset ?? 0],
      workerFitWater: [data?.water_consumed_by_workers_fit_sources ?? 0],
      workerUnfitWater: [data?.water_consumed_by_workers_unfit_sources ?? 0],
      commercialFit: [data?.commercial_water_consumption_fit_source ?? 0],
      commercialUnfit: [data?.commercial_water_consumption_unfit_source ?? 0],
      commercialTotal: [data?.total_commercial_water_consumption ?? 0],
      siteFitness: [data?.site_fitness || ''],
      siteFitness1: [data?.site_fitness1 || ''],
      dischargeRelevance: [data?.fit_discharged_water || ''],
      fitDischarged: [data?.total_discharged_water ?? 0],
      totalDischarged: [0],
      contextDescription: [data?.context_description || ''],
      comments: [data?.comments || ''],
    });
  }

  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
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
          form: 'be02'
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
