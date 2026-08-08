import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-be10-form',
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
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
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
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './be10-form.component.html',
  styleUrl: './be10-form.component.scss'
})
export class Be10FormComponent implements OnInit, OnChanges {

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
  routeId: any = '';
  BEID: number = 0;
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  activeTab: 'progress' | 'context' = 'progress';
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private router: Router, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
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
    this.ngOnInit();
    if (changes['fitEntryId']?.currentValue) {
      // console.log('ngOnChanges fitEntryId:', this.fitEntryId); // Should be defined here
    }
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

    const progressData = years.map(year => {
      const value = this.calculateProgressIndicator(year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const employeeCount = years.map(year =>
      Number(
        String(this.calculateContextIndicator(0, year))
          .replace(/,/g, '')
      )
    );

    this.chartOptions = {

      series: [
        {
          name: 'Total Number of Employees',
          type: 'column',
          data: employeeCount,
          color: '#43A047'
        },
        {
          name: 'Employee Health & Safety Fitness',
          type: 'line',
          data: progressData,
          color: '#1976D2'
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
        width: [0, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [
        {
          seriesName: ['Employee Health & Safety Fitness'],
          min: 0,
          max: 100,
          title: {
            text: 'Progress Indicator (%)'
          },
          labels: {
            formatter: (v: number) => v + '%'
          }
        },
        {
          // seriesName: ['Water Consumption', 'Water Discharge'],
           seriesName: ['Total Number of Employees'],
          opposite: true,
          title: {
            text: 'Employees'
          },
          labels: {
            formatter: (v: number) => Number(v).toLocaleString('en-US')
          }
        }
      ],

      tooltip: {
        shared: true,
        y: [
          {
            formatter: (value: number) => {
              return Number(value).toLocaleString('en-US');
            }
          },
          {
            formatter: (value: number) => {
              return value + '%';
            }
          }
        ]
      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }


  calculateEmployeeFitness(employeeIndex: number, inputIndex: number): void {
    const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    const inputYearRaw = inputGroup.get('year')?.value;
    const inputYear = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;

    const relevance = inputGroup.get('relevance')?.value;
    const setValue = (val: any) =>
      inputGroup.get('siteFitness')?.setValue(val, { emitEvent: false });

    if (relevance != 1) {
      setValue('');
      return;
    }

    const yes = (field: string) => inputGroup.get(field)?.value == true;

    const baseFields = [
      'hazardControlsInPlace',
      'riskAssessmentDone',
      'riskTrainingProvided',
      'safetyPoliciesMonitored'
    ];
    const allBase = baseFields.every(yes);
    let fitness = '';  // Start with empty string

    if (allBase) {
      let score = 0;

      if (
        yes('antiBullyingPolicy') &&
        yes('flexibleWorkConditions') &&
        yes('stressGuidanceAccess')
      ) {
        score += 0.2;
      }

      if (yes('healthIssueSupportPolicy')) {
        score += 0.2;
      }

      if (
        yes('smokeFreeWorkEnvironment') &&
        yes('smokeFreeCommunalAreas')
      ) {
        score += 0.1;
      }

      if (yes('healthyEatingAccess')) {
        score += 0.1;
      }

      if (
        yes('workBreaksAllowed') &&
        yes('flexibleBreaksForExercise')
      ) {
        score += 0.1;
      }

      score += 0.3;

      if (score > 0) {
        fitness = (score * 100).toFixed(0) + '%';
      }
    }
    setValue(fitness);
    this.calculateDataCompleteness(inputYear);
    this.formatCalculatedEmployeeFields(inputGroup);
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
  ngOnInit() {
    this.employee.controls.forEach((employeeGroup, i) => {
      const fitnessInputs = (employeeGroup.get('fitnessInputs') as FormArray);

      fitnessInputs.controls.forEach((fitnessGroup, j) => {
        const checkboxFields = [
          'hazardControlsInPlace',
          'riskAssessmentDone',
          'riskTrainingProvided',
          'safetyPoliciesMonitored',
          'antiBullyingPolicy',
          'flexibleWorkConditions',
          'stressGuidanceAccess',
          'healthIssueSupportPolicy',
          'smokeFreeWorkEnvironment',
          'smokeFreeCommunalAreas',
          'healthyEatingAccess',
          'workBreaksAllowed',
          'flexibleBreaksForExercise'
        ];

        const getYear = () => {
          const raw = fitnessGroup.get('year')?.value;
          return raw instanceof Date ? raw.getFullYear() : +raw || 0;
        };
        checkboxFields.forEach(field => {
          const control = fitnessGroup.get(field);
          if (control) {
            control.valueChanges.subscribe(() => {
              const year = getYear();
              this.calculateEmployeeFitness(i, j);
              this.calculateProgressIndicator(year);
            });
          }
        });

        const relevanceControl = fitnessGroup.get('relevance');

        const applyRelevanceLogic = (relevance: any) => {
          if (relevance == 1) {
            checkboxFields.forEach(field => {
              fitnessGroup.get(field)?.enable({ emitEvent: false });
            });
          } else {
            checkboxFields.forEach(field => {
              const ctrl = fitnessGroup.get(field);
              ctrl?.setValue(false, { emitEvent: false });
              ctrl?.disable({ emitEvent: false });
            });
          }
        };

        applyRelevanceLogic(relevanceControl?.value);
        relevanceControl?.valueChanges.subscribe(relevance => {
          console.log('New relevance control********----****:', relevance);
          applyRelevanceLogic(relevance);

          const year = getYear();
          this.calculateEmployeeFitness(i, j);
          this.calculateProgressIndicator(year);
        });


        const year = getYear();
        this.calculateEmployeeFitness(i, j);
        this.calculateProgressIndicator(year);
      });
    });
  }

  ngDoCheck() {
    this.ngOnInit();
  }

  // calculateProgressIndicator(year: number): string {
  //   const includedFitnessInputs: any[] = [];

  //   this.employee.controls.forEach(employeeGroup => {
  //     const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

  //     fitnessInputs.controls.forEach(inputGroup => {
  //       const relevance = inputGroup.get('relevance')?.value;

  //       // Year handling
  //       const inputYearRaw = inputGroup.get('year')?.value;
  //       const inputYear = inputYearRaw instanceof Date
  //         ? inputYearRaw.getFullYear()
  //         : +inputYearRaw || 0;

  //       if (relevance == 1 && inputYear == year) {
  //         includedFitnessInputs.push({
  //           employeeNo: +employeeGroup.get('EmployeeNO')?.value || 0,
  //           siteFitness: inputGroup.get('siteFitness')?.value || '0%'
  //         });
  //       }
  //     });
  //   });

  //   if (includedFitnessInputs.length == 0) return '';

  //   let numerator = 0;
  //   let denominator = 0;

  //   includedFitnessInputs.forEach(input => {
  //     const fitnessValue = parseFloat(input.siteFitness.replace('%', '')) || 0;
  //     numerator += input.employeeNo * fitnessValue;
  //     denominator += input.employeeNo;
  //   });

  //   if (denominator == 0) return '';

  //   const weightedAverage = numerator / denominator;
  //   return Math.round(weightedAverage) + '%';
  // } 


  calculateProgressIndicator(year: number): string {
    const includedFitnessInputs: any[] = [];

    this.employee.controls.forEach(employeeGroup => {
      const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;

        const inputYearRaw = inputGroup.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : +inputYearRaw || 0;

        if (relevance == 1 && inputYear == year) {
          const rawValue = inputGroup.get('fitnessnumber_of_employees')?.value || '0';
          const employeeCount = parseInt(rawValue.toString().replace(/,/g, ''), 10) || 0;

          includedFitnessInputs.push({
            employeeCount,
            siteFitness: inputGroup.get('siteFitness')?.value || '0%'
          });
        }
      });
    });

    if (includedFitnessInputs.length == 0) return '';

    let numerator = 0;
    let denominator = 0;

    includedFitnessInputs.forEach(input => {
      const fitnessValue = parseFloat(input.siteFitness.replace('%', '')) || 0;
      numerator += input.employeeCount * fitnessValue;
      denominator += input.employeeCount;
    });

    if (denominator == 0) return '';

    const weightedAverage = numerator / denominator;
    return Math.round(weightedAverage) + '%';
  }




  // calculateDataCompleteness(year: number): string {
  //   const selectedYear = year;

  //   for (let i = this.employee.length - 1; i >= 0; i--) {
  //     const employeeGroup = this.employee.at(i);
  //     const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

  //     if (!fitnessInputs || !fitnessInputs.length) continue;

  //     const relevanceValues: number[] = fitnessInputs.controls
  //       .filter(input => {
  //         const inputYear = input.get('year')?.value;
  //         const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  //         return inputYearVal === selectedYear;
  //       })
  //       .map(input => input.get('relevance')?.value)
  //       .filter(val => val !== null && val !== undefined && !isNaN(val));

  //     if (relevanceValues.length > 0) {
  //       const hasNotRelevant = relevanceValues.includes(2);
  //       const hasInsufficient = relevanceValues.includes(3);
  //       const hasOtherExcluded = relevanceValues.includes(4);
  //       const hasIncluded = relevanceValues.includes(1);

  //       if (hasNotRelevant) {
  //         return 'Calculation based on complete data';
  //       }
  //       if (hasInsufficient) {
  //         return 'Calculation based on incomplete data';
  //       }
  //       if (hasOtherExcluded) {
  //         return 'Calculation may be based on incomplete data';
  //       }
  //       if (hasIncluded && relevanceValues.every(val => val == 1)) {
  //         return 'Calculation based on complete data';
  //       }

  //       return '';
  //     }
  //   }

  //   return '';
  // }
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
  getContextDescription(year: number, index: number): { siteName: string; contextDescription: string }[] {

    const entries: any[] = [];
    if (!this.employee?.length) return entries;

    this.employee.controls.forEach((emp: AbstractControl) => {

      const siteName = emp.get('employeeGroup')?.value;
      const fitnessInputs = emp.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {

        const yearVal = input.get('year')?.value;
        const inputYear =
          yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);


        let desc = '';

        if (index == 1) {
          desc = (input.get('contextDescription')?.value || '').trim();
        }
        else if (index == 2) {
          desc = (input.get('contextDescription1')?.value || '').trim();
        }

        if (inputYear == year && desc) {
          entries.push({ siteName, contextDescription: desc });
        }

      });

    });

    return entries;
  }

  getContextDescription1(year: number): { siteName: string; contextDescription: string }[] {

    const entries: any[] = [];
    if (!this.employee?.length) return entries;

    this.employee.controls.forEach((emp: AbstractControl) => {

      const siteName = emp.get('employeeGroup')?.value;
      const fitnessInputs = emp.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {

        const yearVal = input.get('year')?.value;
        const inputYear =
          yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);

        const desc = (input.get('contextDescription')?.value || '').trim();

        if (inputYear == year && desc) {
          entries.push({ siteName, contextDescription: desc });
        }

      });

    });

    return entries;
  }











  calculateContextIndicator(index: number, year: number | null): number | string {
    // if (index == 1) {
    //   return 'Description of number of accidents and days lost';
    // }

    // if (index == 2) {
    //   return 'Description of number of fatalities';
    // }

    if (index == 0) {
      let totalFit = 0;

      this.employee.controls.forEach((employeeGroup: AbstractControl) => {
        const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;
        if (!fitnessInputs) return;

        fitnessInputs.controls.forEach(inputGroup => {
          const relevance = +inputGroup.get('relevance')?.value || 0;
          if (relevance != 1) return;

          // Extract year
          const yearRaw = inputGroup.get('year')?.value;
          const inputYear = yearRaw instanceof Date
            ? yearRaw.getFullYear()
            : (isNaN(+yearRaw) ? null : +yearRaw);

          // Year filter check
          if (year != null && inputYear !== year) return;


          const rawValue = inputGroup.get('fitnessnumber_of_employees')?.value || '0';
          const employeeCount = parseInt(rawValue.toString().replace(/,/g, ''), 10) || 0;

          totalFit += employeeCount;
        });
      });

      return totalFit === 0 ? '' : new Intl.NumberFormat('en-US').format(totalFit);
    }

    return '';
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
  switchTab(tab: 'progress' | 'context') {
    this.activeTab = tab;
  }
  // setYear(event: any, datepicker: any, employeeIndex: number, inputIndex: number): void {
  //   let selectedYear: number;

  //   if (event && typeof event.year === 'function') {
  //     selectedYear = event.year();
  //   } else if (typeof event === 'number') {
  //     selectedYear = event;
  //   } else if (event instanceof Date) {
  //     selectedYear = event.getFullYear();
  //   } else {
  //     console.error('Unexpected yearSelected event value:', event);
  //     return;
  //   }

  //   const fitnessInputs = this.employee.at(employeeIndex).get('fitnessInputs') as FormArray;
  //   const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

  //   const isDuplicate = fitnessInputs.controls.some((input, idx) => {
  //     if (idx === inputIndex) return false;
  //     const yearVal = input.get('year')?.value;
  //     const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
  //     return year === selectedYear;
  //   });

  //   if (isDuplicate) {
  //     inputGroup.get('year')?.setValue(null);
  //     inputGroup.get('year')?.setErrors({ duplicateYear: true });
  //     inputGroup.get('year')?.markAsTouched();
  //     datepicker.close();
  //     return;
  //   }

  //   const dateForInput = new Date(selectedYear, 0, 1);
  //   const yearControl = inputGroup.get('year');
  //   yearControl?.setValue(dateForInput);
  //   yearControl?.setErrors(null);
  //   datepicker.close();

  //   const years = this.uniqueYearsFromFitnessInputs;
  // }

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


    this.calculateEmployeeFitness(employeeIndex, inputIndex);
    this.calculateProgressIndicator(selectedYear);
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

  isAtLeastOneEmployeeValid(): boolean {
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
    return employeeArray.controls.some(empGroup => !!empGroup.get('relevance')?.value);
  }
  createFitnessInputBe10(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      hazardControlsInPlace: [data?.hazard_controls_in_place == 1],
      riskAssessmentDone: [data?.risk_assessment_done == 1],
      riskTrainingProvided: [data?.risk_training_provided == 1],
      safetyPoliciesMonitored: [data?.safety_policies_monitored == 1],
      antiBullyingPolicy: [data?.anti_bullying_policy == 1],
      flexibleWorkConditions: [data?.flexible_work_conditions == 1],
      stressGuidanceAccess: [data?.stress_guidance_access == 1],
      healthIssueSupportPolicy: [data?.health_issue_support_policy == 1],
      smokeFreeWorkEnvironment: [data?.smoke_free_work_environment == 1],
      smokeFreeCommunalAreas: [data?.smoke_free_communal_areas == 1],
      healthyEatingAccess: [data?.healthy_eating_access == 1],
      workBreaksAllowed: [data?.work_breaks_allowed == 1],
      flexibleBreaksForExercise: [data?.flexible_breaks_for_exercise == 1],
      siteFitness: [data?.site_fitness ?? null],
      contextDescription: [data?.context_description || ''],
      contextDescription1: [data?.context_description1 || ''],
      comments: [data?.comments || ''],
    });
  }
  triggerChangeDetection(): void {
    this.cdr.detectChanges();
  }
  // removeFitnessInput(employeeIndex: number, inputIndex: number): void {
  //   const employeeGroup = this.employee.at(employeeIndex) as FormGroup;
  //   const inputs = employeeGroup.get('fitnessInputs') as FormArray;

  //   if (inputs.length > 1) {
  //     inputs.removeAt(inputIndex);
  //   }
  // }
  getFitnessInputs(group: AbstractControl): FormArray {
    return group.get('fitnessInputs') as FormArray;
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
          form: 'be10'
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
  // submitForm() {
  //   const employeeArray = this.parentForm.get(this.arrayName) as FormArray;
  //   employeeArray.controls.forEach(empGroup => {
  //     empGroup.markAllAsTouched();
  //   });
  //   const validEmployees = employeeArray.controls
  //     .map(empGroup => {
  //       const fitnessInputs = empGroup.get('fitnessInputs') as FormArray;
  //       const validFitnessInputs = fitnessInputs.controls.filter(input =>
  //         !!input.get('relevance')?.value
  //       );
  //       if (validFitnessInputs.length > 0) {
  //         return {
  //           ...empGroup.value,
  //           fitnessInputs: validFitnessInputs.map(input => input.value)
  //         };
  //       }
  //       return null;
  //     })
  //     .filter(group => group !== null);
  //   const atLeastOneValid = validEmployees.length > 0;
  //   if (atLeastOneValid) {
  //     const progressIndicatorVal = this.calculateProgressIndicator(1);
  //     const contextIndixator_TotalNo = this.calculateContextIndicator(0,1);
  //     const contextIndixator_Work_related_accidents = this.calculateContextIndicator(1,1);
  //     const contextIndixator_Work_related_fatalities = this.calculateContextIndicator(2,1);
  //     const progressIndicatorIds = this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
  //     const contextIndicatorIds = this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
  //     const goalCodeId = this.goal?.goal_code || '';
  //     if (this.routeId !== null && this.routeId !== undefined) {
  //       this.fitEntryId = this.routeId;
  //     }
  //     const completeness = this.calculateDataCompleteness(1);
  //     const formData = {
  //       employee: validEmployees,
  //       progressIndicatorVal,
  //       contextIndixator_TotalNo,
  //       contextIndixator_Work_related_accidents,
  //       data_completeness: {
  //         employee: completeness
  //       },
  //       contextIndixator_Work_related_fatalities,
  //       progress_indicator_ids: progressIndicatorIds,
  //       context_indicator_ids: contextIndicatorIds,
  //       goalCode_id: goalCodeId,
  //       fit_entry_id: this.fitEntryId
  //     };

  //     console.log('BE10 Form Submitted:', formData);

  //     this.commonService.addData('be-form/submit/be10', formData).subscribe(
  //       response => {


  //         this._snackBar.open(response.message, '', {
  //           duration: 2000,
  //           verticalPosition: 'top',
  //           horizontalPosition: 'end',
  //           panelClass: ['customSuccessClass']
  //         });



  //         setTimeout(() => {
  //           this.loading = false;
  //           this.router.navigate(['/be-form']);
  //         }, 2000);

  //         // this.formSubmitted.emit({
  //         //   fitEntryId: this.fitEntryId,
  //         //   nextForm: 'BE11'
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
    const employeeArray = this.parentForm.get(this.arrayName) as FormArray;

    // Mark all touched
    employeeArray.controls.forEach(empGroup => empGroup.markAllAsTouched());
    this.loading = true;
    // Filter valid employees (relevance + valid year)
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

    if (validEmployees.length == 0) return; // stop if nothing valid

    // Collect distinct years
    const years = Array.from(new Set(
      validEmployees.flatMap(emp => emp.fitnessInputs.map((fi: any) => fi.year))
    ));

    const progressIndicatorIds = this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
    const contextIndicatorIds = this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
    const goalCodeId = this.goal?.goal_code || '';

    if (this.routeId !== null && this.routeId !== undefined) {
      this.fitEntryId = this.routeId;
    }

    // === Per-year Progress Indicators ===
    const progressIndicators = years.map(year => ({
      id: progressIndicatorIds[0],
      score: this.calculateProgressIndicator(year),
      year,
      dataCompleteness: this.calculateDataCompleteness(year)
    }));

    // === Per-year Context Indicators ===
    const contextIndicators = years.map(year => ([
      {
        id: contextIndicatorIds[0], // Total No
        score: this.parseNumber(this.calculateContextIndicator(0, year)),
        year
      },
      {
        id: contextIndicatorIds[1], // Work-related accidents
        score: this.parseNumber(this.calculateContextIndicator(1, year)),
        year
      },
      {
        id: contextIndicatorIds[2], // Work-related fatalities
        score: this.parseNumber(this.calculateContextIndicator(2, year)),
        year
      }
    ])).flat();

    // === Final payload ===
    const formData = {
      employee: validEmployees,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    console.log('BE10 Form Submitted:', formData);

    // === API Call ===
    this.commonService.addData('be-form/submit/be10', formData).subscribe(
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



  addFitnessInput(i: number): void {
    const employeeGroup = this.employee.at(i) as FormGroup;
    const fitnessInputs = employeeGroup.get('fitnessInputs') as FormArray;

    const newFitnessGroup = this.createFitnessInputBe10();  // Your method to create a FormGroup

    fitnessInputs.push(newFitnessGroup);

    const j = fitnessInputs.length - 1;

    const checkboxFields = [
      'hazardControlsInPlace',
      'riskAssessmentDone',
      'riskTrainingProvided',
      'safetyPoliciesMonitored',
      'antiBullyingPolicy',
      'flexibleWorkConditions',
      'stressGuidanceAccess',
      'healthIssueSupportPolicy',
      'smokeFreeWorkEnvironment',
      'smokeFreeCommunalAreas',
      'healthyEatingAccess',
      'workBreaksAllowed',
      'flexibleBreaksForExercise'
    ];


    checkboxFields.forEach(field => {
      const control = newFitnessGroup.get(field);
      if (control) {
        control.valueChanges.subscribe(() => {
          this.calculateEmployeeFitness(i, j);
          // this.calculateProgressIndicator();
        });
      }
    });


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

      this.calculateEmployeeFitness(i, j);
      //this.calculateProgressIndicator();
    });


    this.calculateEmployeeFitness(i, j);
    // this.calculateProgressIndicator();
  }


  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }

  resetBE10FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          hazardControlsInPlace: false,
          riskAssessmentDone: false,
          riskTrainingProvided: false,
          safetyPoliciesMonitored: false,
          antiBullyingPolicy: false,
          flexibleWorkConditions: false,
          stressGuidanceAccess: false,
          healthIssueSupportPolicy: false,
          smokeFreeWorkEnvironment: false,
          smokeFreeCommunalAreas: false,
          healthyEatingAccess: false,
          workBreaksAllowed: false,
          flexibleBreaksForExercise: false,
          siteFitness: null,
          comments: ''
        });

        [
          'relevance',
          'hazardControlsInPlace',
          'riskAssessmentDone',
          'riskTrainingProvided',
          'safetyPoliciesMonitored',
          'antiBullyingPolicy',
          'flexibleWorkConditions',
          'stressGuidanceAccess',
          'healthIssueSupportPolicy',
          'smokeFreeWorkEnvironment',
          'smokeFreeCommunalAreas',
          'healthyEatingAccess',
          'workBreaksAllowed',
          'flexibleBreaksForExercise',
          'siteFitness',
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

}


