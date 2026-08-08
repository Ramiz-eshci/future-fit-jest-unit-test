import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ReactiveFormsModule, AbstractControl } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-be22-form',
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
  templateUrl: './be22-form.component.html',
  styleUrl: './be22-form.component.scss'
})
export class Be22FormComponent implements OnInit, OnChanges {
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
  showIndicators: boolean = false;
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  routeId: any = '';

  constructor(private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router,private dialog: MatDialog,private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId'); 
    this.parentForm = this.fb.group({
      sites: this.fb.array([])   
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

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fitEntryId']?.currentValue) { 
    }
  }
  ngDoCheck() {
    this.ngOnInit();
  }
  ngOnInit() { 
    this.sites.controls.forEach((siteGroupControl, siteIndex: number) => {
      const fitnessInputs = siteGroupControl.get('fitnessInputs') as FormArray;
      fitnessInputs.controls.forEach((inputGroup, inputIndex) => {
        const getYear = () => {
          const raw = inputGroup.get('year')?.value; 
          return raw instanceof Date ? raw.getFullYear() : +raw || 0;
        };
        const year = getYear();
        const checkboxFields = [
          'lobbying_seek_to_influence',
          'lobbying_supporting_individuals',
          'lobbying_specific_positions',
          'lobbying_all_departments',
          'contributions_directly_undertake',
          'contributions_diligence_before',
          'contributions_recipient_engages',
          'contributions_due_diligence',
          'contributions_regular_review',
          'contributions_clear_guidance',
          'disclosure_recipient_name',
          'disclosure_amount',
          'disclosure_date_of_contribution',
          'disclosure_company_raised'



        ]; 
        checkboxFields.forEach(field => {
          const control = inputGroup.get(field);
          if (control) {
            control.valueChanges.subscribe(() => {
              this.calculateSiteFitness(siteIndex);
              this.calculateProgressIndicator(year)
            });
          }
        });
 const lobbyControl = inputGroup.get('amount_contributed_toLobby');
      if (lobbyControl) {
        lobbyControl.valueChanges.subscribe(val => { 
          this.calculateContextIndicator(year);  
        });
      } 
        this.calculateSiteFitness(siteIndex);
        this.calculateProgressIndicator(year);
        this.calculateContextIndicator(year);

      });
    })
 
  }
 
  currentIndex = 0;
 
calculateProgressIndicator(year: number): string {
  let siteScore = 0;

  const isYes = (val: any): boolean => {
    if (val == null || val == undefined) return false;
    if (typeof val == 'boolean') return val;
    if (typeof val == 'number') return val == 1;
    if (typeof val == 'string') {
      const lower = val.trim().toLowerCase();
      return lower == 'yes' || lower == 'true' || val.trim() == '1';
    }
    return false;
  };

  const countYes = (group: FormGroup, fields: string[]): number => {
    return fields.reduce((count, field) => {
      return count + (isYes(group.get(field)?.value) ? 1 : 0);
    }, 0);
  };

  const firstSite = this.sites.at(0) as FormGroup;
  if (!firstSite) return '0%';

  const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;
  if (fitnessInputs && fitnessInputs.length > 0) {
    fitnessInputs.controls.forEach(inputGroup => {
      const group = inputGroup as FormGroup;

      const rawYear = group.get('year')?.value;
      const inputYear = rawYear instanceof Date ? rawYear.getFullYear() : +rawYear || 0;

      if (inputYear != year) return;

       
      const lobbyingFields = [
        'lobbying_seek_to_influence',
        'lobbying_supporting_individuals',
        'lobbying_specific_positions',
        'lobbying_all_departments'
      ];
      const V8 = countYes(group, lobbyingFields);

      if (V8 == lobbyingFields.length) {
        
        siteScore = 0.33;

         
        const contributionFields = [
          'contributions_directly_undertake',
          'contributions_diligence_before',
          'contributions_recipient_engages',
          'contributions_due_diligence',
          'contributions_regular_review',
          'contributions_clear_guidance'
        ];
        const X8 = countYes(group, contributionFields);

        if (X8 == contributionFields.length) {
          siteScore += 0.33;

          const disclosureFields = [
            'disclosure_recipient_name',
            'disclosure_amount',
            'disclosure_date_of_contribution',
            'disclosure_company_raised'
          ];
          const Z8 = countYes(group, disclosureFields);
          if (Z8 == disclosureFields.length) {
            siteScore += 0.34;
          }
        }
      } else {
        siteScore = 0;
      }
    });
  }
  return Math.round(siteScore * 100) + '%';  
}
 
  countYes(siteGroup: any, fields: string[]): number {
    return fields.reduce((count: number, field: string) => {
      return count + (siteGroup.get(field)?.value === true ? 1 : 0);
    }, 0);
  }






   
calculateContextIndicator(year: number | null): string {
  let total = 0;
  const firstSite = this.sites.at(0) as FormGroup;
  if (!firstSite) return '';

  const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;

  if (fitnessInputs && fitnessInputs.length > 0) {
    fitnessInputs.controls.forEach(input => {
      const inputYearRaw = input.get('year')?.value;
      const inputYearVal =
        inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : inputYearRaw;

      const isYearMatched = year == null || inputYearVal === year;

      if (isYearMatched) { 
        const rawValue = input.get('amount_contributed_toLobby')?.value || '0';
        const value = parseFloat(rawValue.toString().replace(/,/g, '')) || 0;
        total += value;
      }
    });
  }

   return total == 0 ? '' : new Intl.NumberFormat('en-US').format(total); 
}



  calculateSiteFitness(index: number) {

  }
  
  onSubmit(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    if (this.parentForm.valid) {
      const sitesArray = this.parentForm.get(this.arrayName) as FormArray;

this.loading = true;
      sitesArray.controls.forEach(siteGroup => siteGroup.markAllAsTouched());


      const validSites = sitesArray.controls
        .map(siteGroup => {
          const val = siteGroup.value;
          const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

          if (!fitnessInputs || fitnessInputs.length === 0) return null;


          const validFitnessInputs = fitnessInputs.controls
            .map(input => {
              const inputVal = input.value;
              const yearRaw = input.get('year')?.value;

              const isValidYear = yearRaw instanceof Date && !isNaN(yearRaw.getTime());
              if (!isValidYear) return null;

              return {
                ...inputVal,
                year: yearRaw instanceof Date ? yearRaw.getFullYear() : yearRaw,
                 amount_contributed_toLobby: this.parseNumber(inputVal.amount_contributed_toLobby),
              };
            })
            .filter(fi => fi !== null);

          if (validFitnessInputs.length === 0) return null;

          return {
            ...val,
            fitnessInputs: validFitnessInputs
          };
        })
        .filter(site => site !== null);

      if (validSites.length === 0) return;


      const years = Array.from(
        new Set(
          validSites.flatMap((site: any) =>
            site.fitnessInputs.map((fi: any) => fi.year)
          )
        )
      );


      const progressIndicatorIds =
        this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
      const contextIndicatorIds =
        this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
      const goalCodeId = this.goal?.goal_code || '';

      if (this.routeId !== null && this.routeId !== undefined) {
        this.fitEntryId = this.routeId;
      }

      const progressIndicators = years.map(year => ({
        id: progressIndicatorIds[0] || null,
        score: this.calculateProgressIndicator(year),
        year
      }));

      const contextIndicators = years.map(year => ({
        id: contextIndicatorIds[0] || null,
        score: this.parseNumber(this.calculateContextIndicator(year)),
        year
      }));

      const formData = {
        sites: validSites,
        progress_indicators: progressIndicators,
        context_indicators: contextIndicators,
        progress_indicator_ids: progressIndicatorIds,
        context_indicator_ids: contextIndicatorIds,
        goalCode_id: goalCodeId,
        fit_entry_id: this.fitEntryId
      }; 

      this.commonService.addData('be-form/submit/be22', formData).subscribe(
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
  }


  resetBE22FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          lobbying_seek_to_influence: false,
          lobbying_supporting_individuals: false,
          lobbying_specific_positions: false,
          lobbying_all_departments: false,

          contributions_directly_undertake: false,
          contributions_diligence_before: false,
          contributions_recipient_engages: false,
          contributions_due_diligence: false,
          contributions_regular_review: false,
          contributions_clear_guidance: false,

          disclosure_recipient_name: false,
          disclosure_amount: false,
          disclosure_date_of_contribution: false,
          disclosure_company_raised: false
        });

        [
          'lobbying_seek_to_influence',
          'lobbying_supporting_individuals',
          'lobbying_specific_positions',
          'lobbying_all_departments',
          'contributions_directly_undertake',
          'contributions_diligence_before',
          'contributions_recipient_engages',
          'contributions_due_diligence',
          'contributions_regular_review',
          'contributions_clear_guidance',
          'disclosure_recipient_name',
          'disclosure_amount',
          'disclosure_date_of_contribution',
          'disclosure_company_raised'
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
      year: [data?.year || new Date().getFullYear()],
      amount_contributed_toLobby:[data?.amount_contributed_toLobby ||''],
      lobbying_seek_to_influence: [data?.Lobbying_seek_to_influence || false],
      lobbying_supporting_individuals: [data?.Lobbying_supporting_individuals || false],
      lobbying_specific_positions: [data?.Lobbying_specific_positions || false],
      lobbying_all_departments: [data?.Lobbying_all_departments || false],

      contributions_directly_undertake: [data?.contributions_directly_undertake || false],
      contributions_diligence_before: [data?.contributions_diligence_before || false],
      contributions_recipient_engages: [data?.contributions_recipient_engages || false],
      contributions_due_diligence: [data?.contributions_due_diligence || false],
      contributions_regular_review: [data?.contributions_regular_review || false],
      contributions_clear_guidance: [data?.contributions_clear_guidance || false],

      disclosure_recipient_name: [data?.disclosure_recipient_name || false],
      disclosure_amount: [data?.disclosure_amount || false],
      disclosure_date_of_contribution: [data?.disclosure_date_of_contribution || false],
      disclosure_company_raised: [data?.disclosure_company_raised || false],
       comments : [data?.comments || '']
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
          form: 'be22'
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

    this.sites.controls.forEach(site => { 
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      fitnessInputs.controls.forEach(input => {
        const yearVal = input.get('year')?.value; 
        let year: number | null = null;

        if (yearVal instanceof Date) {
          year = yearVal.getFullYear();
        } else if (typeof yearVal === 'number') {
          year = yearVal;
        } else if (typeof yearVal === 'string' && yearVal.length === 4) {
          year = parseInt(yearVal, 10);
        }
 
        if (year && !isNaN(year)) {
          yearsSet.add(year);
        }
      });
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }
  setYear(event: any, datepicker: any, productIndex: number, inputIndex: number): void {
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

    const fitnessInputs = this.sites.at(productIndex).get('fitnessInputs') as FormArray;
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

    const years = this.uniqueYearsFromFitnessInputs;
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

  calculateDataCompleteness(year: number): string {
    const selectedYear = year;

    for (let i = this.sites.length - 1; i >= 0; i--) {
      const siteGroup = this.sites.at(i);
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

      if (!fitnessInputs || !fitnessInputs.length) continue;

      const relevanceValues: number[] = fitnessInputs.controls
        .filter(input => {
          const inputYear = input.get('year')?.value;
          const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
          return inputYearVal === selectedYear;
        })
        .map(input => input.get('relevance')?.value)
        .filter(val => val !== null && val !== undefined && !isNaN(val));

      if (relevanceValues.length > 0) {
        const hasNotRelevant = relevanceValues.includes(2);
        const hasInsufficient = relevanceValues.includes(3);
        const hasOtherExcluded = relevanceValues.includes(4);
        const hasIncluded = relevanceValues.includes(1);

        if (hasNotRelevant) {
          return 'Calculation based on complete data';
        }
        if (hasInsufficient) {
          return 'Calculation based on incomplete data';
        }
        if (hasOtherExcluded) {
          return 'Calculation may be based on incomplete data';
        }
        if (hasIncluded && relevanceValues.every(val => val === 1)) {
          return 'Calculation based on complete data';
        }

        return '';
      }
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

  const years =
    this.uniqueYearsFromFitnessInputs.sort();

  const progressData = years.map(year => {

    const value =
      this.calculateProgressIndicator(year);

    return Number(
      value.replace('%', '')
    );

  });

  const contextData = years.map(year => {

    return Number(
      this.calculateContextIndicator(year)
        .toString()
        .replace(/,/g, '')
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
      },
      zoom: {
        enabled: false
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
          formatter: function (val: number) {
            return val + '%';
          }
        }
      },
      {
        opposite: true,

        title: {
          text: 'Context Indicator'
        },

        labels: {
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



}
