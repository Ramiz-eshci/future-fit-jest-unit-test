import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, input, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
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
  selector: 'app-be15-form',
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
  templateUrl: './be15-form.component.html',
  styleUrl: './be15-form.component.scss'
})
export class Be15FormComponent implements OnInit, OnChanges {

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
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  routeId: any = '';
  commonOptions = [
    { id: 1, name: 'Yes' },
    { id: 0, name: 'No' },
    { id: 2, name: 'Not applicable' }
  ];




  constructor(private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
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

  get products(): FormArray {

    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);

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
      console.log('ngOnChanges fitEntryId:', this.fitEntryId);
      this.initializeSiteFitnessWatchers();
    }
  }
  ngOnInit() {

    this.initializeSiteFitnessWatchers();

  }
  ngDoCheck() {
    this.ngOnInit();
  }


  private fitnessWatchersSubscriptions: any[] = [];



  initializeSiteFitnessWatchers(): void {
    if (this.fitnessWatchersSubscriptions?.length) {
      this.fitnessWatchersSubscriptions.forEach(sub => sub.unsubscribe?.());
      this.fitnessWatchersSubscriptions = [];
    }

    (this.products as FormArray).controls.forEach((productGroup, productIndex) => {
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach((inputControl, inputIndex) => {
        const inputGroup = inputControl as FormGroup;

        const dropdownFields = [
          'user_groups_communicationplans',
          'communications_are_considered',
          'communications_crucial_information',
          'communications_product_information',
          'purchase_information_needed',
          'purchase_physical_goods',
          'purchase_nature_andquantities',
          'purchase_characteristics_ofproducts',
          'purchase_ambiguous_term',
          'purchase_comparative',
          'purchase_user_groups',
          'use_users_provided',
          'use_nutrition_information',
          'use_with_guidance',
          'use_guidance_provided',
          'post_physical_good',
          'post_improper_disposal',
          'product_fitness_percentage'
        ];

        const getYear = () => {
          const raw = inputGroup.get('year')?.value;
          return raw instanceof Date ? raw.getFullYear() : +raw || 0;
        };


        const applyRelevanceLogic = (relevance: any) => {
          if (relevance == 1) {

            dropdownFields.forEach(field => {
              inputGroup.get(field)?.enable({ emitEvent: false });
            });
          } else {

            dropdownFields.forEach(field => {
              const ctrl = inputGroup.get(field);
              ctrl?.setValue(null, { emitEvent: false });
              ctrl?.disable({ emitEvent: false });
            });
          }
        };

        dropdownFields.forEach(field => {
          const control = inputGroup.get(field);
          if (control) {
            const sub = control.valueChanges.subscribe(() => {
              const year = getYear();
              this.calculateProductFitness(productIndex, inputIndex);
              this.calculateProgressIndicator(year);
            });
            this.fitnessWatchersSubscriptions.push(sub);
          }
        });

        const relevanceControl = inputGroup.get('relevance');
        if (relevanceControl) {
          const sub = relevanceControl.valueChanges.subscribe(relevance => {
            applyRelevanceLogic(relevance);

            const year = getYear();
            this.calculateProductFitness(productIndex, inputIndex);
            this.calculateProgressIndicator(year);
          });
          this.fitnessWatchersSubscriptions.push(sub);

          applyRelevanceLogic(relevanceControl.value);
        }


        const year = getYear();
        this.calculateProductFitness(productIndex, inputIndex);
        this.calculateProgressIndicator(year);
      });
    });
  }


  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id == id);
    return match ? match.name : 'Not set';
  }



  calculateProductFitness(productIndex: number, inputIndex: number): void {
    const siteGroup = this.products.at(productIndex);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    if (!fitnessInputs) return;
    const productGroup = fitnessInputs.at(inputIndex);

    const relevance = productGroup.get('relevance')?.value;
    if (relevance != 1 && relevance != '1') {
      productGroup.get('product_fitness_percentage')?.setValue('', { emitEvent: false });
      return;
    }

    let fitness = 0;

    const isTruthy = (val: any): boolean =>
      val == 'yes' || val == true || val == 1 || val == '1';

    const isNA = (val: any): boolean =>
      val == 2 || val == '2';

    // ---- Groups ----
    const group1Fields = [
      'user_groups_communicationplans',
      'communications_are_considered',
      'communications_crucial_information',
      'communications_product_information'
    ];
    const group1Pass = group1Fields.every(field => isTruthy(productGroup.get(field)?.value));
    if (group1Pass) fitness += 0.25;

    const group2Fields = [
      'purchase_information_needed',
      'purchase_physical_goods',
      'purchase_nature_andquantities',
      'purchase_characteristics_ofproducts',
      'purchase_ambiguous_term',
      'purchase_comparative',
      'purchase_user_groups'
    ];
    const group2Pass = group1Pass && group2Fields.every(field => {
      const val = productGroup.get(field)?.value;
      return isTruthy(val) || isNA(val);
    });
    if (group2Pass) fitness += 0.25;

    const group3Fields = [
      'use_users_provided',
      'use_nutrition_information',
      'use_with_guidance',
      'use_guidance_provided'
    ];
    const group3Pass = group1Pass && group3Fields.every(field => {
      const val = productGroup.get(field)?.value;
      return isTruthy(val) || isNA(val);
    });
    if (group3Pass) fitness += 0.25;

    const group4Fields = [
      'post_physical_good',
      'post_improper_disposal'
    ];
    const group4Pass = group1Pass && group4Fields.every(field => {
      const val = productGroup.get(field)?.value;
      return isTruthy(val) || isNA(val);
    });
    if (group4Pass) fitness += 0.25;

    const percentage = Math.round(fitness * 100) + '%';
    productGroup.get('product_fitness_percentage')?.setValue(percentage, { emitEvent: false });

    this.calculateBE15DataCompleteness();

  }




  calculateBE15DataCompleteness(): string {
    const relevanceValues = this.products.controls.map(ctrl => ctrl.get('relevance')?.value);

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



  calculateProgressIndicator(year: number): string {
    let totalIncludedRevenue = 0;
    let weightedFitnessSum = 0;

    this.products.controls.forEach(productGroup => {
      const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || fitnessInputs.length == 0) return;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;
        const rawRevenue = inputGroup.get('revenue')?.value || '0';
        const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;

        const inputYearRaw = inputGroup.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : Number(inputYearRaw) || 0;

        let fitness = inputGroup.get('product_fitness_percentage')?.value;

        if (
          relevance == 1 &&
          revenue > 0 &&
          inputYear === year &&
          fitness !== null &&
          fitness !== ''
        ) {
          if (typeof fitness === 'string' && fitness.includes('%')) {
            fitness = parseFloat(fitness.replace('%', '')) / 100;
          } else {
            fitness = +fitness / 100;
          }

          weightedFitnessSum += revenue * fitness;
          totalIncludedRevenue += revenue;
        }
      });
    });

    if (totalIncludedRevenue == 0) {
      return '';
    }

    const average = weightedFitnessSum / totalIncludedRevenue;
    return Math.round(average * 100) + '%';
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

    this.commonService.addData('be-form/submit/be15', formData).subscribe(
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
  isAtLeastOneProductValid(): boolean {
    const productArray = this.parentForm.get(this.arrayName) as FormArray;
    return productArray.controls.some(productGroup => !!productGroup.get('relevance')?.value);
  }


  resetBE15FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          user_groups_communicationplans: false,
          communications_are_considered: false,
          communications_crucial_information: false,
          communications_product_information: false,
          purchase_information_needed: false,
          purchase_physical_goods: false,
          purchase_nature_andquantities: false,
          purchase_characteristics_ofproducts: false,
          purchase_ambiguous_term: false,
          purchase_comparative: false,
          purchase_user_groups: false,
          use_users_provided: false,
          use_nutrition_information: false,
          use_with_guidance: false,
          use_guidance_provided: false,
          post_physical_good: false,
          post_improper_disposal: false,
          product_fitness_percentage: null,
          comments: ''
        });

        [
          'relevance',
          'user_groups_communicationplans',
          'communications_are_considered',
          'communications_crucial_information',
          'communications_product_information',
          'purchase_information_needed',
          'purchase_physical_goods',
          'purchase_nature_andquantities',
          'purchase_characteristics_ofproducts',
          'purchase_ambiguous_term',
          'purchase_comparative',
          'purchase_user_groups',
          'use_users_provided',
          'use_nutrition_information',
          'use_with_guidance',
          'use_guidance_provided',
          'post_physical_good',
          'post_improper_disposal',
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


  getFitnessInputs(product: AbstractControl): FormArray {
    return product.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(productIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const inputs = productGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.initializeSiteFitnessWatchers();
  }
  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
  }
  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      revenue: [data?.revenue || null],
      relevance: [data?.relevance_id || '', Validators.required],
      user_groups_communicationplans: [data?.user_groups_communicationplans || false],
      communications_are_considered: [data?.communications_are_considered || false],
      communications_crucial_information: [data?.communications_crucial_information || false],
      communications_product_information: [data?.communications_product_information || false],
      purchase_information_needed: [data?.purchase_information_needed || false],

      purchase_physical_goods: [data?.purchase_physical_goods ?? null],
      purchase_nature_andquantities: [data?.purchase_nature_andquantities ?? null],
      purchase_characteristics_ofproducts: [data?.purchase_characteristics_ofproducts ?? null],
      purchase_ambiguous_term: [data?.purchase_ambiguous_term ?? null],
      purchase_comparative: [data?.purchase_comparative ?? null],
      purchase_user_groups: [data?.purchase_user_groups ?? null],
      use_users_provided: [data?.use_users_provided ?? null],
      use_nutrition_information: [data?.use_nutrition_information ?? null],
      use_with_guidance: [data?.use_with_guidance ?? null],
      use_guidance_provided: [data?.use_guidance_provided ?? null],
      post_physical_good: [data?.post_physical_good ?? null],
      post_improper_disposal: [data?.post_improper_disposal ?? null],
      product_fitness_percentage: [data?.product_fitness_percentage || 0],
      // revenue: [], 
      comments: [data?.comments || ''],
    });
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
          form: 'be15'
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
      fitnessInputs.controls.forEach(input => {
        const yearVal = input.get('year')?.value;
        const relevanceVal = input.get('relevance')?.value;
        let year: number | null = null;

        if (yearVal instanceof Date) {
          year = yearVal.getFullYear();
        } else if (typeof yearVal == 'number') {
          year = yearVal;
        } else if (typeof yearVal == 'string' && yearVal.length == 4) {
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


    this.calculateProductFitness(productIndex, inputIndex);
    this.calculateProgressIndicator(selectedYear);
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
    if (value == null || value == undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
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
