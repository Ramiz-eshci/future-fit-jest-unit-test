import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';
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
  selector: 'app-be13-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    NgApexchartsModule,
    MatOptionModule,
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
  templateUrl: './be13-form.component.html',
  styleUrl: './be13-form.component.scss'
})
export class Be13FormComponent implements OnInit, OnChanges {
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
          contextUnit: string = '';
  loading: boolean = false;
  relevantsArr: any = [];
  showIndicators: boolean = false;
  routeId: any = '';
  BEID: number = 0;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private dialog: MatDialog,private globalFlagService: GlobalFlagService) {
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fitEntryId']?.currentValue) {
      console.log('ngOnChanges fitEntryId:', this.fitEntryId);
    }
  }

 
  ngOnInit() {
    console.log('Received fitEntryId from BE12:', this.fitEntryId);

    this.employee.controls.forEach((employeeGroup: AbstractControl, empIndex: number) => {
      const fitnessInputs = (employeeGroup.get('fitnessInputs') as FormArray)?.controls || [];

      fitnessInputs.forEach((inputGroup: AbstractControl, inputIndex: number) => {
        const checkboxFields = [
          'clear_policy_commitment',
          'senior_official_responsible',
          'policy_communicated',
          'policy_in_hr_practices',
          'reporting_procedure_available',
          'actions_and_feedback_documented',
          'control_effectiveness_assessed',
          'controls_adjusted_if_needed'
        ];


        const applyRelevanceLogic = (relevance: any) => {
          if (relevance == 1) {

            checkboxFields.forEach(field => {
              inputGroup.get(field)?.enable({ emitEvent: false });
            });
          } else {

            checkboxFields.forEach(field => {
              const ctrl = inputGroup.get(field);
              ctrl?.setValue(false, { emitEvent: false });
              ctrl?.disable({ emitEvent: false });
            });
          }
        };


        checkboxFields.forEach(field => {
          const control = inputGroup.get(field);
          if (control) {
            control.valueChanges.subscribe(() => {
              this.calculateSiteFitness(empIndex, inputIndex);
              const yearVal = inputGroup.get('year')?.value;
              const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
              this.calculateProgressIndicator(year);
            });
          }
        });


        const relevanceControl = inputGroup.get('relevance');
        relevanceControl?.valueChanges.subscribe(relevance => {
          applyRelevanceLogic(relevance);

          this.calculateSiteFitness(empIndex, inputIndex);
          const yearVal = inputGroup.get('year')?.value;
          const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
          this.calculateProgressIndicator(year);
        });


        applyRelevanceLogic(relevanceControl?.value);


        this.calculateSiteFitness(empIndex, inputIndex);
        const yearVal = inputGroup.get('year')?.value;
        const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
        this.calculateProgressIndicator(year);
      });
    });
  }

  ngDoCheck() {
    this.ngOnInit();
  }

  calculateSiteFitness(employeeIndex: number, inputIndex: number): void {
    const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;

    if (relevance != 1) {
      inputGroup.get('employee_fitness_percentage')?.setValue('', { emitEvent: false });
      return;
    }

    const h = inputGroup.get('clear_policy_commitment')?.value;
    const i = inputGroup.get('senior_official_responsible')?.value;
    const group1 = (h === true && i === true) ? 1 : 0;

    const j = inputGroup.get('policy_communicated')?.value;
    const k = inputGroup.get('policy_in_hr_practices')?.value;
    const group2 = (j === true && k === true) ? 1 : 0;

    const l = inputGroup.get('reporting_procedure_available')?.value;
    const m = inputGroup.get('actions_and_feedback_documented')?.value;
    const group3 = (l === true && m === true) ? 1 : 0;

    const n = inputGroup.get('control_effectiveness_assessed')?.value;
    const o = inputGroup.get('controls_adjusted_if_needed')?.value;
    const group4 = (n === true && o === true) ? 1 : 0;

    const T = group1 + group2 + group3 + group4;
    const scoreTable = [0, 0.25, 0.5, 0.75, 1];
    const U = (T >= 0 && T < scoreTable.length) ? scoreTable[T] : 0;

    const fitness = Math.round(U * 100) + '%';
    inputGroup.get('employee_fitness_percentage')?.setValue(fitness, { emitEvent: false });

    this.calculateBE13DataCompleteness();   
     this.formatCalculatedEmployeeFields(inputGroup); 
  }

  calculateBE13DataCompleteness(): string {
    const relevanceValues: any[] = [];

    this.employee.controls.forEach((employeeGroup: AbstractControl) => {
      const fitnessInputs = (employeeGroup.get('fitnessInputs') as FormArray)?.controls;

      fitnessInputs?.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;
        if (relevance !== null && relevance !== undefined) {
          relevanceValues.push(relevance);
        }
      });
    });

    const includedCount = relevanceValues.filter(val => val === 1).length;
    const insufficientCount = relevanceValues.filter(val => val === 3).length;
    const otherCount = relevanceValues.filter(val => val === 4).length;

    if (includedCount === 0) {
      return '';
    } else if (insufficientCount > 0) {
      return 'Calculation based on incomplete data';
    } else if (otherCount > 0) {
      return 'Calculation may be based on incomplete data';
    } else {
      return 'Calculation based on complete data';
    }
  }

 
  calculateProgressIndicator(year: number): string {
    let totalEmployees = 0;
    let weightedSum = 0;

    this.employee.controls.forEach((employeeGroup: AbstractControl) => {
      const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach((inputGroup: AbstractControl) => {
        const inputYear = inputGroup.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
        const isYearMatched = !year || inputYearVal === year;
        if (!isYearMatched) return;

        const relevance = inputGroup.get('relevance')?.value;
        let fitnessValue = inputGroup.get('employee_fitness_percentage')?.value;

        const rawValue = inputGroup.get('fitnessnumber_of_employees')?.value || '0';
        const employeeCount = parseInt(rawValue.toString().replace(/,/g, ''), 10) || 0;

        if (relevance == 1 && employeeCount > 0 && fitnessValue !== null && fitnessValue !== undefined) {
          if (typeof fitnessValue === 'string' && fitnessValue.includes('%')) {
            fitnessValue = parseFloat(fitnessValue.replace('%', '')) / 100;
          } else {
            fitnessValue = +fitnessValue / 100;
          }

          weightedSum += employeeCount * fitnessValue;
          totalEmployees += employeeCount;
        }
      });
    });

    const result = totalEmployees > 0
      ? Math.round((weightedSum / totalEmployees) * 100) + '%'
      : '0%';

    return result;
  }





 

  calculateContextIndicator(year: number | null): number | string {
    let total = 0;

    this.employee.controls.forEach((employeeGroup: AbstractControl) => {
      const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(inputGroup => {
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

    return total == 0 ? '' : new Intl.NumberFormat('en-US').format(total);
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

  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
    employeeArray.controls.forEach(empGroup => empGroup.markAllAsTouched());
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
            };
          });

        return {
          ...empGroup.value,
          fitnessInputs: validFitnessInputs
        };
      })
      .filter(emp => emp.fitnessInputs.length > 0);

    if (validEmployees.length === 0) return;

    this.loading = true;

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

    console.log('BE13 Form Submitted:', formData);

    this.commonService.addData('be-form/submit/be13', formData).subscribe(
      (response: any) => {
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
      (error: any) => {
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

  isAtLeastOneEmployeeValid(): boolean {
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
    return employeeArray.controls.some(empGroup => !!empGroup.get('relevance')?.value);
  }
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }
  resetBE13FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          clear_policy_commitment: false,
          senior_official_responsible: false,
          policy_communicated: false,
          policy_in_hr_practices: false,
          reporting_procedure_available: false,
          actions_and_feedback_documented: false,
          control_effectiveness_assessed: false,
          controls_adjusted_if_needed: false,
          employee_fitness_percentage: null,
          comments: ''
        });

        [
          'relevance',
          'clear_policy_commitment',
          'senior_official_responsible',
          'policy_communicated',
          'policy_in_hr_practices',
          'reporting_procedure_available',
          'actions_and_feedback_documented',
          'control_effectiveness_assessed',
          'controls_adjusted_if_needed',
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
  createFitnessInputBe13(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      clear_policy_commitment: [data?.clear_policy_commitment === 1],
      senior_official_responsible: [data?.senior_official_responsible === 1],
      policy_communicated: [data?.policy_communicated === 1],
      policy_in_hr_practices: [data?.policy_in_hr_practices === 1],
      reporting_procedure_available: [data?.reporting_procedure_available === 1],
      actions_and_feedback_documented: [data?.actions_and_feedback_documented === 1],
      control_effectiveness_assessed: [data?.control_effectiveness_assessed === 1],
      controls_adjusted_if_needed: [data?.controls_adjusted_if_needed === 1],
      employee_fitness_percentage: [data?.employee_fitness_percentage ?? null],
      comments: [data?.comments || '']
    });
  }

  addFitnessInput(i: number): void {
    const employeeGroup = this.employee.at(i) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

    const newFitnessGroup = this.createFitnessInputBe13();  

    fitnessInputs.push(newFitnessGroup);
    const j = fitnessInputs.length - 1;

    const checkboxFields = [
      'clear_policy_commitment',
      'senior_official_responsible',
      'policy_communicated',
      'policy_in_hr_practices',
      'reporting_procedure_available',
      'actions_and_feedback_documented',
      'control_effectiveness_assessed',
      'controls_adjusted_if_needed'
    ];
    const getYear = () => {
      const yearVal = newFitnessGroup.get('year')?.value;
      return yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
    }; 
    const relevanceControl = newFitnessGroup.get('relevance');
    relevanceControl?.valueChanges.subscribe(relevance => {
      
      checkboxFields.forEach(field => {
        const ctrl = newFitnessGroup.get(field);
        ctrl?.setValue(false, { emitEvent: false });
        ctrl?.disable({ emitEvent: false });
      });
 
      if (relevance == 1) {
        checkboxFields.forEach(field => {
          newFitnessGroup.get(field)?.enable({ emitEvent: false });
        });
      }

      this.calculateSiteFitness(i, j);
      const year = getYear();
      this.calculateProgressIndicator(year);
    });
 
    checkboxFields.forEach(field => {
      const ctrl = newFitnessGroup.get(field);
      ctrl?.valueChanges.subscribe(() => {
        this.calculateSiteFitness(i, j);
        const year = getYear();
        this.calculateProgressIndicator(year);
      });
    });
 
    this.calculateSiteFitness(i, j);
    const year = getYear();
    this.calculateProgressIndicator(year);
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
          form: 'be13'
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
   public isValidYearShow(value: any): boolean {
  return value instanceof Date && !isNaN((value as Date).getTime());
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

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
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
    this.calculateContextIndicator(year).toString().replace(/,/g, '')
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

}
