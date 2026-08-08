import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
// import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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

  selector: 'app-be01-form',
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
    NgApexchartsModule,
    MaterialModule, SharedModule, MatDatepickerModule
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
  templateUrl: './be01-form.component.html',
  styleUrl: './be01-form.component.scss'
})
export class Be01FormComponent {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();
  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;
  showGraph = false;
  loading: boolean = false;
  contextUnit: string = '';
  fit_entry: any = '';
  relevantsArr: any = []
  showIndicators: boolean = false;
  routeId: any = '';
  dropdownTouched: boolean[] = [];
  formSubmittedFlag: boolean = false;
  dataCompletenessStatus: string = '';
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;

  remainingYears: number[];
  showRemaining: boolean = false;
  BEID: number = 0; // Default value for BEID

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }

  constructor(private commonService: CommonService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {

    this.routeId = this.route.snapshot.paramMap.get('editFitId');

    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
  }
  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '500px',
      data: { criteria, notes }
    });
  }
  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
    this.getlatestYeardata()

  }
  getlatestYeardata() {
    const allYears = this.uniqueYearsFromFitnessInputs;
    this.topYear = allYears[0];
    this.remainingYears = allYears.slice(1);
  }


  ngOnInit() {
    this.dropdownTouched = this.sites.controls.map(() => false);
    this.sites.controls.forEach((site, i) => {
      const fitnessInputs = (site.get('fitnessInputs') as FormArray).controls;
    });
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

      stroke: {
        width: [4, 0],
        curve: 'straight'
      },
       plotOptions: {
        bar: {
          columnWidth: years.length <= 3 ? '15%' : '50%'
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



  onRelevanceChange(index: number, inputIndex: number) {
    this.dropdownTouched[index] = true;
    this.calculateSiteFitness(index, inputIndex);
    const siteGroup = this.sites.at(index) as FormGroup;
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const yearValue = fitnessInputs.at(inputIndex).get('year')?.value;
    let year: number = 0;
    if (yearValue instanceof Date) {
      year = yearValue.getFullYear();
    } else {
      year = +yearValue;
    }

    this.calculateDataCompleteness(year);
  }

  onYearChange() {
  }


  calculateProgressIndicator(year: number): string {
    let totalRenewable = 0;
    let totalEnergy = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;

        if (!year || inputYearVal === year) {
          const renewable = this.parseNumber(input.get('renewableEnergyUsed')?.value);
          const energy = this.parseNumber(input.get('totalEnergyUsed')?.value);

          totalRenewable += renewable;
          totalEnergy += energy;
        }
      });
    });

    if (totalEnergy === 0) return '0%';
    if (totalRenewable > totalEnergy) return 'Error';

    const percentage = (totalRenewable / totalEnergy) * 100;
    return Math.round(percentage) + '%';
  }

  formatEnergyUsed(input: HTMLInputElement): void {
    const raw = input.value.replace(/,/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      input.value = new Intl.NumberFormat('en-US').format(num);
    }
  }

  unformatEnergyUsed(input: HTMLInputElement): void {
    const raw = input.value.replace(/,/g, '');
    input.value = raw;
  }





  calculateContextIndicator(year: number | null): string {
    let totalSum = 0;

    this.sites.controls.forEach(siteGroup => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const relevance = input.get('relevance')?.value;
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;

        const isYearMatched = year == null || inputYearVal === year;

        if (relevance == 1 && isYearMatched) {
          const value = +input.get('totalEnergyUsed')?.value;
          totalSum += value;
        }
      });
    });
    return new Intl.NumberFormat('en-US').format(totalSum);

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

  parseNumber(val: any): number {
    return Number(val?.toString().replace(/,/g, '')) || 0;
  }

  calculateSiteFitness(siteIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    const relevance = inputGroup.get('relevance')?.value;
    const renewableRaw = inputGroup.get('renewableEnergyUsed')?.value || '';
    const totalRaw = inputGroup.get('totalEnergyUsed')?.value || '';
    const renewable = Number(renewableRaw.toString().replace(/,/g, ''));
    const total = Number(totalRaw.toString().replace(/,/g, ''));
    if (relevance != 1) {
      inputGroup.get('renewableEnergyUsed')?.setValue('');
      inputGroup.get('totalEnergyUsed')?.setValue('');
      inputGroup.get('siteFitness')?.setValue('');

      return;
    }
    if (total === 0) {
      inputGroup.get('siteFitness')?.setValue('', { emitEvent: false });
    } else if (renewable > total) {
      inputGroup.get('siteFitness')?.setValue('Error', { emitEvent: false });
    } else {
      const fitness = (renewable / total) * 100;
      inputGroup.get('siteFitness')?.setValue(Math.round(fitness) + '%', { emitEvent: false });
    }
  }




  isReadOnly(siteIndex: number, inputIndex: number): boolean {
    const fitnessInputs = (this.sites.at(siteIndex).get('fitnessInputs') as FormArray);
    const inputGroup = fitnessInputs.at(inputIndex);
    const relevance = inputGroup.get('relevance')?.value;
    return relevance != undefined && relevance != null && relevance != '' && relevance != 1;
  }



  isAtLeastOneSiteValid(): boolean {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    return siteArray.controls.some(siteGroup => siteGroup.valid);
  }

  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
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
                totalEnergyUsed: this.parseNumber(val.totalEnergyUsed),
                renewableEnergyUsed: this.parseNumber(val.renewableEnergyUsed),
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
      const progressIndicators = years.map(year => ({
        year,
        score: this.calculateProgressIndicator(year),
        dataCompleteness: this.calculateDataCompleteness(year)
      })).flatMap(indicator =>
        progressIndicatorIds.map((id: number) => ({
          id,
          score: indicator.score,
          year: indicator.year,
          dataCompleteness: indicator.dataCompleteness
        }))

      );
      const contextIndicators = years.map(year => ({
        year,
        score: this.parseNumber(this.calculateContextIndicator(year)),
      })).flatMap(indicator =>
        contextIndicatorIds.map((id: number) => ({
          id,
          score: indicator.score,
          year: indicator.year
        }))
      );
      if (this.routeId !== null && this.routeId !== undefined) {
        this.fitEntryId = this.routeId;
      }

      const formData = {
        sites: validSites,
        progress_indicators: progressIndicators,
        context_indicators: contextIndicators,
        progress_indicator_ids: progressIndicatorIds,
        context_indicator_ids: contextIndicatorIds,
        data_completeness: this.dataCompletenessStatus,
        goalCode_id: goalCodeId,
        fit_entry_id: this.fitEntryId, // Use the provided fitEntryId or null if not available
        BEID: this.BEID // Use the provided BEID or default value
      };
      // console.log('BE01 Form Submitted:', formData);
      this.commonService.addData('be-form/submit/be01', formData).subscribe(
        response => {
          this.BEID = response.data.BEID;
          if (showMessageAndRedirect) {
            this._snackBar.open(response.message, '', {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
              panelClass: ['customSuccessClass']
            });
            // this.resetBE01FormFields()
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
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }



  resetBE01FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;
        siteGroup.patchValue({
          relevance: null,
          renewableEnergyUsed: 0,
          totalEnergyUsed: 0,
          siteFitness: '',
          comments: ''
        });

        ['relevance', 'renewableEnergyUsed', 'totalEnergyUsed', 'siteFitness', 'comments'].forEach(field => {
          const control = siteGroup.get(field);
          if (control) {
            control.markAsPristine();
            control.markAsUntouched();
          }
        });
      });
    }
  }

  getFitnessInputs(site: AbstractControl): FormArray {
    return site.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(siteIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const inputs = siteGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || ''],
      renewableEnergyUsed: [data?.amount_of_renewable_energy_used || ''],
      totalEnergyUsed: [data?.total_amount_of_energy_used || ''],
      siteFitness: [data?.site_fitness || ''],
      comments: [data?.comments || ''],
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
          form: 'be01'
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

  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  formatNumber(value: any): string {
    if (value === null || value === undefined) return '';
    const num = Number(String(value).replace(/,/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('en-US');
  }
  onNumberInput(event: any, formGroup: FormGroup, fieldName: string): void {
    const rawValue = event.target.value.replace(/,/g, '');
    const numberValue = Number(rawValue);
    if (!isNaN(numberValue)) {
      formGroup.get(fieldName)?.setValue(numberValue);
      event.target.value = this.formatNumber(numberValue);
    }
  }

  onYearTyped(event: Event, siteIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, siteIndex, inputIndex);
    }
  }



  setYear(event: any, datepicker: any, siteIndex: number, inputIndex: number): void {
    let selectedYear: number;

    if (event && typeof event.year === 'function') {
      selectedYear = event.year(); // moment.js object
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


    const dateForInput = new Date(selectedYear, 0, 1);
    const yearControl = inputGroup.get('year');
    yearControl?.setValue(dateForInput);
    yearControl?.setErrors(null);
    datepicker.close();
  }

  setProgressYear(event: any, datepicker: MatDatepicker<Date>) {
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

    this.selectedProgressYear = selectedYear;
    datepicker.close();
  }

}

