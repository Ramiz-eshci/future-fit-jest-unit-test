
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';

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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
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
  selector: 'app-be19-form',
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
  templateUrl: './be19-form.component.html',
  styleUrl: './be19-form.component.scss'
})
export class Be19FormComponent implements OnInit, OnChanges {

  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Input() goal!: any;
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;
  loading: boolean = false;
  relevantsArr: any = [];
  showIndicators: boolean = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  routeId: any = '';
  contextUnit: string = '';


  get products(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);

  }
  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }
  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentForm']) {
      this.disableServiceProducts();
    }
  }



  constructor(private fb: FormBuilder, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
  }
  private disableServiceProducts() {
    if (!this.products) return;

    this.products.controls.forEach((group: AbstractControl) => {
      const productGroup = group as FormGroup;
      const productType = productGroup.get('productType')?.value;

      if (productType?.toLowerCase() == 'services') {
        productGroup.disable({ emitEvent: false });
      }
    });
  }
  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '700px',
      data: { criteria, notes }
    });
  }
  ngAfterViewInit(): void {
    this.products.controls.forEach((productGroup, productIndex) => {
      const fitnessInputs = (productGroup.get('fitnessInputs') as FormArray);
      fitnessInputs.controls.forEach((_, inputIndex) => {
        this.onNumberOfDistinctChange(productIndex, inputIndex);
      });
    });
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

    const soldGoodsProgress = years.map(year => {
      const value = this.calculateProgressIndicator(0, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const supplementaryProgress = years.map(year => {
      const value = this.calculateProgressIndicator(1, year);
      return value ? Number(value.replace('%', '')) : 0;
    });

    const soldGoodsRevenue = years.map(year =>
      Number(
        String(this.calculateContextIndicator(0, year))
          .replace(/,/g, '')
      )
    );

    const supplementaryRevenue = years.map(year =>
      Number(
        String(this.calculateContextIndicator(1, year))
          .replace(/,/g, '')
      )
    );

    this.chartOptions = {

      series: [

        {
          name: 'Sold or leased goods',
          type: 'column',
          data: soldGoodsRevenue,
          color: '#2E7D32'
        },

        {
          name: 'Supplementary goods',
          type: 'column',
          data: supplementaryRevenue,
          color: '#29B6F6'
        },

        {
          name: 'Sold or leased goods Fitness',
          type: 'line',
          data: soldGoodsProgress,
          color: '#1565C0'
        },

        {
          name: 'Supplementary goods Fitness',
          type: 'line',
          data: supplementaryProgress,
          color: '#EF6C00'
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
        width: [0, 0, 3, 3],
        curve: 'straight'
      },

      plotOptions: {
        bar: {
          columnWidth: '35%'
        }
      },

      markers: {
        size: [0, 0, 4, 4]
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: [

        {
          seriesName: [
            'Sold or leased goods Fitness',
            'Supplementary goods Fitness'
          ],
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
            'Sold or leased goods Fitness',
            'Supplementary goods Fitness'
          ],
          opposite: true,

          title: {
            text: 'Revenue'
          },

          labels: {
            formatter: (value: number) =>
              Number(value).toLocaleString()
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {

          formatter: (value: number, opts: any) => {

            // if (opts.seriesIndex >= 2) {
            //   return value + '%';
            // }
            if (opts.seriesIndex === 0 || opts.seriesIndex === 1) {
              return Number(value).toLocaleString();
            }

            return Number(value).toLocaleString();

          }

        }

      },

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  calculateSiteFitness(productIndex: number, inputIndex: number): void {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    if (!fitnessInputs) return;

    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;
    const numberOfDistinct = +inputGroup.get('numberof_distinct')?.value || 0;
    console.log(numberOfDistinct, 'numberOfDistinct');

    const numberOfDistinctCtrl = inputGroup.get('numberof_distinct');

    if (relevance != 1) {

      inputGroup.get('product_fitness_percentage')?.setValue('', { emitEvent: false });


      if (numberOfDistinctCtrl) {
        numberOfDistinctCtrl.setValue('', { emitEvent: false });
        numberOfDistinctCtrl.disable({ emitEvent: false });
      }


      for (let i = 1; i <= 10; i++) {
        const repurposingControl = inputGroup.get(`fitness${i}_repurposing`);
        const soldControl = inputGroup.get(`fitness${i}_sold`);

        if (repurposingControl) {
          repurposingControl.setValue('', { emitEvent: false });
          repurposingControl.disable({ emitEvent: false });
        }
        if (soldControl) {
          soldControl.setValue('', { emitEvent: false });
          soldControl.disable({ emitEvent: false });
        }
      }

      return;
    }


    if (numberOfDistinctCtrl && numberOfDistinctCtrl.disabled) {
      numberOfDistinctCtrl.enable({ emitEvent: false });
    }

    let numerator = 0;
    let denominator = 0;

    for (let i = 1; i <= 10; i++) {
      if (numberOfDistinct >= i) {
        const repurposingRaw = inputGroup.get(`fitness${i}_repurposing`)?.value || '0';
        const repurposingPercent = parseFloat(repurposingRaw.toString().replace('%', '')) / 100;

        // const unitsSold = +inputGroup.get(`fitness${i}_sold`)?.value || 0;
        const rawUnitsSold = inputGroup.get(`fitness${i}_sold`)?.value || '0';
        const unitsSold = parseFloat(rawUnitsSold.toString().replace(/,/g, '')) || 0;

        numerator += repurposingPercent * unitsSold;
        denominator += unitsSold;
      }
    }

    const fitness =
      denominator === 0 ? '' : Math.round((numerator / denominator) * 100) + '%';

    inputGroup.get('product_fitness_percentage')?.setValue(fitness, { emitEvent: false });
  }




  calculateProgressIndicator(index: number, year: number): string {
    const sites = this.products.controls;
    let filteredInputs: any[] = [];

    sites.forEach(site => {
      const productType = site.get('productType')?.value;
      const relevance = site.get('relevance')?.value;
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputControl => {
        const input = inputControl as FormGroup;
        const inputRelevance = input.get('relevance')?.value ?? relevance;

        // Extract & normalize year
        const inputYearRaw = input.get('year')?.value;
        const inputYear =
          inputYearRaw instanceof Date
            ? inputYearRaw.getFullYear()
            : Number(inputYearRaw) || 0;

        if (
          inputRelevance == 1 &&
          inputYear == year &&
          ((index == 0 && productType == 'Sold or leased goods') ||
            (index == 1 && productType == 'Supplementary goods'))
        ) {
          //  Safely parse revenue with commas removed
          const rawRevenue = input.get('revenue')?.value || '0';
          const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;

          //  Push cleaned revenue into array
          filteredInputs.push({
            revenue,
            fitnessRaw: input.get('product_fitness_percentage')?.value || '0'
          });
        }
      });
    });

    if (filteredInputs.length === 0) return '';

    //  Safe numeric reduce
    const numerator = filteredInputs.reduce((sum, entry) => {
      const fitness =
        parseFloat(entry.fitnessRaw.toString().replace('%', '').trim()) / 100;
      return sum + entry.revenue * fitness;
    }, 0);

    const denominator = filteredInputs.reduce(
      (sum, entry) => sum + entry.revenue,
      0
    );

    if (denominator === 0) return '';
    const percentage = Math.round((numerator / denominator) * 100);
    return percentage + '%';
  }



  calculateContextIndicator(index: number, year: number): string {
    // Sum revenueCost for all fitnessInputs with relevance == 1, grouped by productType and year
    const controls = this.products.controls;
    let totalRevenue = 0;

    controls.forEach(site => {
      const productType = site.get('productType')?.value;
      const fitnessInputs = site.get('fitnessInputs') as FormArray;

      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputControl => {
        const input = inputControl as FormGroup;
        const inputRelevance = input.get('relevance')?.value;

        // Extract & normalize year
        const inputYearRaw = input.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : Number(inputYearRaw) || 0;

        if (
          inputRelevance == 1 &&
          inputYear == year &&
          ((index == 0 && productType == 'Sold or leased goods') ||
            (index == 1 && productType == 'Supplementary goods'))
        ) {
          // totalRevenue += +site.get('revenueCost')?.value || 0;
          const rawRevenue = input.get('revenue')?.value || '0';
          const revenue = parseFloat(rawRevenue.toString().replace(/,/g, '')) || 0;
          totalRevenue += revenue;

          // totalRevenue += +input.get('revenue')?.value || 0;
        }
      });
    });

    // return totalRevenue ? totalRevenue.toString() : '';
    return totalRevenue == 0 ? '' : new Intl.NumberFormat('en-US').format(totalRevenue);

  }

  ngOnInit(): void {
    this.parentForm.valueChanges.subscribe(() => {
      this.disableServiceProducts();
    });

    //  Delay until form fully loads (edit mode)
    setTimeout(() => {
      this.products.controls.forEach((productGroup, productIndex) => {
        const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
        fitnessInputs.controls.forEach((_, inputIndex) => {
          this.onNumberOfDistinctChange(productIndex, inputIndex);
        });
      });
    }, 300); // small delay ensures data binding completed
  }


  onNumberOfDistinctChange(productIndex: number, inputIndex: number): void {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;

    if (!fitnessInputs) return;

    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    const count = +inputGroup.get('numberof_distinct')?.value || 0;

    for (let i = 1; i <= 10; i++) {
      const enabled = i <= count;

      const repurposingControl = inputGroup.get(`fitness${i}_repurposing`);
      const soldControl = inputGroup.get(`fitness${i}_sold`);

      if (repurposingControl && soldControl) {
        if (enabled) {
          repurposingControl.enable({ emitEvent: false });
          soldControl.enable({ emitEvent: false });
        } else {
          repurposingControl.setValue('', { emitEvent: false });
          repurposingControl.disable({ emitEvent: false });

          soldControl.setValue('', { emitEvent: false });
          soldControl.disable({ emitEvent: false });
          // repurposingControl.disable({ emitEvent: false });
          // soldControl.disable({ emitEvent: false });
        }
      }
    }

    this.calculateSiteFitness(productIndex, inputIndex);
  }



  onSubmit(showMessageAndRedirect: boolean = true) {
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
              fitness1_sold: this.parseNumber(val.fitness1_sold),
              fitness2_sold: this.parseNumber(val.fitness2_sold),
              fitness3_sold: this.parseNumber(val.fitness3_sold),
              fitness4_sold: this.parseNumber(val.fitness4_sold),
              fitness5_sold: this.parseNumber(val.fitness5_sold),
              fitness6_sold: this.parseNumber(val.fitness6_sold),
              fitness7_sold: this.parseNumber(val.fitness7_sold),
              fitness8_sold: this.parseNumber(val.fitness8_sold),
              fitness9_sold: this.parseNumber(val.fitness9_sold),
              fitness10_sold: this.parseNumber(val.fitness10_sold),
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
    const progressIndicators = years.map(year => ([
      {
        id: progressIndicatorIds[0],
        score: this.calculateProgressIndicator(0, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 0)
      },
      {
        id: progressIndicatorIds[1],
        score: this.calculateProgressIndicator(1, year),
        year,
        dataCompleteness: this.calculateDataCompleteness(year, 1)
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
      }
    ])).flat();


    const formData = {
      products: validProducts,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    console.log('BE19 Form Submitted:', formData);

    this.commonService.addData('be-form/submit/be19', formData).subscribe(
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

  resetBE19FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          relevance: '',
          numberof_distinct: null,

          fitness1_repurposing: null,
          fitness1_sold: null,
          fitness2_repurposing: null,
          fitness2_sold: null,
          fitness3_repurposing: null,
          fitness3_sold: null,
          fitness4_repurposing: null,
          fitness4_sold: null,
          fitness5_repurposing: null,
          fitness5_sold: null,
          fitness6_repurposing: null,
          fitness6_sold: null,
          fitness7_repurposing: null,
          fitness7_sold: null,
          fitness8_repurposing: null,
          fitness8_sold: null,
          fitness9_repurposing: null,
          fitness9_sold: null,
          fitness10_repurposing: null,
          fitness10_sold: null,

          product_fitness_percentage: null,
          comments: ''
        });

        [
          'relevance',
          'numberof_distinct',
          'fitness1_repurposing', 'fitness1_sold',
          'fitness2_repurposing', 'fitness2_sold',
          'fitness3_repurposing', 'fitness3_sold',
          'fitness4_repurposing', 'fitness4_sold',
          'fitness5_repurposing', 'fitness5_sold',
          'fitness6_repurposing', 'fitness6_sold',
          'fitness7_repurposing', 'fitness7_sold',
          'fitness8_repurposing', 'fitness8_sold',
          'fitness9_repurposing', 'fitness9_sold',
          'fitness10_repurposing', 'fitness10_sold',
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
    const newIndex = inputs.length - 1;
    this.onNumberOfDistinctChange(productIndex, newIndex);
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year || new Date().getFullYear()],
      revenue: [data?.revenue || null],
      relevance: [data?.relevance_id || '', Validators.required],
      numberof_distinct: [data?.numberof_distinct || null],
      fitness1_repurposing: [data?.fitness1_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness1_sold: [data?.fitness1_sold || null],
      fitness2_repurposing: [data?.fitness2_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness2_sold: [data?.fitness2_sold || null],
      fitness3_repurposing: [data?.fitness3_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness3_sold: [data?.fitness3_sold || null],
      fitness4_repurposing: [data?.fitness4_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness4_sold: [data?.fitness4_sold || null],
      fitness5_repurposing: [data?.fitness5_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness5_sold: [data?.fitness5_sold || null],
      fitness6_repurposing: [data?.fitness6_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness6_sold: [data?.fitness6_sold || null],
      fitness7_repurposing: [data?.fitness7_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness7_sold: [data?.fitness7_sold || null],
      fitness8_repurposing: [data?.fitness8_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness8_sold: [data?.fitness8_sold || null],
      fitness9_repurposing: [data?.fitness9_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness9_sold: [data?.fitness9_sold || null],
      fitness10_repurposing: [data?.fitness10_repurposing || null, [Validators.min(1), Validators.max(100)]],
      fitness10_sold: [data?.fitness10_sold || null],
      product_fitness_percentage: [data?.product_fitness_percentage || null],

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
          form: 'be19'
        }).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('Deleted!', 'Your data has been successfully deleted', 'success');
              inputs.removeAt(inputIndex);
              this.onSubmit(false);
              this.loading = false;// auto-submit, no message/redirect
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

  // year wise progress - context indicators changes

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

    //  Locate the product and its fitness input group
    const productGroup = this.products.at(productIndex) as FormGroup;
    const fitnessInputs = productGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    if (!fitnessInputs || !inputGroup) return;

    //  Prevent duplicate year entries within the same product
    const isDuplicate = fitnessInputs.controls.some((input, idx) => {
      if (idx === inputIndex) return false;
      const yearVal = input.get('year')?.value;
      const year = yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);
      return year === selectedYear;
    });

    if (isDuplicate) {
      inputGroup.get('year')?.setValue(null);
      inputGroup.get('year')?.setErrors({ duplicateYear: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker.close();
      return;
    }

    //  Assign selected year as Date object
    const dateForInput = new Date(selectedYear, 0, 1);
    const yearControl = inputGroup.get('year');
    yearControl?.setValue(dateForInput);
    yearControl?.setErrors(null);
    datepicker.close();

    //  Auto-fill or reset revenue if that control exists
    const productYearMap = productGroup.get('productYearMap')?.value || {};
    const matchedRevenue = productYearMap[selectedYear] ?? null;

    if (matchedRevenue && inputGroup.get('revenue')) {
      inputGroup.get('revenue')?.setValue(matchedRevenue, { emitEvent: false });
      this.formatCalculatedRevenueFields(inputGroup);
    } else if (inputGroup.get('revenue')) {
      inputGroup.get('revenue')?.reset('', { emitEvent: false });
    }

    //  Recalculate fitness after year change
    this.calculateSiteFitness(productIndex, inputIndex);

    //  Optionally, recalculate progress indicators for that year (if applicable)
    this.calculateProgressIndicator(productIndex, selectedYear);

    //  Trigger Angular change detection if UI doesn’t refresh automatically
    if ((this as any).cdr) (this as any).cdr.detectChanges?.();
  }
  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value; // skip formatting for text like "Error"
    return num.toLocaleString('en-US'); // adds commas (12,000)
  }

  private formatCalculatedRevenueFields(inputGroup: FormGroup): void {
    const fieldNames = ['revenue']; //  field to format in BE15
    fieldNames.forEach(name => {
      const control = inputGroup.get(name);
      if (control) {
        const formattedValue = this.formatNumberForDisplay(control.value);
        control.setValue(formattedValue, { emitEvent: false });
      }
    });
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



  calculateDataCompleteness(year: number, index: number): string {
    const selectedYear = year;

    //  Get product type from progress indicator
    const productType = (this.goal.ProgressIndicators[index]?.progress_indicator || '').toLowerCase();

    const allRelevanceValues: number[] = [];

    //  Loop through all products
    this.products.controls.forEach(product => {
      const siteProductType = (product.get('productType')?.value || '').toString().toLowerCase();
      if (siteProductType != productType) return;

      const fitnessInputs = product.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;

      fitnessInputs.controls.forEach(input => {
        const inputYear = input.get('year')?.value;
        const inputYearVal =
          inputYear instanceof Date ? inputYear.getFullYear() : Number(inputYear);

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
