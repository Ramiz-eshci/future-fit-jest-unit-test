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
import { retry } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
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
  selector: 'app-be16-form',
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
    NgApexchartsModule,
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
  templateUrl: './be16-form.component.html',
  styleUrl: './be16-form.component.scss'
})
export class Be16FormComponent implements OnInit, OnChanges {


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
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  constructor(private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private dialog: MatDialog,private globalFlagService: GlobalFlagService) {
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
  get products(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);

  }
  ngOnChanges(changes: SimpleChanges) {
    //this.ngOnInit()     

  }
 
  ngDoCheck() {
    this.ngOnInit();
  }

ngOnInit() {
  this.products.controls.forEach((productGroup, productIndex) => {
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    if (fitnessInputs && fitnessInputs.length > 0) {
      fitnessInputs.controls.forEach((inputControl, inputIndex) => {
        const inputGroup = inputControl as FormGroup;
        const relevanceControl = inputGroup.get('relevance');

         
        this.applyRelevanceLogic(inputGroup, [
          'legitimacy',
          'positive_outcomes',
          'accessibility',
          'reduce_uncertainty',
          'fairness_concerns_investigated',
          'fairness_policies_consult',
          'transparency_throughout_investigation',
          'transparency_process_investigating',
          'transparency_valid_acknowledged',
          'transparency_alternatively_investigation',
          'engage_actively',
          'improve_continuously_performance',
          'improve_continuously_implement',
          'product_fitness_percentage'
        ], relevanceControl?.value);

        this.calculateSiteFitnessForInput(productIndex, inputIndex);
        const yearVal = inputGroup.get('year')?.value;
        const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
        this.calculateProgressIndicator(year);
      });
    }
  });
}

initializeSiteFitnessWatchers(): void {
  this.products.controls.forEach((productGroup, productIndex) => {
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    const checkboxFields = [
      'legitimacy',
      'positive_outcomes',
      'accessibility',
      'reduce_uncertainty',
      'fairness_concerns_investigated',
      'fairness_policies_consult',
      'transparency_throughout_investigation',
      'transparency_process_investigating',
      'transparency_valid_acknowledged',
      'transparency_alternatively_investigation',
      'engage_actively',
      'improve_continuously_performance',
      'improve_continuously_implement',
      'product_fitness_percentage'
    ];

    if (fitnessInputs && fitnessInputs.length > 0) {
      fitnessInputs.controls.forEach((inputControl, inputIndex) => {
        const inputGroup = inputControl as FormGroup;

         
        checkboxFields.forEach(field => {
          const control = inputGroup.get(field);
          if (control) {
            control.valueChanges.subscribe(() => {
              this.calculateSiteFitnessForInput(productIndex, inputIndex);
              const yearVal = inputGroup.get('year')?.value;
              const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
              this.calculateProgressIndicator(year);
            });
          }
        });

        
        const relevanceControl = inputGroup.get('relevance');
        relevanceControl?.valueChanges.subscribe(relevance => {
          this.applyRelevanceLogic(inputGroup, checkboxFields, relevance);

          this.calculateSiteFitnessForInput(productIndex, inputIndex);
          const yearVal = inputGroup.get('year')?.value;
          const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
          this.calculateProgressIndicator(year);
        });

        
        this.applyRelevanceLogic(inputGroup, checkboxFields, relevanceControl?.value);

        // Initial calculation
        this.calculateSiteFitnessForInput(productIndex, inputIndex);
        const yearVal = inputGroup.get('year')?.value;
        const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
        this.calculateProgressIndicator(year);
      });
    } else {
       
      const relevanceControl = productGroup.get('relevance');

       
      checkboxFields.forEach(field => {
        const control = productGroup.get(field);
        if (control) {
          control.valueChanges.subscribe(() => {
            this.calculateSiteFitness(productIndex);
            const yearVal = productGroup.get('year')?.value;
            const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
            this.calculateProgressIndicator(year);
          });
        }
      });

       
      relevanceControl?.valueChanges.subscribe(relevance => {
        this.applyRelevanceLogic(productGroup as FormGroup, checkboxFields, relevance);

        this.calculateSiteFitness(productIndex);
        const yearVal = productGroup.get('year')?.value;
        const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
        this.calculateProgressIndicator(year);
      });

       
      this.applyRelevanceLogic(productGroup as FormGroup, checkboxFields, relevanceControl?.value);

      // Initial calculation
      this.calculateSiteFitness(productIndex);
      const yearVal = productGroup.get('year')?.value;
      const year = yearVal instanceof Date ? yearVal.getFullYear() : yearVal;
      this.calculateProgressIndicator(year);
    }
  });
}

 
private applyRelevanceLogic(group: FormGroup, fields: string[], relevance: any) {
  if (relevance == 1) {
     
    fields.forEach(field => {
      group.get(field)?.enable({ emitEvent: false });
    });
  } else {
     
    fields.forEach(field => {
      const ctrl = group.get(field);
      ctrl?.setValue(false, { emitEvent: false });
      ctrl?.disable({ emitEvent: false });
    });
  }
}






 

 
  calculateSiteFitnessForInput(productIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    if (!fitnessInputs) return;
    const siteGroup = fitnessInputs.at(inputIndex);

    const relevance = siteGroup.get('relevance')?.value;
    const scoringTable = [0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];
    if (relevance != 1) {
      siteGroup.get('product_fitness_percentage')?.setValue('', { emitEvent: false });
      return;
    }

    const H = siteGroup.get('legitimacy')?.value === true || siteGroup.get('legitimacy')?.value === 1;
    const I = siteGroup.get('positive_outcomes')?.value === true || siteGroup.get('positive_outcomes')?.value === 1;
    const X = (H && I) ? 1 : 0;

    const J = siteGroup.get('accessibility')?.value === true || siteGroup.get('accessibility')?.value === 1;
    const K = siteGroup.get('reduce_uncertainty')?.value === true || siteGroup.get('reduce_uncertainty')?.value === 1;
    const L = siteGroup.get('fairness_concerns_investigated')?.value === true || siteGroup.get('fairness_concerns_investigated')?.value === 1;
    const M = siteGroup.get('fairness_policies_consult')?.value === true || siteGroup.get('fairness_policies_consult')?.value === 1;
    const N = siteGroup.get('transparency_throughout_investigation')?.value === true || siteGroup.get('transparency_throughout_investigation')?.value === 1;
    const O = siteGroup.get('transparency_process_investigating')?.value === true || siteGroup.get('transparency_process_investigating')?.value === 1;
    const P = siteGroup.get('transparency_valid_acknowledged')?.value === true || siteGroup.get('transparency_valid_acknowledged')?.value === 1;
    const Q = siteGroup.get('transparency_alternatively_investigation')?.value === true || siteGroup.get('transparency_alternatively_investigation')?.value === 1;
    const R = siteGroup.get('engage_actively')?.value === true || siteGroup.get('engage_actively')?.value === 1;
    const S = siteGroup.get('improve_continuously_performance')?.value === true || siteGroup.get('improve_continuously_performance')?.value === 1;
    const T = siteGroup.get('improve_continuously_implement')?.value === true || siteGroup.get('improve_continuously_implement')?.value === 1;

    const Y =
      (J ? 1 : 0) +
      (K ? 1 : 0) +
      ((L && M) ? 1 : 0) +
      ((N && O && P && Q) ? 1 : 0) +
      (R ? 1 : 0) +
      ((S && T) ? 1 : 0);

    const Z = Y != null && Y >= 0 ? scoringTable[Math.min(Y, scoringTable.length - 1)] : 0;
    const AA = (typeof Z === 'number' && !isNaN(Z)) ? X * Z : 0;
    const result = Math.round(AA * 100) + '%';

    siteGroup.get('product_fitness_percentage')?.setValue(result, { emitEvent: false });
  }


  calculateSiteFitness(index: number) {
    const siteGroup = this.products.at(index);
    const relevance = siteGroup.get('relevance')?.value;
    const scoringTable = [0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];
    if (relevance != 1) {
      siteGroup.get('product_fitness_percentage')?.setValue('', { emitEvent: false });
      return;
    }
    const H = siteGroup.get('legitimacy')?.value === true;
    const I = siteGroup.get('positive_outcomes')?.value === true;
    const X = (H && I) ? 1 : 0;
    const J = siteGroup.get('accessibility')?.value === true;
    const K = siteGroup.get('reduce_uncertainty')?.value === true;
    const L = siteGroup.get('fairness_concerns_investigated')?.value === true;
    const M = siteGroup.get('fairness_policies_consult')?.value === true;
    const N = siteGroup.get('transparency_throughout_investigation')?.value === true;
    const O = siteGroup.get('transparency_process_investigating')?.value === true;
    const P = siteGroup.get('transparency_valid_acknowledged')?.value === true;
    const Q = siteGroup.get('transparency_alternatively_investigation')?.value === true;
    const R = siteGroup.get('engage_actively')?.value === true;
    const S = siteGroup.get('improve_continuously_performance')?.value === true;
    const T = siteGroup.get('improve_continuously_implement')?.value === true;

    const Y =
      (J ? 1 : 0) +
      (K ? 1 : 0) +
      ((L && M) ? 1 : 0) +
      ((N && O && P && Q) ? 1 : 0) +
      (R ? 1 : 0) +
      ((S && T) ? 1 : 0);
    const Z = Y !== null && Y >= 0 ? scoringTable[Math.min(Y, scoringTable.length - 1)] : 0;
    const AA = (typeof Z === 'number' && !isNaN(Z)) ? X * Z : 0;
    const result = Math.round(AA * 100) + '%';
    siteGroup.get('product_fitness_percentage')?.setValue(result, { emitEvent: false });
    this.calculateBE16DataCompleteness()
  }

  calculateBE16DataCompleteness(): string {
    const relevanceValues = this.products.controls.map(ctrl => ctrl.get('relevance')?.value);

    const includedCount = relevanceValues.filter(val => val == 1).length;
    const insufficientCount = relevanceValues.filter(val => val == 3).length;
    const otherCount = relevanceValues.filter(val => val == 4).length;

    if (includedCount == 0) {
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
  let totalIncludedRevenue = 0;
  let weightedFitnessSum = 0;

  this.products.controls.forEach(productGroup => {
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;

    if (fitnessInputs && fitnessInputs.length > 0) {
      fitnessInputs.controls.forEach(inputControl => {
        const inputGroup = inputControl as FormGroup;

        const rawRevenue = inputGroup.get('revenue')?.value || '0';
        const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;

        const inputYear = inputGroup.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
        const isYearMatched = !year || inputYearVal == year;
        if (!isYearMatched) return;

        const relevance = inputGroup.get('relevance')?.value;
        let fitness = inputGroup.get('product_fitness_percentage')?.value;

        if (relevance == 1) {
          if (typeof fitness === 'string' && fitness.includes('%')) {
            fitness = parseFloat(fitness.replace('%', '')) / 100;
          } else {
            fitness = +fitness / 100;
          }

          if (!isNaN(revenue) && !isNaN(fitness)) {
            weightedFitnessSum += revenue * fitness;
            totalIncludedRevenue += revenue;
          }
        }
      });
    }
  });

  if (totalIncludedRevenue === 0) {
    return '0%';
  }

  const average = weightedFitnessSum / totalIncludedRevenue;
  return Math.round(average * 100) + '%';
  }
   private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value;  
  return num.toLocaleString('en-US');  
}

private formatCalculatedRevenueFields(inputGroup: FormGroup): void {
  const fieldNames = ['revenue'];  
  fieldNames.forEach(name => {
    const control = inputGroup.get(name);
    if (control) {
      const formattedValue = this.formatNumberForDisplay(control.value);
      control.setValue(formattedValue, { emitEvent: false });
    }
  });
}




  

  calculateContextIndicator(year: number | null): string | number {
    let totalRevenue = 0;

    this.products.controls.forEach(productGroup => {
      const product = productGroup.get('fitnessInputs') as FormArray;
      if (!product) return;

      product.controls.forEach(inputGroup => {
        const inputYear = inputGroup.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : null;
        const isYearMatched = year == null || inputYearVal === year;
        if (!isYearMatched) return;

        const relevance = inputGroup.get('relevance')?.value; 
    const rawRevenue = inputGroup.get('revenue')?.value || '0';
const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;

        if (relevance == 1) {
          totalRevenue += revenue;
        }
      });
    });
 
     return totalRevenue == 0 ? '' : new Intl.NumberFormat('en-US').format(totalRevenue);
  }



   
  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    const productArray = this.parentForm.get(this.arrayName) as FormArray;
    productArray.controls.forEach(productGroup => {
      productGroup.markAllAsTouched();
    });
this.loading = true; 
    const validProducts = productArray.controls
      .map(productGroup => {
        const fitnessInputs = (productGroup.get('fitnessInputs') as FormArray).controls
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
                revenue: this.parseNumber(val.revenue),
            };
          });

        return {
          ...productGroup.value,
          fitnessInputs
        };
      })
      .filter(product => product.fitnessInputs.length > 0);
 
    if (validProducts.length === 0) return;
 
    const years = Array.from(new Set(
      validProducts.flatMap(product => product.fitnessInputs.map((fi: any) => fi.year))
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
      products: validProducts,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    console.log('BE16 Form Submitted:', formData);

    this.commonService.addData('be-form/submit/be16', formData).subscribe(
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
        this.loading = false;
      },
      error => {
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
  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }
  resetBE16FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          legitimacy: false,
          positive_outcomes: false,
          accessibility: false,
          reduce_uncertainty: false,
          fairness_concerns_investigated: false,
          fairness_policies_consult: false,
          transparency_throughout_investigation: false,
          transparency_process_investigating: false,
          transparency_valid_acknowledged: false,
          transparency_alternatively_investigation: false,
          engage_actively: false,
          improve_continuously_performance: false,
          improve_continuously_implement: false,
          product_fitness_percentage: null,
          comments: ''
        });

        [
          'relevance',
          'legitimacy',
          'positive_outcomes',
          'accessibility',
          'reduce_uncertainty',
          'fairness_concerns_investigated',
          'fairness_policies_consult',
          'transparency_throughout_investigation',
          'transparency_process_investigating',
          'transparency_valid_acknowledged',
          'transparency_alternatively_investigation',
          'engage_actively',
          'improve_continuously_performance',
          'improve_continuously_implement',
          'product_fitness_percentage',
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
  isAtLeastOneProductValid(): boolean {
    const productArray = this.parentForm.get(this.arrayName) as FormArray;
    return productArray.controls.some(productGroup => !!productGroup.get('relevance')?.value);
  }
  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }

  getFitnessInputs(product: AbstractControl): FormArray {
    return product.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(productIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const inputs = productGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.initializeSiteFitnessWatchers();
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      revenue : [data?.revenue || null],
      relevance: [data?.relevance_id || '', Validators.required],
      legitimacy: [data?.legitimacy || false],
      positive_outcomes: [data?.positive_outcomes || false],
      accessibility: [data?.accessibility || false],
      reduce_uncertainty: [data?.reduce_uncertainty || false],
      fairness_concerns_investigated: [data?.fairness_concerns_investigated || false],
      fairness_policies_consult: [data?.fairness_policies_consult || false],      
      transparency_throughout_investigation: [data?.transparency_throughout_investigation || false], 
      transparency_process_investigating: [data?.transparency_process_investigating || false],
      transparency_valid_acknowledged: [data?.transparency_valid_acknowledged || false],
      transparency_alternatively_investigation: [data?.transparency_alternatively_investigation || false],
      engage_actively: [data?.engage_actively || false],
      improve_continuously_performance: [data?.improve_continuously_performance || false],
      improve_continuously_implement: [data?.improve_continuously_implement || false], 
      product_fitness_percentage: [data?.product_fitness_percentage || 0],

      // revenue: [],
      comments: [data?.comments || ''],
    });
  }
 public isValidYearShow(value: any): boolean {
  return value instanceof Date && !isNaN((value as Date).getTime());
}
   
  removeFitnessInput(productIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const inputs = productGroup.get('fitnessInputs') as FormArray;
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
          form: 'be16'
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
  get uniqueYearsFromFitnessInputs(): number[] {
    const yearsSet = new Set<number>();

    this.products.controls.forEach(product => {
      const fitnessInputs = product.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

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

  const productGroup = this.products.at(productIndex) as FormGroup;
  const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
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
 
  const productYearMap = productGroup.get('productYearMap')?.value || {};
  const matchedRevenue = productYearMap[selectedYear] ?? null;
 
  if (matchedRevenue) {
    inputGroup.get('revenue')?.setValue(matchedRevenue);
      this.formatCalculatedRevenueFields(inputGroup);
  } else {
    inputGroup.get('revenue')?.reset();
  }
 
  datepicker.close();
 
 this.calculateSiteFitnessForInput(productIndex, inputIndex);
  this.calculateProgressIndicator(selectedYear);
}
 

  onYearTyped(event: Event, productIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length == 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, productIndex, inputIndex);
    }
  }
   
    calculateDataCompleteness(year: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];
   
    this.products.controls.forEach(productGroup => {
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;
  
      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal = inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);
  
        if (inputYearVal == selectedYear) {
          const relevanceVal = input.get('relevance')?.value;
          if (relevanceVal !== null && relevanceVal !== undefined && !isNaN(relevanceVal)) {
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

    const value =
      this.calculateContextIndicator(year);

    return Number(
      value.toString().replace(/,/g, '')
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
