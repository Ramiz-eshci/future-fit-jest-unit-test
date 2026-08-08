import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDateFormats, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from 'src/app/components/help-dialog/help-dialog.component';
import { Moment } from 'moment';
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
// export const MY_DATE_FORMATS: MatDateFormats = {
//   parse: {
//     dateInput: 'DD/MM/YYYY',
//   },
//   display: {
//     dateInput: 'DD/MM/YYYY',
//     monthYearLabel: 'MMM YYYY',
//     dateA11yLabel: 'DD/MM/YYYY',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

@Component({
  selector: 'app-be23-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    MatIconModule,
    MaterialModule, SharedModule, MatDatepickerModule, NgApexchartsModule],
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
  templateUrl: './be23-form.component.html',
  styleUrl: './be23-form.component.scss'
})
export class Be23FormComponent {
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
  // showRemaining: boolean = false;
  be004Tabs: any = [];
  categoryYearsData: { topYear: number | null; remainingYears: number[] }[] = [];
  showRemaining: boolean[] = []; // category-level expand flags
  selectedCategory: any = null;
  activeTab: 'progress' | 'context' = 'progress';
  selectedTabIndex: number = 0;


  constructor(private cd: ChangeDetectorRef, private dialog: MatDialog, private commonService: CommonService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private globalFlagService: GlobalFlagService) {
    // console.log(this.parentForm, '---parent form');  // To check the form initialization
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    // console.log(this.parentForm, 'parentForm');
    // console.log(this.fitEntryId, '---BE01 Input ID');  // To check the FormArray
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
    this.commonService.getData('list/be04_category').subscribe((response) => {
      if (response.status === true) {
        this.be004Tabs = response.data
        if (this.be004Tabs.length > 0) {
          this.selectedCategory = this.be004Tabs[0];
        }
      }
    });


  }

  openProgressGraph(): void {

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

    // collect every year from every category
    const yearSet = new Set<number>();

    this.uniqueYearsFromFitnessInputs.forEach(arr => {
      arr.forEach(y => yearSet.add(y));
    });

    const years = Array.from(yearSet).sort((a, b) => a - b);

    const categoryColors = [
      '#1976D2', // Blue
      '#00C853', // Green
      '#FFA726', // Orange
      '#E53935', // Red
      '#8E24AA', // Purple
      '#26A69A', // Teal
      '#3949AB', // Indigo
      '#FDD835', // Yellow
      '#EC407A', // Pink
    ];

    const series = this.be004Tabs.map((category: any, categoryIndex: number) => {

      return {

        name: category.name,

        type: 'line',
        color: categoryColors[categoryIndex],

        data: years.map(year => {

          const value =
            this.calculateProgressIndicator(
              year,
              categoryIndex
            );

          if (!value) {
            return null;
          }

          return Number(value.replace('%', ''));

        })

      };

    });

    this.chartOptions = {

      series,

      chart: {
        type: 'line',
        height: 450,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        curve: 'straight',
        width: 3
      },

      markers: {
        size: 4
      },

      xaxis: {
        categories: years,
        title: {
          text: 'Year'
        }
      },

      yaxis: {
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

      legend: {
        position: 'bottom'
      },

      dataLabels: {
        enabled: false
      },

      tooltip: {
        y: {
          formatter: (val: number) => val + '%'
        }
      }

    };

  }

  get products(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }
  addProductInput(productIndex: number, categoryIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const inputs = categoryGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
  }
  // getContextDescription(year: number, categoryIndex: number): string {
  //   if (!this.products?.length) return '';

  //   let latestContext = '';

  //   this.products.controls.forEach((product: AbstractControl) => {
  //     const categories = product.get('categories') as FormArray;
  //     const categoryGroup = categories.at(categoryIndex) as FormGroup;
  //     if (!categoryGroup) return;

  //     const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs?.length) return;

  //     fitnessInputs.controls.forEach((input: AbstractControl) => {
  //       const yearVal = input.get('year')?.value;
  //       const inputYear =
  //         yearVal instanceof Date
  //           ? yearVal.getFullYear()
  //           : typeof yearVal == 'string' && yearVal.includes('/')
  //             ? Number(yearVal.split('/')[2])
  //             : Number(yearVal) || 0;

  //       if (inputYear == year) {
  //         const contextVal = input.get('contextDescription')?.value?.trim();
  //         if (contextVal) {
  //           latestContext = contextVal; // latest context for this year
  //         }
  //       }
  //     });
  //   });

  //   return latestContext || '';
  // }
  getContextDescription(
    year: number,
    categoryIndex: number
  ): { productName: string; contextDescription: string }[] {

    if (!this.products?.length) return [];

    const contextEntries: { productName: string; contextDescription: string }[] = [];

    this.products.controls.forEach((product: AbstractControl) => {
      const productGroup = product as FormGroup;
      const productName = productGroup.get('financialAsset')?.value;

      const categories = productGroup.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {
        const yearVal = input.get('year')?.value;
        const inputYear =
          yearVal instanceof Date
            ? yearVal.getFullYear()
            : typeof yearVal == 'string' && yearVal.includes('/')
              ? Number(yearVal.split('/')[2])
              : Number(yearVal) || 0;

        const contextVal = input.get('contextDescription')?.value?.trim();
        if (inputYear == year && contextVal) {
          contextEntries.push({
            productName,
            contextDescription: contextVal
          });
        }
      });
    });

    return contextEntries;
  }




  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();

  }
  switchTab(tab: 'progress' | 'context'): void {
    this.activeTab = tab;
  }
  hasCategoryData(categoryId: number | undefined): boolean {
    if (!this.categoryYearsData || !this.be004Tabs) return false;

    const index = this.be004Tabs.findIndex((tab: any) => tab.id == categoryId);
    if (index == -1) return false;

    return !!this.categoryYearsData[index]?.topYear;
  }
  triggerChangeDetection(): void {
    this.cd.detectChanges();
  }

  createFitnessInput(data?: any): FormGroup {
    const year = data?.year ? new Date(data.year, 0, 1) : '';

    return this.fb.group({
      id: [data?.id || 0],
      year: [year, [Validators.required]],
      monetaryValue: [data?.monetary_value || 0],
      relevance: [data?.relevance_id || '', Validators.required],
      financialAssetDoes: [data?.financial_asset_does || false],
      hotspotAssessment: [data?.hotspot_assessmen || false],
      potentialHotspotsIdentified: [data?.potential_hotspots_identified || false],
      actualHotspots: [data?.actual_hotspots || false],
      allHighIntensityHotspot: [data?.all_high_intensity_hotspot || false],
      allHotspotsHaveBeen: [data?.all_hotspots_have_been || false],

      financialFitness: [data?.financial_fitness != null ? `${data?.financial_fitness}%` : null],
      contextDescription: [data?.context_description || ''],
      comments: [data?.comments || ''],

      finanical_id: [data?.finanical_id || 0],
      categoryId: [data?.category_id || null],
    });
  }
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getFitnessInputs(product: AbstractControl, categoryIndex: number): FormArray {
    const categories = product.get('categories') as FormArray;
    return categories.at(categoryIndex).get('fitnessInputs') as FormArray;
  }

  isReadOnly(productIndex: number, inputIndex: number): boolean {
    const productInputs = (this.products.at(productIndex).get('fitnessInputs') as FormArray);
    const inputGroup = productInputs.at(inputIndex);
    const relevance = inputGroup.get('relevance')?.value;
    return relevance != undefined && relevance != null && relevance != '' && relevance != 1;
  }


  calculateProgressIndicator1(
    year: number,
    categoryIndex: number,
    indicatorId?: number
  ): string {
    let numerator = 0;
    let denominator = 0;
    let hasIncluded = false;


    this.products.controls.forEach((product, productIndex) => {
      const categories = product.get('categories') as FormArray;
      if (!categories?.length) return;

      categories.controls.forEach((categoryGroup: AbstractControl, catIdx: number) => {
        if (catIdx != categoryIndex) return; // only target selected category index

        const fitnessInputs = (categoryGroup.get('fitnessInputs') as FormArray) || new FormArray([]);
        if (!fitnessInputs?.length) return;

        fitnessInputs.controls.forEach((input: AbstractControl) => {
          const relevance = input.get('relevance')?.value;


          const inputYearVal = input.get('year')?.value;
          let inputYear: number | null = null;
          if (typeof inputYearVal == 'number') inputYear = inputYearVal;
          else if (typeof inputYearVal == 'string' && inputYearVal.trim().length == 4)
            inputYear = parseInt(inputYearVal, 10);
          else if (inputYearVal instanceof Date)
            inputYear = inputYearVal.getFullYear();

          const inputIndicatorId = input.get('indicatorId')?.value;


          if (!inputYear || isNaN(inputYear)) return;

          // const monetaryValueRaw = (input.get('monetaryValue')?.value || '0')
          //   .toString()
          //   .replace(/,/g, '');
          // const monetaryValue = parseFloat(monetaryValueRaw) || 0;
          const monetaryValue = this.parseNumber(input.get('monetaryValue')?.value);


          const reportingPeriodRaw = product.get('reportingPeriod')?.value;
          let reportingPeriod = 0;
          if (reportingPeriodRaw instanceof Date)
            reportingPeriod = reportingPeriodRaw.getFullYear();
          else if (!isNaN(+reportingPeriodRaw) && +reportingPeriodRaw > 0)
            reportingPeriod = +reportingPeriodRaw;
          else reportingPeriod = inputYear || 0;


          if (
            relevance == 1 &&
            Number(inputYear) == Number(year) &&
            (!indicatorId || indicatorId == inputIndicatorId)
          ) {
            hasIncluded = true;

            // const financialFitnessRaw = input.get('financialFitness')?.value ?? '0';
            // const financialFitness = parseFloat(
            //   (typeof financialFitnessRaw === 'string'
            //     ? financialFitnessRaw
            //     : financialFitnessRaw + '%'
            //   ).toString().replace('%', '')
            // ) || 0;
            const financialFitness = this.parseNumber(input.get('financialFitness')?.value);


            numerator += monetaryValue * reportingPeriod * financialFitness;
            denominator += monetaryValue * reportingPeriod;
          }
        });
      });
    });


    if (denominator === 0 || !hasIncluded) return '';

    const result = Math.round(numerator / denominator) + '%';
    return result;
  }

  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  }

  private formatCalculatedMonetaryFields(inputGroup: FormGroup): void {
    const control = inputGroup.get('monetaryValue');
    if (control) {
      const formattedValue = this.formatNumberForDisplay(control.value);
      control.setValue(formattedValue, { emitEvent: false });
    }
  }






  calculateProgressIndicator(
    year: number,
    categoryIndex: number,
    indicatorId?: number
  ): string {
    let numerator = 0;
    let denominator = 0;
    let hasMonetaryValue = false;
    let hasIncluded = false;

    this.products.controls.forEach(product => {
      const categories = product.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {

        // const monetaryValueRaw = (input.get('monetaryValue')?.value || '0').toString().replace(/,/g, '');
        // const monetaryValue = parseFloat(monetaryValueRaw) || 0;
        const monetaryValue = this.parseNumber(input.get('monetaryValue')?.value);

        if (monetaryValue > 0) {
          hasMonetaryValue = true;
        }


        const relevance = input.get('relevance')?.value;

        const inputYearVal = input.get('year')?.value;
        let inputYear: number | null = null;
        if (typeof inputYearVal == 'number') inputYear = inputYearVal;
        else if (typeof inputYearVal == 'string' && inputYearVal.trim().length == 4)
          inputYear = parseInt(inputYearVal, 10);
        else if (inputYearVal instanceof Date)
          inputYear = inputYearVal.getFullYear();

        const inputIndicatorId = input.get('indicatorId')?.value;


        if (relevance == 1 && inputYear == year && (!indicatorId || indicatorId == inputIndicatorId)) {
          hasIncluded = true;


          // const financialFitnessRaw = input.get('financialFitness')?.value ?? '0';
          // const financialFitness = parseFloat(
          //   (typeof financialFitnessRaw == 'string'
          //     ? financialFitnessRaw
          //     : financialFitnessRaw + '%'
          //   ).toString().replace('%', '')
          // ) || 0;
          const financialFitness = this.parseNumber(input.get('financialFitness')?.value);



          numerator += monetaryValue * financialFitness;
          denominator += monetaryValue;
        }
      });
    });


    if (!hasMonetaryValue) return '';
    if (!hasIncluded) return '';
    if (denominator === 0) return '';


    return Math.round(numerator / denominator) + '%';
  }







  // calculateDataCompleteness(year: number, categoryIndex: number, indicatorId?: number): string {
  //   if (!this.products?.length) return '';

  //   for (let i = this.products.length - 1; i >= 0; i--) {
  //     const product = this.products.at(i) as FormGroup;
  //     const categories = product.get('categories') as FormArray;
  //     if (!categories?.length) continue;

  //     const categoryGroup = categories.at(categoryIndex) as FormGroup;
  //     if (!categoryGroup) continue;

  //     const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs?.length) continue;


  //     const relevanceValues: number[] = fitnessInputs.controls
  //       .filter((input: any) => {
  //         const inputYearRaw = input.get('year')?.value;
  //         const inputYear = this.getYearValue(inputYearRaw);

  //         const inputIndicatorId = input.get('indicatorId')?.value;
  //         return (
  //           inputYear == year &&
  //           (!indicatorId || indicatorId == inputIndicatorId)
  //         );
  //       })
  //       .map((input: any) => input.get('relevance')?.value)
  //       .filter(
  //         (val: any) =>
  //           val != null &&
  //           val != undefined &&
  //           !isNaN(val)
  //       );


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
  //       if (hasIncluded && relevanceValues.every((val) => val == 1)) {
  //         return 'Calculation based on complete data';
  //       }

  //       return '';
  //     }
  //   }

  //   return '';
  // }
  calculateDataCompleteness(year: number, categoryIndex: number, indicatorId?: number): string {
    if (!this.products?.length) return '';

    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    for (const productControl of this.products.controls) {
      const product = productControl as FormGroup;
      const categories = product.get('categories') as FormArray;
      if (!categories?.length) continue;

      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) continue;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) continue;


      for (const input of fitnessInputs.controls) {
        const inputYearRaw = input.get('year')?.value;
        const inputYear =
          this.getYearValue
            ? this.getYearValue(inputYearRaw)
            : (inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : Number(inputYearRaw));

        const inputIndicatorId = input.get('indicatorId')?.value;
        if (inputYear == selectedYear && (!indicatorId || indicatorId == inputIndicatorId)) {
          const relevanceVal = input.get('relevance')?.value;
          if (relevanceVal != null && relevanceVal != undefined && !isNaN(relevanceVal)) {
            allRelevanceValues.push(Number(relevanceVal));
          }
        }
      }
    }


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







  getlatestYeardata(): void {
    if (!this.uniqueYearsFromFitnessInputs?.length) {
      this.categoryYearsData = [];
      this.showRemaining = [];
      return;
    }


    const allYears: any[] = this.uniqueYearsFromFitnessInputs.map((yearArr: any) => {
      const cleaned = (yearArr || [])
        .map((y: any) => this.getYearValue(y))
        .filter((y: any) => y != null)
        .sort((a: any, b: any) => b - a);
      return cleaned;
    });

    // Build final data structure
    this.categoryYearsData = allYears.map((yearsArr: any) => ({
      topYear: yearsArr[0] ?? null,
      remainingYears: yearsArr.slice(1),
    }));

    // Initialize showRemaining flags
    this.showRemaining = this.categoryYearsData.map(() => false);
  }



  hasRemainingYears(catIndex: number): boolean {
    return !!(
      this.categoryYearsData &&
      this.categoryYearsData[catIndex] &&
      this.categoryYearsData[catIndex].remainingYears.length > 0
    );
  }



  private applyRelevanceLogic(inputGroup: FormGroup, fields: string[], relevance: any) {
    if (relevance == 1) {
      fields.forEach(field => {
        inputGroup.get(field)?.enable({ emitEvent: false });
      });
    } else {
      fields.forEach(field => {
        const ctrl = inputGroup.get(field);
        ctrl?.setValue(false, { emitEvent: false }); // force uncheck
        ctrl?.disable({ emitEvent: false });
      });
    }
  }

  onRelevanceChange1(productIndex: number, categoryIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const inputs = categories.at(categoryIndex).get('fitnessInputs') as FormArray;
    const inputGroup = inputs.at(inputIndex) as FormGroup;

    const checkboxFields = [
      'companyContinuously',
      'allHotspotsHaveBeenAvoided',
      'allHotspotFromCardle'

    ];

    const relevance = inputGroup.get('relevance')?.value;
    this.applyRelevanceLogic(inputGroup, checkboxFields, relevance);

    const yearValue = inputGroup.get('year')?.value;
    let year: number = 0;
    if (yearValue instanceof Date) year = yearValue.getFullYear();
    else year = +yearValue;

    this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
    this.calculateProgressIndicator(year, categoryIndex);
    this.calculateDataCompleteness(year, categoryIndex);
  }
  onRelevanceChange(productIndex: number, categoryIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const inputs = categories.at(categoryIndex).get('fitnessInputs') as FormArray;
    const inputGroup = inputs.at(inputIndex) as FormGroup;

    const checkboxFields = [
      'companyContinuously',
      'allHotspotsHaveBeenAvoided',
      'allHotspotFromCardle'
    ];

    const relevance = inputGroup.get('relevance')?.value;
    this.applyRelevanceLogic(inputGroup, checkboxFields, relevance);


    const yearValue = inputGroup.get('year')?.value;
    let year: number | null = null;

    if (typeof yearValue === 'number') {
      year = yearValue;
    } else if (typeof yearValue === 'string' && yearValue.trim().length === 4) {
      year = parseInt(yearValue, 10);
    } else if (yearValue instanceof Date) {
      year = yearValue.getFullYear();
    }


    if (year && !isNaN(year)) {
      this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
      this.calculateProgressIndicator(year, categoryIndex);
      this.calculateDataCompleteness(year, categoryIndex);
    }
  }

  get financialArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }

  ngOnInit() {
    // console.log('parentForm:', this.parentForm.value);
    // console.log('financialArray:', this.financialArray.value);

    this.products.controls.forEach((productGroup, productIndex) => {
      const categories = (productGroup.get('categories') as FormArray);

      categories.controls.forEach((categoryGroup, categoryIndex) => {
        const fitnessInputs = (categoryGroup.get('fitnessInputs') as FormArray);

        fitnessInputs.controls.forEach((inputGroup, inputIndex) => {
          const checkboxFields = [
            'companyContinuously',
            'allHotspotsHaveBeenAvoided',
            'allHotspotFromCardle'
          ];

          const relevance = inputGroup.get('relevance')?.value;
          this.applyRelevanceLogic(inputGroup as FormGroup, checkboxFields, relevance);

          const yearValue = inputGroup.get('year')?.value;
          let year: number = 0;
          if (yearValue instanceof Date) year = yearValue.getFullYear();
          else if (!isNaN(+yearValue)) year = +yearValue;

          const indicatorId = inputGroup.get('indicatorId')?.value;
          if (year) {
            this.disableFieldsByPurchaseType(productIndex);
            this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
            this.calculateProgressIndicator(year, categoryIndex, indicatorId);
            this.calculateDataCompleteness(year, categoryIndex, indicatorId);
          }
        });
      });
    });

    if (this.be004Tabs && this.be004Tabs.length > 0) {
      this.selectedCategory = this.be004Tabs[0];
    }
  }
  ngOnInit1() {
    // console.log('parentForm:', this.parentForm?.value);
    // console.log('financialArray:', this.financialArray?.value);

    if (!this.products?.length) return;

    this.products.controls.forEach((productGroup: any, productIndex: number) => {
      const categories = productGroup.get('categories') as FormArray;
      if (!categories?.length) return;

      categories.controls.forEach((categoryGroup: any, categoryIndex: number) => {
        const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
        if (!fitnessInputs?.length) return;

        fitnessInputs.controls.forEach((inputGroup: any, inputIndex: number) => {
          const checkboxFields = [
            'companyContinuously',
            'allHotspotsHaveBeenAvoided',
            'allHotspotFromCardle',
          ];


          const relevance = inputGroup.get('relevance')?.value;
          this.applyRelevanceLogic(inputGroup, checkboxFields, relevance);


          const yearValue = inputGroup.get('year')?.value;
          const year = this.getYearValue(yearValue);

          const indicatorId = inputGroup.get('indicatorId')?.value;


          if (year) {
            this.disableFieldsByPurchaseType(productIndex);
            this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
            this.calculateProgressIndicator(year, categoryIndex, indicatorId);
            this.calculateDataCompleteness(year, categoryIndex, indicatorId);
          }
        });
      });
    });


    if (this.be004Tabs?.length > 0) {
      this.selectedCategory = this.be004Tabs[0];
    }
  }


  disableFieldsByPurchaseType(productIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const purchaseType: string = productGroup.get('PurchaseType')?.value;

    const disabledFieldsMap: { [key: string]: string[] } = {
      'Product input': ['companyContinuously', 'allHotspotsHaveBeenAvoided'],
      'Outsourced core function': ['allHotspotFromCardle', 'companyContinuously'],
      'Ancillary spend': ['allHotspotsHaveBeenAvoided', 'allHotspotFromCardle']
    };

    const disabledFields = disabledFieldsMap[purchaseType] || [];

    const categories = productGroup.get('categories') as FormArray;
    categories.controls.forEach((categoryGroup: AbstractControl) => {
      const fitnessInputs = (categoryGroup as FormGroup).get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach((inputGroup: AbstractControl) => {
        disabledFields.forEach(field => {
          const ctrl = (inputGroup as FormGroup).get(field);
          if (ctrl && ctrl.enabled) {
            ctrl.disable({ emitEvent: false });
          }
        });
      });
    });
  }


  onCategoryChange(index: number): void {
    this.selectedCategory = this.be004Tabs[index];
    this.selectedTabIndex = index;

    this.products.controls.forEach((product, productIndex) => {
      const categories = product.get('categories') as FormArray;

      if (categories && categories.length > index) {
        product.get('selectedCategoryIndex')?.setValue(index);
      }
    });

    this.cd.detectChanges();
  }



  calculateFinancialFitness(productIndex: number, categoryIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;


    const normalize = (val: any): boolean => {
      return val === true || val === "Yes" || val === 1 || val === "1";
    };


    const relevance: number = inputGroup.get('relevance')?.value;  // F9
    const potentialHotspotsIdentified = normalize(inputGroup.get('potentialHotspotsIdentified')?.value); // I9
    const financialAssetDoes = normalize(inputGroup.get('financialAssetDoes')?.value); // G9
    const hotspotAssessment = normalize(inputGroup.get('hotspotAssessment')?.value);   // H9


    const dependentFields = ['actualHotspots', 'allHighIntensityHotspot', 'allHotspotsHaveBeen'];


    if (!potentialHotspotsIdentified) {

      dependentFields.forEach(f => {
        inputGroup.get(f)?.disable({ emitEvent: false });
        inputGroup.get(f)?.setValue(false, { emitEvent: false });
      });
    } else {

      dependentFields.forEach(f => inputGroup.get(f)?.enable({ emitEvent: false }));
    }


    let R9 = 0;
    if (financialAssetDoes) R9++;
    if (hotspotAssessment) R9++;
    if (potentialHotspotsIdentified) R9++;
    dependentFields.forEach(f => {
      if (normalize(inputGroup.get(f)?.value)) {
        R9++;
      }
    });

    // Fitness calculation
    let fitness: number | "" = "";

    if (relevance != 1) {
      fitness = "";
      inputGroup.patchValue({
        potentialHotspotsIdentified: false,
        financialAssetDoes: false,
        hotspotAssessment: false,
        actualHotspots: false,
        allHighIntensityHotspot: false,
        allHotspotsHaveBeen: false
      }, { emitEvent: false });
      dependentFields.forEach(f => inputGroup.get(f)?.disable({ emitEvent: false }));

    } else if (!potentialHotspotsIdentified && !(financialAssetDoes && hotspotAssessment)) {
      fitness = 0;

    } else if (!financialAssetDoes || !hotspotAssessment) {
      fitness = 0;

    } else {
      if (R9 < 3) fitness = 0;
      else if (R9 === 3) fitness = 25;
      else if (R9 === 4) fitness = 50;
      else if (R9 === 5) fitness = 75;
      else if (R9 >= 6) fitness = 100;
      if (financialAssetDoes && hotspotAssessment && !potentialHotspotsIdentified) {
        fitness = 100;
      }
    }

    // Patch fitness value
    inputGroup.get('financialFitness')?.setValue(fitness !== "" ? fitness + "%" : "");
  }
  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '500px',
      data: { criteria, notes }
    });
  }


  addFitnessInput(productIndex: number, categoryIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const inputs = categoryGroup.get('fitnessInputs') as FormArray;

    inputs.push(this.createFitnessInput());

    this.getlatestYeardata();
    this.disableFieldsByPurchaseType(productIndex);
  }



  private formatDateToDMY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private getYearValue(input: any): number | null {
    if (!input) return null;

    if (input instanceof Date) return input.getFullYear();

    if (typeof input == 'string') {
      if (input.includes('/')) {
        const parts = input.split('/');
        return Number(parts[2]);
      }
      if (!isNaN(+input)) return Number(input);
    }

    if (typeof input == 'number') return input;

    return null;
  }




  setDate1(
    event: MatDatepickerInputEvent<Date>,
    datepicker: any,
    productIndex: number,
    categoryIndex: number,
    inputIndex: number
  ): void {
    let selectedDate: any = event.value;
    if (selectedDate?._isAMomentObject) selectedDate = selectedDate.toDate();
    if (!(selectedDate instanceof Date)) return;

    const formattedDate = this.formatDateToDMY(selectedDate);
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    if (!inputGroup) return;


    const selectedYear = selectedDate.getFullYear();


    const existingYears = fitnessInputs.controls
      .filter((_, idx) => idx != inputIndex)
      .map((input) => {
        const val = input.get('year')?.value;
        if (val instanceof Date) return val.getFullYear();
        if (typeof val == 'string' && val.includes('/')) {
          const parts = val.split('/');
          return Number(parts[2]);
        }
        return null;
      })
      .filter((y) => y != null);


    if (existingYears.includes(selectedYear)) {
      inputGroup.get('year')?.setErrors({ duplicateDate: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker.close();
      return;
    }


    inputGroup.get('year')?.setValue(selectedDate);
    inputGroup.get('year')?.updateValueAndValidity();


    const dateMap = productGroup.get('financialDateMap')?.value || {};
    let matchedValue: any = undefined;
    Object.keys(dateMap).forEach((key) => {
      if (key.trim() == formattedDate.trim()) {
        matchedValue = dateMap[key];
      }
    });

    if (matchedValue != null && matchedValue !== undefined) {
      inputGroup.get('monetaryValue')?.setValue(matchedValue);
    } else {
      inputGroup.get('monetaryValue')?.reset();
    }

    this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
    datepicker.close();
    this.getlatestYeardata();
  }

  setYear(
    event: any,
    datepicker: any,
    productIndex: number,
    categoryIndex: number,
    inputIndex: number
  ): void {
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
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    if (!inputGroup) return;


    const isDuplicate = fitnessInputs.controls.some((input, idx) => {
      if (idx === inputIndex) return false;
      const yearVal = input.get('year')?.value;
      const existingYear =
        yearVal instanceof Date
          ? yearVal.getFullYear()
          : typeof yearVal === 'number'
            ? yearVal
            : null;
      return existingYear === selectedYear;
    });

    if (isDuplicate) {
      inputGroup.get('year')?.setValue(null);
      inputGroup.get('year')?.setErrors({ duplicateYear: true });
      inputGroup.get('year')?.markAsTouched();
      datepicker?.close?.();
      return;
    }


    inputGroup.get('year')?.setValue(new Date(selectedYear, 0, 1));
    inputGroup.get('year')?.updateValueAndValidity();


    const dateMap = productGroup.get('financialDateMap')?.value || {};
    let matchedValue: any = undefined;

    Object.keys(dateMap).forEach((key) => {
      const mapYear = new Date(key).getFullYear();
      if (mapYear === selectedYear) {
        matchedValue = dateMap[key];
      }
    });

    if (matchedValue != null && matchedValue !== undefined) {
      inputGroup.get('monetaryValue')?.setValue(matchedValue);
      this.formatCalculatedMonetaryFields(inputGroup);
    } else {
      inputGroup.get('monetaryValue')?.reset();
    }

    this.calculateFinancialFitness(productIndex, categoryIndex, inputIndex);
    datepicker?.close?.();
    this.getlatestYeardata();
  }





  get uniqueYearsFromFitnessInputs1(): number[][] {
    const numCategories =
      this.be004Tabs?.length ??
      (((this.products.at(0)?.get('categories') as FormArray)?.length) || 0);

    const categoryYearSets: Array<Set<number>> =
      Array.from({ length: numCategories }, () => new Set<number>());

    this.products.controls.forEach(product => {
      const categories = product.get('categories') as FormArray;
      categories?.controls.forEach((category, catIndex) => {
        if (catIndex >= numCategories) return;

        const fitnessInputs = category.get('fitnessInputs') as FormArray;
        fitnessInputs?.controls.forEach(input => {
          const yearVal = input.get('year')?.value;
          const relevanceVal = input.get('relevance')?.value;


          const year = this.getYearValue(yearVal);


          const relNum = Number(relevanceVal);
          const isRelValid =
            relevanceVal != null &&
            relevanceVal != undefined &&
            String(relevanceVal).trim() != '' &&
            !isNaN(relNum) &&
            relNum != 0;

          if (year && !isNaN(year) && isRelValid) {
            categoryYearSets[catIndex].add(year);
          }
        });
      });
    });


    return categoryYearSets.map(set => Array.from(set).sort((a, b) => b - a));
  }
  get uniqueYearsFromFitnessInputs(): number[][] {
    const numCategories =
      this.be004Tabs?.length ??
      (((this.products.at(0)?.get('categories') as FormArray)?.length) || 0);

    const categoryYearSets: Array<Set<number>> =
      Array.from({ length: numCategories }, () => new Set<number>());

    this.products.controls.forEach(product => {
      const categories = product.get('categories') as FormArray;
      categories?.controls.forEach((category, catIndex) => {
        if (catIndex >= numCategories) return;

        const fitnessInputs = category.get('fitnessInputs') as FormArray;
        fitnessInputs?.controls.forEach(input => {
          const yearVal = input.get('year')?.value;
          const relevanceVal = input.get('relevance')?.value;

          let year: number | null = null;
          if (yearVal instanceof Date) year = yearVal.getFullYear();
          else if (typeof yearVal === 'number') year = yearVal;
          else if (typeof yearVal === 'string' && yearVal.length === 4)
            year = parseInt(yearVal, 10);

          // relevance non-empty & non-zero (handle "1" / 1)
          const relNum = Number(relevanceVal);
          const isRelValid =
            relevanceVal !== null &&
            relevanceVal !== undefined &&
            String(relevanceVal).trim() !== '' &&
            !isNaN(relNum) &&
            relNum !== 0;

          if (year && !isNaN(year) && isRelValid) {
            categoryYearSets[catIndex].add(year);
          }
        });
      });
    });

    // convert Sets to sorted arrays (desc)
    return categoryYearSets.map(set => Array.from(set).sort((a, b) => b - a));
  }



  parseNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(val.toString().replace(/,/g, '').replace('%', '').trim());
    return isNaN(num) ? 0 : num;
  }

  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
    this.getlatestYeardata();
    this.cd.detectChanges();

  }
  removeFitnessInput(productIndex: number, categoryIndex: number, inputIndex: number) {
    const productGroup = this.products.at(productIndex) as FormGroup;
    const categories = productGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const inputs = categoryGroup.get('fitnessInputs') as FormArray;
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
          form: 'be23'
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
  getMonetaryTotal(year: number, categoryIndex: number): string {
    let totalMonetary = 0;
    let hasValidMonetary = false;

    this.products.controls.forEach(product => {
      const categories = product.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const inputYearVal = input.get('year')?.value;
        const inputYear =
          inputYearVal instanceof Date
            ? inputYearVal.getFullYear()
            : typeof inputYearVal == 'string' && inputYearVal.includes('/')
              ? Number(inputYearVal.split('/')[2])
              : Number(inputYearVal) || 0;

        const relevance = input.get('relevance')?.value;

        if (inputYear == year && relevance == 1) {
          // const monetaryValueRaw = input.get('monetaryValue')?.value;
          // const monetary = parseFloat(monetaryValueRaw);
          const monetary = this.parseNumber(input.get('monetaryValue')?.value);

          if (!isNaN(monetary) && monetary >= 0) {
            totalMonetary += monetary;
            hasValidMonetary = true;
          }
        }
      });
    });

    return hasValidMonetary ? totalMonetary.toLocaleString() : '';
  }

  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
  }

  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    this.formSubmittedFlag = true;
    const valuesArray = this.parentForm.get(this.arrayName) as FormArray;
    this.loading = true;
    valuesArray.controls.forEach(valueGroup => {
      valueGroup.markAllAsTouched();
    });

    const filteredValues = valuesArray.value
      .map((valueGroup: any) => {
        const validCategories: any[] = [];

        valueGroup.categories.forEach((category: any) => {
          const validFinancialInputs = category.fitnessInputs
            .filter((f: any) => {
              const relevance = f.relevance;
              const year = f.year;


              const isValidYear =
                year !== null && year !== undefined &&
                (
                  (year instanceof Date && !isNaN(year.getTime())) ||
                  (!isNaN(Number(year)) && String(year).length === 4)
                );

              const hasRelevance =
                relevance !== null &&
                relevance !== undefined &&
                String(relevance).trim() !== '';

              return hasRelevance && isValidYear;
            })
            .map((f: any) => {
              let onlyYear = f.year;
              if (f.year instanceof Date) {
                onlyYear = f.year.getFullYear();
              }
              return { ...f, year: onlyYear };
            });


          if (validFinancialInputs.length > 0) {
            validCategories.push({
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              // fitnessInputs: validFinancialInputs
              fitnessInputs: validFinancialInputs.map((f: any) => ({
                ...f,
                monetaryValue: this.parseNumber(f.monetaryValue)

              }))

            });
          }
        });

        if (validCategories.length > 0) {
          return {
            ...valueGroup,
            categories: validCategories
          };
        }
        return null;
      })
      .filter((val: any) => val !== null);

    // const progressIndicators: any[] = [];

    // filteredValues.forEach((fa: any) => {
    //   fa.categories.forEach((cat: any, catIndex: number) => {
    //     cat.fitnessInputs.forEach((fi: any) => {
    //       const year = fi.year;
    //       const indicatorId = fi.indicatorId;


    //       const score = this.calculateProgressIndicator(year, catIndex, indicatorId
    //       );

    //       progressIndicators.push({
    //         categoryId: cat.categoryId,
    //         score: score,
    //         year: year
    //       });
    //     });
    //   });
    // });
    const progressIndicators: any[] = [];

    this.uniqueYearsFromFitnessInputs.forEach((yearsArr, categoryIndex) => {
      yearsArr.forEach((year: any) => {
        const score = this.calculateProgressIndicator(year, categoryIndex);

        const firstSite = this.products.at(0) as FormGroup;
        const firstCategories = firstSite.get('categories') as FormArray;
        const categoryGroup = firstCategories.at(categoryIndex) as FormGroup;
        const realCategoryId = categoryGroup?.get('categoryId')?.value;

        if (realCategoryId) {
          progressIndicators.push({
            categoryId: realCategoryId,
            score: score,
            year: year
          });
        }
      });
    });

    if (this.routeId !== null && this.routeId !== undefined) {
      this.fitEntryId = this.routeId;
    }
    const goalCodeId = this.goal.goal_code;
    const formData = {
      value: filteredValues.map((fa: any) => ({
        financialAsset: fa.financialAsset,
        financialAssetId: fa.financialAssetId,
        finanicalId: fa.finanicalId,
        monetaryValue: fa.monetaryValue,
        reportingPeriod: fa.reportingPeriod,
        BEID: fa.BEID,
        be23_data: fa.categories.map((cat: any) => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          fitnessInputs: cat.fitnessInputs
        }))
      })),
      progress_indicators: progressIndicators,
      fit_entry_id: this.fitEntryId,
      goalCode_id: goalCodeId,
    };



    this.commonService.addData('be-form/submit/be23', formData).subscribe(
      (response) => {
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
      (error) => {
        this.loading = false;
        console.error("Error submitting BE23 form:", error);
      }
    );
  }


  private extractYear(value: any): string {
    if (value instanceof Date) return value.getFullYear().toString();
    if (typeof value == 'string' && value.includes('/')) return value.split('/')[2]?.trim() || '';
    if (!isNaN(Number(value))) return value.toString();
    return '';
  }




}
