import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';

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
import { trigger, state, style, animate, transition, group } from '@angular/animations';
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
  selector: 'app-be21-form',
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
  templateUrl: './be21-form.component.html',
  styleUrl: './be21-form.component.scss'
})
export class Be21FormComponent implements OnInit, OnChanges {

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
  loading: boolean = false;;
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  routeId: any = '';

  constructor(private cd: ChangeDetectorRef,private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router,private dialog: MatDialog,private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    // Initialize the form with necessary fields
    this.parentForm = this.fb.group({
      sites: this.fb.array([])  // Define FormArray for sites
    });
  }
  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }
    openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '700px',
      data: { criteria, notes }
    });
  }

 ngOnChanges(changes: SimpleChanges) {
   if (changes['parentForm'] && this.parentForm) {
    this.intializeFitnessInput();
  }
}

  toggleIndicators() {       
    this.showIndicators = !this.showIndicators;
     this.uniqueYearsFromFitnessInputs.forEach(year => {
     
    this.calculateContextIndicator(year);
  });
  }

  ngOnInit(): void {
  this.sites.valueChanges.subscribe(val => {
    if (this.sites.length > 0) {
      console.log('Sites updated, re-initializing...');
      this.intializeFitnessInput();
    }
  });
}

  ngDoCheck() {
     
  }
  ngAfterViewInit() {
  setTimeout(() => {
    if (this.sites.length > 0) {
      this.intializeFitnessInput();
    }
  });
}




   
  intializeFitnessInput() {
  
  const contextFields = [
    'public_tax_direct',
    'country_by_disclose',
    'country_by_residence',
    'country_by_net_asset_value',
    'country_by_net_period_provided',
    'country_by_income',
    'country_by_current_tax_charge',
    'country_by_average_number'
  ];

  
const setupGroupSubscriptions = (group: FormGroup, siteIndex: number) => {
  const getYear = () => {
    const raw = group.get('year')?.value;
    return raw instanceof Date ? raw.getFullYear() : +raw || 0;
  };
  const year = getYear();
 
  const companyMncControl = group.get('companyis_mnc');
  companyMncControl?.valueChanges.subscribe((value: any) => {
    const currentYear = getYear();
    if (value == true || value == 1 || value == 'Yes') {
      this.enableContextFields(group);
    } else {
      contextFields.forEach(field => {
        group.get(field)?.setValue(false, { emitEvent: false });
      });
      this.disableContextFields(group);
    }

    this.calculateSiteFitness(siteIndex);
    this.calculateProgressIndicator(currentYear);
    this.calculateContextIndicator(currentYear);
  });

  const initialValue = companyMncControl?.value;
  if (initialValue == true || initialValue == 1 || initialValue == 'Yes') {
    this.enableContextFields(group);
  } else {
    this.disableContextFields(group);
  }

  // Checkbox subscriptions
  const checkboxFields = [
    'public_website', 'public_tax_appointed', 'public_tax_strategy', 'public_tax_marketed',
    'public_tax_no_tax', 'public_tax_direct', 'public_tax_stated', 'public_tax_independent',
    'public_tax_discloses',
    'transparency_company', 'transparency_evidence', 'transparency_address', 'transparency_ultimate',
    'taxrate_reconciliation', 'taxrate_current', 'taxrate_narrative', 'taxrate_deferred',
    ...contextFields
  ];

  checkboxFields.forEach(field => {
    group.get(field)?.valueChanges.subscribe(() => {
      const currentYear = getYear();
      this.calculateSiteFitness(siteIndex);
      this.calculateProgressIndicator(currentYear);
      this.calculateContextIndicator(currentYear);
    });
  });

  // Initial calculation
  this.calculateSiteFitness(siteIndex);
  this.calculateProgressIndicator(year);
  this.calculateContextIndicator(year);
};


 
  const firstSite = this.sites.at(0) as FormGroup;
  if (firstSite) {
    const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;
    if (fitnessInputs && fitnessInputs.length > 0) {
      fitnessInputs.controls.forEach((inputGroup) => {
        setupGroupSubscriptions(inputGroup as FormGroup, 0); // always index 0
      });
    } else {
      setupGroupSubscriptions(firstSite as FormGroup, 0); // always index 0
    }
  }

   
  this.uniqueYearsFromFitnessInputs.forEach(year => {
    this.calculateProgressIndicator(year);
    this.calculateContextIndicator(year);
  });
 
}
 
  disableContextFields(siteGroup: FormGroup): void {
    
  const contextFields = [
    'country_by_disclose',
    'country_by_residence',
    'country_by_net_asset_value',
    'country_by_net_period_provided',
    'country_by_income',
    'country_by_current_tax_charge',
    'country_by_average_number',
    'public_tax_direct'
  ];

  contextFields.forEach(field => {
    const control = siteGroup.get(field);
    if (control) {
      control.disable({ emitEvent: false });
    }
  });

   
  this.cd.detectChanges();
}

  enableContextFields(siteGroup: FormGroup): void {
    const contextFields = [
      'country_by_disclose',
      'country_by_residence',
      'country_by_net_asset_value',
      'country_by_net_period_provided',
      'country_by_income',
      'country_by_current_tax_charge',
      'country_by_average_number',
      'public_tax_direct'
    ];

    contextFields.forEach(field => {
      const control = siteGroup.get(field);
      control?.enable({ emitEvent: false });
    });
  } 
calculateProgressIndicator(year: number): string {
  let totalScore = 0;
  let totalSites = 0;

  const group1 = [
    'public_website',
    'public_tax_appointed',
    'public_tax_strategy',
    'public_tax_marketed',
    'public_tax_no_tax'
  ];
  const group2 = ['public_tax_direct'];  
  const group3 = [
    'public_tax_stated',
    'public_tax_independent',
    'public_tax_discloses'
  ];

  const transparencyFields = [
    'transparency_company',
    'transparency_evidence',
    'transparency_address',
    'transparency_ultimate'
  ];

  const taxRateFields = [
    'taxrate_reconciliation',
    'taxrate_current',
    'taxrate_narrative',
    'taxrate_deferred'
  ];
 
  const isYes = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      return lower === 'yes' || lower === 'true' || val.trim() === '1';
    }
    return false;
  };

  const isNo = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return !val;
    if (typeof val === 'number') return val === 0;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      return lower === 'no' || lower === 'false' || val.trim() === '0';
    }
    return false;
  };

  //  Helper to calculate site score
  const calculateScores = (group: AbstractControl) => {
    const inputYearRaw = group.get('year')?.value;
    const inputYear =
      inputYearRaw instanceof Date
        ? inputYearRaw.getFullYear()
        : Number(inputYearRaw) || 0;

    if (inputYear !== year) return;

    const isMNC = group.get('companyis_mnc')?.value;
    const isMNCYes = isYes(isMNC);
    const isMNCNo = isNo(isMNC);

    if (!(isMNCYes || isMNCNo)) return;
 
    let yesCount = 0;
    [...group1, ...group3].forEach(field => {
      if (isYes(group.get(field)?.value)) yesCount++;
    });
 
    if (isMNCYes) {
      group2.forEach(field => {
        if (isYes(group.get(field)?.value)) yesCount++;
      });
    }
 
    let transparencyScore = 0;
    transparencyFields.forEach(field => {
      if (isYes(group.get(field)?.value)) transparencyScore++;
    });

    let taxrateScore = 0;
    taxRateFields.forEach(field => {
      if (isYes(group.get(field)?.value)) taxrateScore++;
    });

    const divisor = isMNCYes ? 17 : 16;
    const siteScore = (yesCount + transparencyScore + taxrateScore) / divisor;

    console.log({
      year: inputYear,
      yesCount,
      transparencyScore,
      taxrateScore,
      divisor,
      siteScore
    });

    totalScore += siteScore;
    totalSites++;
  };

   
  const firstSite = this.sites.at(0) as FormGroup;
  if (firstSite) {
    const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;
    if (fitnessInputs && fitnessInputs.length > 0) {
      fitnessInputs.controls.forEach(inputGroup => calculateScores(inputGroup));
    } else {
      calculateScores(firstSite);
    }
  }

  if (totalSites === 0) return '';
  const average = totalScore / totalSites;
  return Math.round(average * 100) + '%';
}
 
  public isValidYearShow(value: any): boolean {
  return value instanceof Date && !isNaN((value as Date).getTime());
}
 calculateContextIndicator(year: number): string {
  let total = 0;
  let totalSites = 0;

  const contextFields = [
    'country_by_disclose',
    'country_by_residence',
    'country_by_net_asset_value',
    'country_by_net_period_provided',
    'country_by_income',
    'country_by_current_tax_charge',
    'country_by_average_number'
  ];

  let hasNACase = false;
 
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

  const isNo = (val: any): boolean => {
    if (val == null || val == undefined) return false;
    if (typeof val == 'boolean') return !val;
    if (typeof val == 'number') return val == 0;
    if (typeof val == 'string') {
      const lower = val.trim().toLowerCase();
      return lower == 'no' || lower == 'false' || val.trim() == '0';
    }
    return false;
  };

  //  Sirf 1st site lo
  const firstSite = this.sites.at(0) as FormGroup;
  if (!firstSite) return '';

  const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;

  const calculateScores = (group: AbstractControl) => {
    const inputYearRaw = group.get('year')?.value;
    const inputYear =
      inputYearRaw instanceof Date
        ? inputYearRaw.getFullYear()
        : Number(inputYearRaw) || 0;

    if (inputYear !== year) return;

    const isMNC = group.get('companyis_mnc')?.value;

    if (isNo(isMNC)) {
      hasNACase = true;
      return;
    }
    if (!(isYes(isMNC) || isNo(isMNC))) return;

    let yesCount = 0;
    contextFields.forEach(field => {
      if (isYes(group.get(field)?.value)) {
        yesCount++;
      }
    });

    const siteScore = yesCount / contextFields.length;
    total += siteScore;
    totalSites++;
  };

  if (fitnessInputs && fitnessInputs.length > 0) {
    fitnessInputs.controls.forEach(inputGroup => calculateScores(inputGroup));
  } else {
    calculateScores(firstSite);
  }

  if (hasNACase) return 'N/A';
  if (totalSites == 0) return '';

  const average = total / totalSites;
  return Math.round(average * 100) + '%';
}


  
  calculateSiteFitness(index: number) {
  const siteGroup = this.sites.at(index);
  const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
 
  const isYes = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      return lower === 'yes' || lower === 'true' || val.trim() === '1';
    }
    return false;
  };

  const calculateScores = (group: AbstractControl) => {
    const taxScoringFields = [
      'public_website',
      'public_tax_appointed',
      'public_tax_strategy',
      'public_tax_marketed',
      'public_tax_no_tax',
      'public_tax_direct',
      'public_tax_stated',
      'public_tax_independent',
      'public_tax_discloses'
    ];

    const transparencyFields = [
      'transparency_company',
      'transparency_evidence',
      'transparency_address',
      'transparency_ultimate'
    ];

    const taxRateFields = [
      'taxrate_reconciliation',
      'taxrate_current',
      'taxrate_narrative',
      'taxrate_deferred'
    ];

    const countryByFields = [
      'country_by_disclose',
      'country_by_residence',
      'country_by_net_asset_value',
      'country_by_net_period_provided',
      'country_by_income',
      'country_by_current_tax_charge',
      'country_by_average_number'
    ];
 
    let taxTotalScore = 0;
    taxScoringFields.forEach(field => {
      if (isYes(group.get(field)?.value)) {
        taxTotalScore++;
      }
    });
    group.get('tax_policies_totalescore')?.setValue(taxTotalScore, { emitEvent: false });
 
    let transparencyScore = 0;
    transparencyFields.forEach(field => {
      if (isYes(group.get(field)?.value)) {
        transparencyScore++;
      }
    });
    group.get('transparency_totalescore')?.setValue(transparencyScore, { emitEvent: false });
 
    let taxRateScore = 0;
    taxRateFields.forEach(field => {
      if (isYes(group.get(field)?.value)) {
        taxRateScore++;
      }
    });
    group.get('taxrate_totalescore')?.setValue(taxRateScore, { emitEvent: false });
 
    let countryByScore = 0;
    countryByFields.forEach(field => {
      if (isYes(group.get(field)?.value)) {
        countryByScore++;
      }
    });
    group.get('country_by_total_context_score')?.setValue(countryByScore, { emitEvent: false });
  };
 
  if (fitnessInputs && fitnessInputs.length > 0) {
    fitnessInputs.controls.forEach(inputGroup => {
      calculateScores(inputGroup);
    });
  } else {
    calculateScores(siteGroup);
  }
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
                year: yearRaw instanceof Date ? yearRaw.getFullYear() : yearRaw
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
 

      this.commonService.addData('be-form/submit/be21', formData).subscribe(
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





 

  getFitnessInputs(group: AbstractControl): FormArray {
    return (group?.get('fitnessInputs') as FormArray) || this.fb.array([]);
  }



  addFitnessInput(siteIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    // console.log(siteGroup, 'siteGroup')
    let inputs = siteGroup.get('fitnessInputs') as FormArray;
    if (!inputs) {
      inputs = new FormArray<FormGroup>([]);
      siteGroup.addControl('fitnessInputs', inputs);
    }
    inputs.push(this.createFitnessInput());
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      companyis_mnc: [data?.companyis_mnc || false],
      not_relevant_for_nonprofit:[data?.not_relevant_for_nonprofit || false],
      public_website: [data?.public_website || false],
      public_tax_appointed: [data?.public_tax_appointed || false],
      public_tax_strategy: [data?.public_tax_strategy || false],
      public_tax_marketed: [data?.public_tax_marketed || false],
      public_tax_no_tax: [data?.public_tax_no_tax || false],
      public_tax_direct: [data?.public_tax_direct || false],
      public_tax_stated: [data?.public_tax_stated || false],
      public_tax_independent: [data?.public_tax_independent || false],
      public_tax_discloses: [data?.public_tax_discloses || false],
      tax_policies_totalescore: [data?.tax_policies_totalescore || null],

      transparency_company: [data?.transparency_company || false],
      transparency_evidence: [data?.transparency_evidence || false],
      transparency_address: [data?.transparency_address || false],
      transparency_ultimate: [data?.transparency_ultimate || false],
      transparency_totalescore: [data?.transparency_totalescore || null],
      taxrate_reconciliation: [data?.taxrate_reconciliation || false],
      taxrate_current: [data?.taxrate_current || false],
      taxrate_narrative: [data?.taxrate_narrative || false],
      taxrate_deferred: [data?.taxrate_deferred || false],
      taxrate_totalescore: [data?.taxrate_totalescore || null],

      country_by_disclose: [data?.country_by_disclose || false],
      country_by_residence: [data?.country_by_residence || false],
      country_by_net_asset_value: [data?.country_by_net_asset_value || false],
      country_by_net_period_provided: [data?.country_by_net_period_provided || false],
      country_by_income: [data?.country_by_income || false],
      country_by_current_tax_charge: [data?.country_by_current_tax_charge || false],
      country_by_average_number: [data?.country_by_average_number || false],
      country_by_total_context_score: [data?.country_by_total_context_score || null],
      comments : [data?.comments || '']
    });
  }
 
 
get uniqueYearsFromFitnessInputs(): number[] {
  const yearsSet = new Set<number>();

  
  const firstSite = this.sites.at(0) as FormGroup;
  if (firstSite) {
    const fitnessInputs = firstSite.get('fitnessInputs') as FormArray;
    if (fitnessInputs) {
      fitnessInputs.controls.forEach(input => {
        const yearVal = input.get('year')?.value;
        if (yearVal instanceof Date) {
          yearsSet.add(yearVal.getFullYear());
        } else if (typeof yearVal === 'number' && !isNaN(yearVal)) {
          yearsSet.add(yearVal);
        } else if (typeof yearVal === 'string' && /^\d{4}$/.test(yearVal)) {
          yearsSet.add(parseInt(yearVal, 10));
        }
      });
    }
  }

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
    if (idx == inputIndex) return false;
    const yearVal = input.get('year')?.value;
    const year = yearVal instanceof Date ? yearVal.getFullYear() : null;
    return year == selectedYear;
  });

  if (isDuplicate) {
    inputGroup.get('year')?.setValue(null);
    inputGroup.get('year')?.setErrors({ duplicateYear: true });
    inputGroup.get('year')?.markAsTouched();
    datepicker?.close();
    return;
  }
 
  const dateForInput = new Date(selectedYear, 0, 1);
  const yearControl = inputGroup.get('year');
  yearControl?.setValue(dateForInput, { emitEvent: true });
  yearControl?.setErrors(null);
  datepicker?.close();
 
  this.parentForm.updateValueAndValidity();
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
  
  resetBE21FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          companyis_mnc: false,
          public_website: false,
          public_tax_appointed: false,
          public_tax_strategy: false,
          public_tax_marketed: false,
          public_tax_no_tax: false,
          public_tax_direct: false,
          public_tax_stated: false,
          public_tax_independent: false,
          public_tax_discloses: false,
          tax_policies_totalescore: null,

          transparency_company: false,
          transparency_evidence: false,
          transparency_address: false,
          transparency_ultimate: false,
          transparency_totalescore: null,

          taxrate_reconciliation: false,
          taxrate_current: false,
          taxrate_narrative: false,
          taxrate_deferred: false,
          taxrate_totalescore: null,

          country_by_disclose: false,
          country_by_residence: false,
          country_by_net_asset_value: false,
          country_by_net_period_provided: false,
          country_by_income: false,
          country_by_current_tax_charge: false,
          country_by_average_number: false,
          country_by_total_context_score: null
        });

        [
          'companyis_mnc',
          'public_website',
          'public_tax_appointed',
          'public_tax_strategy',
          'public_tax_marketed',
          'public_tax_no_tax',
          'public_tax_direct',
          'public_tax_stated',
          'public_tax_independent',
          'public_tax_discloses',
          'tax_policies_totalescore',

          'transparency_company',
          'transparency_evidence',
          'transparency_address',
          'transparency_ultimate',
          'transparency_totalescore',

          'taxrate_reconciliation',
          'taxrate_current',
          'taxrate_narrative',
          'taxrate_deferred',
          'taxrate_totalescore',

          'country_by_disclose',
          'country_by_residence',
          'country_by_net_asset_value',
          'country_by_net_period_provided',
          'country_by_income',
          'country_by_current_tax_charge',
          'country_by_average_number',
          'country_by_total_context_score'
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
          form: 'be21'
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

    const value =
      this.calculateContextIndicator(year);

    if (
      value === 'N/A' ||
      value === '' ||
      value == null
    ) {
      return 0;
    }

    return Number(
      value.toString().replace('%', '')
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

        min: 0,
        max: 100,
        tickAmount: 10,

        title: {
          text: 'Context Indicator'
        },

        labels: {
          formatter: function (val: number) {
            return val + '%';
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








