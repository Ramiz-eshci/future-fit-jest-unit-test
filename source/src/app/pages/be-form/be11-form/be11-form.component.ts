import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-be11-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatOptionModule,  
    NgApexchartsModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
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
  templateUrl: './be11-form.component.html',
  styleUrl: './be11-form.component.scss'
})
export class Be11FormComponent implements OnInit, OnChanges {
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
  routeId: any = '';
  BEID: number = 0;
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute,private dialog: MatDialog,private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
  }
  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
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

  get employee(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }

  ngOnInit(): void {
    console.log('Received fitEntryId from BE10:', this.fitEntryId);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fitEntryId']?.currentValue) {
      console.log('ngOnChanges fitEntryId:', this.fitEntryId); // Should be defined here
    }
  }

  
calculateSiteFitness(employeeIndex: number, inputIndex: number): void {
  const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
  const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
  const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

  const relevance = inputGroup.get('relevance')?.value;

  const livingWageCtrl = inputGroup.get('number_of_employees_living_wage');
  const fitnessCtrl = inputGroup.get('employee_fitness_percentage');
  const employeeCountCtrl = inputGroup.get('fitnessnumber_of_employees'); // 🔹 child-level count

  const rawLivingWage = livingWageCtrl?.value || '0';
  const employeesLivingWage = parseInt(rawLivingWage.toString().replace(/,/g, ''), 10) || 0;

  const rawEmployeeCount = employeeCountCtrl?.value || '0';
  const employeeCount = parseInt(rawEmployeeCount.toString().replace(/,/g, ''), 10) || 0;

  let result: string | number = '';

  if (relevance != 1) {
    livingWageCtrl?.setValue('', { emitEvent: false });
    livingWageCtrl?.disable({ emitEvent: false });
    fitnessCtrl?.setValue('', { emitEvent: false });
    return;
  } else {
    livingWageCtrl?.enable({ emitEvent: false });
  }

  if (employeesLivingWage > employeeCount) {
    result = 'Error';
  } else {
    result = employeeCount == 0 ? 0 : Math.round((employeesLivingWage / employeeCount) * 100) + '%';
  }

  fitnessCtrl?.setValue(result, { emitEvent: false });

  this.calculateBE11DataCompleteness();
  this.formatCalculatedEmployeeFields(inputGroup);
// trigger completeness
  }
  private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value; 
  return num.toLocaleString('en-US');  
}

private formatCalculatedEmployeeFields(inputGroup: FormGroup): void {
  const fieldNames = ['fitnessnumber_of_employees'];
  fieldNames.forEach(name => {
    const control = inputGroup.get(name);
    if (control) {
      const formattedValue = this.formatNumberForDisplay(control.value);
      control.setValue(formattedValue, { emitEvent: false });
    }
  });
}


 
  
  calculateProgressIndicator(year: number): string {
  const includedFitnessInputs: any[] = [];

  this.employee.controls.forEach((employeeGroup: AbstractControl) => {
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

    fitnessInputs.controls.forEach(inputGroup => {
      // Year extraction
      const inputYear = inputGroup.get('year')?.value;
      const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;

      // Year matching
      const isYearMatched = !year || inputYearVal === year;
      if (!isYearMatched) return;

      const relevance = inputGroup.get('relevance')?.value;
      if (relevance == 1) {
        const rawValue = inputGroup.get('fitnessnumber_of_employees')?.value || '0';
        const employeeCount = parseInt(rawValue.toString().replace(/,/g, ''), 10) || 0;

        includedFitnessInputs.push({
          employeeCount,
          fitnessPercent: inputGroup.get('employee_fitness_percentage')?.value || '0%'
        });
      }
    });
  });

  if (includedFitnessInputs.length == 0) return '0%';

  let numerator = 0;
  let denominator = 0;

  includedFitnessInputs.forEach(input => {
    let fitnessValue = input.fitnessPercent;
    if (typeof fitnessValue === 'string') {
      fitnessValue = parseFloat(fitnessValue.replace('%', '')) || 0;
    }

    numerator += input.employeeCount * fitnessValue;
    denominator += input.employeeCount;
  });

  if (denominator == 0 || isNaN(numerator)) return '0%';

  const weightedAverage = numerator / denominator;
  return isNaN(weightedAverage) ? '0%' : Math.round(weightedAverage) + '%';
}


  
 
  calculateContextIndicator(year: number | null): string {
  let total = 0;

  this.employee.controls.forEach((employeeGroup: AbstractControl) => {
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

    fitnessInputs.controls.forEach(inputGroup => {
      // Year filter
      const inputYear = inputGroup.get('year')?.value;
      const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
      const isYearMatched = year == null || inputYearVal === year;

      if (!isYearMatched) return;  

      const relevance = inputGroup.get('relevance')?.value;

      if (relevance == 1) {
        const rawValue = inputGroup.get('fitnessnumber_of_employees')?.value || '0';
        const employeeCount = parseInt(rawValue.toString().replace(/,/g, ''), 10) || 0;

        total += employeeCount;
      }
    });
  });

  return total === 0 ? '' : new Intl.NumberFormat('en-US').format(total);
}


openProgressGraph() {
  this.prepareChartData();

  const dialogRef = this.dialog.open(
    this.progressGraphDialog,
    {
      width: '1000px',
      maxWidth: '95vw'
    }
  );

  dialogRef.afterOpened().subscribe(() => {
    window.dispatchEvent(new Event('resize'));
  });
}
prepareChartData() {

  const years = this.uniqueYearsFromFitnessInputs.sort();

  const progressData = years.map(year => {
    const value = this.calculateProgressIndicator(year);
    return Number(value.replace('%', ''));
  });

  const contextData = years.map(year => {
    return Number(
      this.calculateContextIndicator(year).replace(/,/g, '')
    );
  });

  this.contextUnit = this.goal?.ContextIndicators?.[0]?.unit || '';

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
      toolbar: {
        show: false
      }
    },

    plotOptions: {
      bar: {
        columnWidth:
          years.length <= 3 ? '15%' : '50%'
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
          text: 'Progress Indicator (%)'
        },

        labels: {
          formatter: (val: number) => val + '%'
        }
      },
      {
        opposite: true,

        title: {
          text: 'Context Indicator'
        },

        labels: {
          formatter: (val: number) =>
            Number(val).toLocaleString()
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
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
 
    employeeArray.controls.forEach(empGroup => empGroup.markAllAsTouched());
this.loading = true; 
    const validEmployees = employeeArray.controls
      .map(empGroup => {
        const fitnessInputs = empGroup.get('fitnessInputs') as FormArray;

        const validFitnessInputs = fitnessInputs.controls
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
                fitnessnumber_of_employees: this.parseNumber(val.fitnessnumber_of_employees),
            number_of_employees_living_wage: this.parseNumber(val.number_of_employees_living_wage)
            };
          });

        return {
          ...empGroup.value,
          fitnessInputs: validFitnessInputs
        };
      })
      .filter(emp => emp.fitnessInputs.length > 0);

    if (validEmployees.length == 0) return;  
 
    const years = Array.from(new Set(
      validEmployees.flatMap(emp => emp.fitnessInputs.map((fi: any) => fi.year))
    ));

    const progressIndicatorIds = this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
    const contextIndicatorIds = this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
    const goalCodeId = this.goal?.goal_code || '';

    if (this.routeId !== null && this.routeId !== undefined) {
      this.fitEntryId = this.routeId;
    }
 
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
 
    const formData = {
      employee: validEmployees,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    console.log('BE11 Form Submitted:', formData);
 
    this.commonService.addData('be-form/submit/be11', formData).subscribe(
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
  private cleanFormattedNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') { 
    return obj.replace(/,/g, '');
  }

  if (Array.isArray(obj)) {
    return obj.map(item => this.cleanFormattedNumbers(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = this.cleanFormattedNumbers(obj[key]);
    }
    return cleaned;
  }

  return obj;
}



  calculateBE11DataCompleteness(): string {
    const relevanceValues: number[] = [];

    this.employee.controls.forEach((employeeGroup: AbstractControl) => {
      const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;
        if (relevance !== null && relevance !== undefined) {
          relevanceValues.push(relevance);
        }
      });
    });

    const includedCount = relevanceValues.filter(val => val == 1).length;
    const insufficientDataCount = relevanceValues.filter(val => val == 3).length;
    const otherCount = relevanceValues.filter(val => val == 4).length;

    if (includedCount == 0) {
      return '';
    } else if (insufficientDataCount > 0) {
      return 'Calculation based on incomplete data';
    } else if (otherCount > 0) {
      return 'Calculation may be based on incomplete data';
    } else {
      return 'Calculation based on complete data';
    }
  }


  isAtLeastOneEmployeeValid(): boolean {
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
    return employeeArray.controls.some(empGroup => !!empGroup.get('relevance')?.value);
  }
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id == id);
    return match ? match.name : 'Not set';
  }
  resetBE11FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          number_of_employees_living_wage: 0,
          employee_fitness_percentage: null,
          comments: ''
        });

        [
          'relevance',
          'number_of_employees_living_wage',
          'employee_fitness_percentage',
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
  addFitnessInput(i: number): void {
    const employeeGroup = this.employee.at(i) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

    const newFitnessGroup = this.createFitnessInputBe11();  
    fitnessInputs.push(newFitnessGroup);

    const j = fitnessInputs.length - 1;
 
    const relevanceControl = newFitnessGroup.get('relevance');
    relevanceControl?.valueChanges.subscribe(() => {
      this.calculateSiteFitness(i, j);  

      const yearVal = newFitnessGroup.get('year')?.value;
      const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
      this.calculateProgressIndicator(year as number);
    });
 
    const watchFields = ['number_of_employees_living_wage', 'employee_fitness_percentage', 'year'];
    watchFields.forEach(field => {
      const ctrl = newFitnessGroup.get(field);
      ctrl?.valueChanges.subscribe(() => {
        this.calculateSiteFitness(i, j);  

        const yearVal = newFitnessGroup.get('year')?.value;
        const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
        this.calculateProgressIndicator(year as number);
      });
    });
 
    this.calculateSiteFitness(i, j);

    const yearVal = newFitnessGroup.get('year')?.value;
    const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
    this.calculateProgressIndicator(year as number);
  }

 
  createFitnessInputBe11(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      number_of_employees_living_wage: [data?.number_of_employees_living_wage ?? null],
      employee_fitness_percentage: [data?.employee_fitness_percentage ?? null],
      comments: [data?.comments || '']
    });
  }
   public isValidYearShow(value: any): boolean {
  return value instanceof Date && !isNaN((value as Date).getTime());
}
  
  removeFitnessInput(employeeIndex: number, inputIndex: number): void {
    const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
    const inputs = employeeGroup.get('fitnessInputs') as FormArray;
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
          form: 'be11'
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

  getFitnessInputs(group: AbstractControl): FormArray {
    return group.get('fitnessInputs') as FormArray;
  }
   
   setYear(event: any, datepicker: any, employeeIndex: number, inputIndex: number): void {
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
  
    const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
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
      datepicker.close();
      return;
    }
  
    
    inputGroup.get('year')?.setValue(new Date(selectedYear, 0, 1));
    inputGroup.get('year')?.setErrors(null);
  
     
    const employeeYearMap = employeeGroup.get('employeeYearMap')?.value || {};
    const matchedValue = employeeYearMap[selectedYear] ?? null;
  
    if (matchedValue) {
      inputGroup.get('fitnessnumber_of_employees')?.setValue(matchedValue);
    } else {
      inputGroup.get('fitnessnumber_of_employees')?.reset();  
    }
  
    datepicker.close();
  
     
    this.calculateSiteFitness(employeeIndex, inputIndex);
    this.calculateProgressIndicator(selectedYear);
  }

  get uniqueYearsFromFitnessInputs(): number[] {
    const yearsSet = new Set<number>();

    this.employee.controls.forEach(employee => {
      const fitnessInputs = employee.get('fitnessInputs') as FormArray;
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
  onYearTyped(event: Event, employeeIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length == 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, employeeIndex, inputIndex);
    }
  }
  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }
  
    calculateDataCompleteness(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];
  
    
    this.employee.controls.forEach(employeeGroup => {
      const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
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

  


}
