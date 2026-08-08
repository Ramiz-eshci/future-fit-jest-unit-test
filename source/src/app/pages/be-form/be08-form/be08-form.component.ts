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
  selector: 'app-be08-form',
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
     NgApexchartsModule,
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
  templateUrl: './be08-form.component.html',
  styleUrl: './be08-form.component.scss'
})
export class Be08FormComponent implements OnInit, OnChanges {

  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Output() calculate = new EventEmitter<void>();
  @Input() goal!: any;
  loading: boolean = false;
  relevantsArr: any = [];
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();
    @ViewChild('progressGraphDialog')
      progressGraphDialog!: TemplateRef<any>;
      progressChartOptions: any = null;
      public chartOptions: any = null;
      contextUnit: string = '';
  showIndicators: boolean = false;
  routeId: any = '';
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;



  constructor(private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router,private dialog: MatDialog,private globalFlagService: GlobalFlagService) {

    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fitEntryId']?.currentValue) {
      // console.log('ngOnChanges fitEntryId:', this.fitEntryId); // Should be defined here
    }
  }
  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }
  ngOnInit(): void {
    this.initializeSiteFitnessWatchers();
  }
  ngDoCheck() {
    this.ngOnInit();
  }
 
  private subscribedControls = new WeakSet<AbstractControl>();
 
  initializeSiteFitnessWatchers(): void {
    this.sites.controls.forEach((siteControl, siteIndex) => {
      const siteGroup = siteControl as FormGroup;
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach((inputControl, inputIndex) => {
        const inputGroup = inputControl as FormGroup;

        const checkboxFields = [
          'localImpactIdentified',
          'valueAreaIdentified',
          'valueAreaProtected',
          'noImpactOnPristineEcosystems',
          'landRightsUncontested',
          'communityConsentObtained',
          'pastDamageNeutralized'
        ];

        // Watch all checkbox fields
        checkboxFields.forEach(field => {
          const control = inputGroup.get(field);
          if (control && !this.subscribedControls.has(control)) {
            this.subscribedControls.add(control);
            control.valueChanges.subscribe(() => {
              const year = inputGroup.get('year')?.value || null;
              this.calculateSiteFitness(siteIndex, inputIndex);
              this.calculateProgressIndicator(year);
            });
          }
        });

        // Watch relevance field
        const relevanceControl = inputGroup.get('relevance');
        if (relevanceControl && !this.subscribedControls.has(relevanceControl)) {
          this.subscribedControls.add(relevanceControl);
          relevanceControl.valueChanges.subscribe(relevance => {
            checkboxFields.forEach(field => {
              const ctrl = inputGroup.get(field);
              if (ctrl) {
                ctrl.setValue(false, { emitEvent: false });
                ctrl[relevance == 1 ? 'enable' : 'disable']({ emitEvent: false });
              }
            });

            const year = inputGroup.get('year')?.value || null;
            this.calculateSiteFitness(siteIndex, inputIndex);
            this.calculateProgressIndicator(year);
          });
        }

        // Initial checkbox enable/disable
        const currentRelevance = relevanceControl?.value;
        checkboxFields.forEach(field => {
          const ctrl = inputGroup.get(field);
          if (ctrl) {
            currentRelevance == 1
              ? ctrl.enable({ emitEvent: false })
              : ctrl.disable({ emitEvent: false });
          }
        });

        // Initial calculation
        const year = inputGroup.get('year')?.value || null;
        this.calculateSiteFitness(siteIndex, inputIndex);
        this.calculateProgressIndicator(year);
      });
    }); 
  }




  isAtLeastOneSiteValid(): boolean {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    return siteArray.controls.some(siteGroup => siteGroup.valid);
  }

  
  calculateProgressIndicator(year: number): string {
    let numerator = 0;
    let denominator = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const relevance = input.get('relevance')?.value;
 
        const inputYearRaw = input.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : +inputYearRaw || 0;

        if (relevance == 1 && inputYear === year) { 
          const siteAreaRaw = (input.get('siteArea')?.value || '0').toString().replace(/,/g, '');
          const siteArea = parseFloat(siteAreaRaw) || 0;

          const rawFitness = input.get('siteFitness')?.value ?? '0';
          const fitnessPercent = parseFloat(
            (typeof rawFitness === 'string' ? rawFitness : rawFitness + '%').replace('%', '')
          ) || 0;

          numerator += siteArea * fitnessPercent;
          denominator += siteArea;
        }
      });
    });

    if (denominator === 0) return '';
    return Math.round(numerator / denominator) + '%';
  }

   

   

  calculateContextIndicator(year: number | null): string {
    let totalArea = 0;

    this.sites.controls.forEach(site => {
      const fitnessInputs = site.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || fitnessInputs.length === 0) return;

      fitnessInputs.controls.forEach(input => {
        const relevance = +input.get('relevance')?.value || 0;
        const siteArea = this.parseNumber(input.get('siteArea')?.value);
 
        const yearRaw = input.get('year')?.value;
        const inputYear = yearRaw instanceof Date
          ? yearRaw.getFullYear()
          : (isNaN(+yearRaw) ? null : +yearRaw);

        if (relevance === 1 && inputYear !== null && (year === null || inputYear === year)) {
          totalArea += siteArea;
        }
      });
    });

    return new Intl.NumberFormat('en-US').format(totalArea);
  }


  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }
  getYearValue(siteIndex: number, inputIndex: number): number | null {
    const inputGroup = (this.sites.at(siteIndex).get('fitnessInputs') as FormArray).at(inputIndex) as FormGroup;
    const yearRaw = inputGroup.get('year')?.value;
    return yearRaw instanceof Date ? yearRaw.getFullYear() : (isNaN(+yearRaw) ? null : +yearRaw);
  }
 
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
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
  private formatNumberWithCommas(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
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

   
  calculateSiteFitness(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;
    const fitnessControl = inputGroup.get('siteFitness');
 
    const inputYearRaw = inputGroup.get('year')?.value;
    const inputYear = inputYearRaw instanceof Date
      ? inputYearRaw.getFullYear()
      : +inputYearRaw || 0;
 
    if (relevance != 1) {
      fitnessControl?.setValue('', { emitEvent: false });
      return;
    }

    const allYes = [
      'localImpactIdentified',
      'valueAreaIdentified',
      'valueAreaProtected',
      'noImpactOnPristineEcosystems',
      'landRightsUncontested',
      'communityConsentObtained',
      'pastDamageNeutralized'
    ].every(field => this.isTruthy(inputGroup.get(field)?.value));

    const fitness = allYes ? '100%' : '0%';
    fitnessControl?.setValue(fitness, { emitEvent: false });
 
    this.calculateDataCompleteness(inputYear);
  }

  

  isTruthy(value: any): boolean {
    return value === true || value === 'true' || value === '1' || value === 1 || value === 'Yes';
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
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
 
    siteArray.controls.forEach(siteGroup => {
      siteGroup.markAllAsTouched();
    });
this.loading = true; 
    const validSites = siteArray.controls
      .map(siteGroup => {
        const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;

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
              year: (val.year instanceof Date) ? val.year.getFullYear() : val.year
            };
          });

        return {
          ...siteGroup.value,
          fitnessInputs: validFitnessInputs
        };
      })
      .filter(site => site.fitnessInputs.length > 0);

    const atLeastOneValid = validSites.length > 0;
    if (!atLeastOneValid) {
      return;  
    }
 
    const years = Array.from(
      new Set(validSites.flatMap(site => site.fitnessInputs.map((fi: any) => fi.year)))
    );

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
 

    this.commonService.addData('be-form/submit/be08', formData).subscribe(
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


  calculateBE08DataCompleteness(): string {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    const relevanceIds: number[] = siteArray.controls
      .map(site => site.get('relevance')?.value)
      .filter(id => id != null);  

    const included = relevanceIds.filter(id => id === 1).length;
    const excludedInsufficient = relevanceIds.filter(id => id === 3).length;
    const excludedOther = relevanceIds.filter(id => id === 4).length;

    if (included === 0) {
      return '';
    } else if (excludedInsufficient > 0) {
      return 'Calculation based on incomplete data';
    } else if (excludedOther > 0) {
      return 'Calculation may be based on incomplete data';
    } else {
      return 'Calculation based on complete data';
    }
  }
  resetBE08FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: null,
          siteArea: null,
          localImpactIdentified: false,
          valueAreaIdentified: false,
          valueAreaProtected: false,
          noImpactOnPristineEcosystems: false,
          landRightsUncontested: false,
          communityConsentObtained: false,
          pastDamageNeutralized: false,
          siteFitness: null,
          comments: ''
        });

        [
          'relevance', 'siteArea', 'localImpactIdentified', 'valueAreaIdentified', 'valueAreaProtected',
          'noImpactOnPristineEcosystems', 'landRightsUncontested', 'communityConsentObtained',
          'pastDamageNeutralized', 'siteFitness', 'comments'
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
      relevance: [data?.relevance_id || '', Validators.required],
      siteArea: [data?.site_area || null],
      localImpactIdentified: [data?.local_impact_identified || false],
      valueAreaIdentified: [data?.value_area_identified || false],
      valueAreaProtected: [data?.value_area_protected || false],
      noImpactOnPristineEcosystems: [data?.no_impact_on_pristine_ecosystems || false],
      landRightsUncontested: [data?.land_rights_uncontested || false],
      communityConsentObtained: [data?.community_consent_obtained || false],
      pastDamageNeutralized: [data?.past_damage_neutralized || false],
      siteFitness: [data?.site_fitness_percent || null],
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
          form: 'be08'
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
