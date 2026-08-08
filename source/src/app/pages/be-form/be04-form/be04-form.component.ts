import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { trigger, state, style, animate, transition } from '@angular/animations';
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
  selector: 'app-be04-form',
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
  templateUrl: './be04-form.component.html',
  styleUrl: './be04-form.component.scss'
})
export class Be04FormComponent {

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
  selectedTabIndex: number = 0;

  activeTab: 'progress' | 'context' = 'progress';


  constructor(private cd: ChangeDetectorRef, private dialog: MatDialog, private commonService: CommonService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private globalFlagService: GlobalFlagService) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    // console.log(this.parentForm, 'parentForm');
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
  addFitnessInput(siteIndex: number, categoryIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const categories = siteGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const inputs = categoryGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.getlatestYeardata();
    this.disableFieldsByPurchaseType(siteIndex)
  }
  switchTab(tab: 'progress' | 'context'): void {
    this.activeTab = tab;
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
  _old_prepareChartData(categoryIndex: number): void {

    const years = [...this.uniqueYearsFromFitnessInputs[categoryIndex]]
      .sort((a, b) => a - b);

    const indicatorMap = new Map<number, string>();

    this.sites.controls.forEach(site => {

      const categories = site.get('categories') as FormArray;

      const category = categories.at(categoryIndex) as FormGroup;

      if (!category) return;

      const fitnessInputs = category.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {

        const id = Number(input.get('indicatorId')?.value);

        const name =
          input.get('indicatorName')?.value ||
          input.get('indicator')?.value ||
          input.get('name')?.value;

        if (id && name) {

          indicatorMap.set(id, name);

        }

      });

    });


    const series = Array.from(indicatorMap.entries()).map(([indicatorId, indicatorName]) => {

      return {

        name: indicatorName,

        type: 'line',

        data: years.map(year => {

          const value =
            this.calculateProgressIndicator(
              year,
              categoryIndex,
              indicatorId
            );

          return Number(value.replace('%', '')) || null;

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

          formatter: (value: number) => value + '%'

        }

      },

      legend: {

        position: 'bottom',

        horizontalAlign: 'center'

      },

      dataLabels: {

        enabled: false

      },

      tooltip: {

        y: {
          formatter: (value: number) => value + '%'
        }

      }

    };

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
  getPurchaseFitness(year: number, categoryIndex: number): string {
    let numerator = 0;
    let denominator = 0;
    let hasValidData = false;

    this.sites.controls.forEach(site => {
      const categories = site.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const inputYearRaw = input.get('year')?.value;
        const inputYear =
          inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;

        if (inputYear != year) return;

        const relevance = input.get('relevance')?.value;
        if (relevance != 1) return; // only included relevance

        // const fitnessCost = parseFloat(input.get('fitnessCost')?.value) || 0;
        const fitnessCost = this.parseNumber(input.get('fitnessCost')?.value);

        const purchaseFitnessRaw = input.get('purchaseFitness')?.value || '0';
        // const purchaseFitness = parseFloat(purchaseFitnessRaw.toString().replace('%', '')) || 0;
        const purchaseFitness = this.parseNumber(purchaseFitnessRaw.toString().replace('%', ''));

        if (fitnessCost > 0 && purchaseFitness > 0) {
          numerator += fitnessCost * purchaseFitness;
          denominator += fitnessCost;
          hasValidData = true;
        }
      });
    });

    if (!hasValidData || denominator == 0) return '';
    const avg = Math.round(numerator / denominator);
    return avg + '%';
  }



  getFitnessCost(year: number, categoryIndex: number): string {
    let totalCost = 0;
    let hasValidCost = false;

    this.sites.controls.forEach(site => {
      const categories = site.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        const inputYearRaw = input.get('year')?.value;
        const inputYear =
          inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
        const relevance = input.get('relevance')?.value;

        if (inputYear == year && relevance == 1) {
          const costValue = input.get('fitnessCost')?.value;
          // const cost = parseFloat(costValue);
          const cost = this.parseNumber(costValue);

          if (!isNaN(cost) && cost >= 0) {
            totalCost += cost;
            hasValidCost = true;
          }
        }
      });
    });

    return hasValidCost ? totalCost.toLocaleString() : '';
  }







  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();

  }
  // onCategoryChange(index: number) {
  //   this.selectedCategory = this.be004Tabs[index];
  //   console.log(this.selectedCategory, 'Selected Category');
  // }
  onCategoryChange(index: number) {
    this.selectedCategory = this.be004Tabs[index];
    this.selectedTabIndex = index;
    this.sites.controls.forEach((site, siteIndex) => {
      const categories = site.get('categories') as FormArray;
      if (categories && categories.length > index) {
        site.get('selectedCategoryIndex')?.setValue(index);
      }
    });
    this.cd.detectChanges();
  }


  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [data?.year ? new Date(data?.year, 0, 1) : null, [Validators.required]],
      fitnessCost: [data?.cost || 0],
      relevance: [data?.relevance_id || ''],
      categoryId: [data?.category_id || ''],
      purchaseDoesNotUsePhase: [data?.purchase_does_not_use_phase || false],
      hotspotConducted: [data?.hotspot_conducted || false],
      potentialHotspot: [data?.potential_hotspot || false],
      actualHotspots: [data?.actual_hotspot || false],
      allHighIntensityHotspots: [data?.all_high_intensity_hotspot || false],
      allHotspotsHaveBeenAvoided: [data?.all_hotspot_have_been_avoided || false],
      allHotspotFromCardle: [data?.all_hotspot_from_cradle || false],
      companyContinuously: [data?.company_continuosly || false],
      contextDescription: [data?.context_description || ''],
      purchaseFitness: [data?.purchase_fitness || ''],
      comments: [data?.comments || ''],
    });
  }
  triggerChangeDetection(): void {
    this.cd.detectChanges();
  }

  // getContextDescription(year: number, categoryIndex: number): string {
  //   if (!this.sites?.length) return '';

  //   let latestContext = '';

  //   this.sites.controls.forEach((site: AbstractControl) => {
  //     const categories = site.get('categories') as FormArray;
  //     const categoryGroup = categories.at(categoryIndex) as FormGroup;
  //     if (!categoryGroup) return;

  //     const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs?.length) return;

  //     fitnessInputs.controls.forEach((input: AbstractControl) => {
  //       const yearVal = input.get('year')?.value;
  //       const inputYear =
  //         yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);

  //       if (inputYear == year) {
  //         const contextVal = input.get('contextDescription')?.value?.trim();
  //         if (contextVal) {
  //           latestContext = contextVal;
  //         }
  //       }
  //     });
  //   });

  //   return latestContext || '';
  // }


  getContextDescription(year: number, categoryIndex: number): { purchaseName: string; contextDescription: string }[] {
    if (!this.sites?.length) return [];

    const contextEntries: { purchaseName: string; contextDescription: string }[] = [];

    this.sites.controls.forEach((site: AbstractControl) => {
      const siteGroup = site as FormGroup;
      const purchaseName = siteGroup.get('Purchase')?.value;

      const categories = siteGroup.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {
        const yearVal = input.get('year')?.value;
        const inputYear = yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);
        const contextVal = input.get('contextDescription')?.value?.trim();

        if (inputYear == year && contextVal) {
          contextEntries.push({
            purchaseName,
            contextDescription: contextVal
          });
        }
      });
    });

    return contextEntries;
  }


  public isValidYearShow(value: any): boolean {
    return value instanceof Date && !isNaN((value as Date).getTime());
  }


  removeFitnessInput(siteIndex: number, categoryIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const categories = siteGroup.get('categories') as FormArray;
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
          form: 'be04'
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

  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  getFitnessInputs(site: AbstractControl, categoryIndex: number): FormArray {
    const categories = site.get('categories') as FormArray;
    return categories.at(categoryIndex).get('fitnessInputs') as FormArray;
  }
  isReadOnly(siteIndex: number, inputIndex: number): boolean {
    const fitnessInputs = (this.sites.at(siteIndex).get('fitnessInputs') as FormArray);
    const inputGroup = fitnessInputs.at(inputIndex);
    const relevance = inputGroup.get('relevance')?.value;
    return relevance != undefined && relevance != null && relevance != '' && relevance != 1;
  }

  calculateProgressIndicator(year: number, categoryIndex: number, indicatorId?: number): string {
    let numerator = 0;
    let denominator = 0;
    let hasCost = false;
    let hasIncluded = false;

    this.sites.controls.forEach(site => {
      // const siteCostRaw = (site.get('Cost')?.value || '0').toString().replace(/,/g, '');
      // const siteCost = parseFloat(siteCostRaw) || 0;


      const categories = site.get('categories') as FormArray;
      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach(input => {
        // const siteCost = parseFloat(input.get('fitnessCost')?.value) || 0;
        const siteCost = this.parseNumber(input.get('fitnessCost')?.value);

        if (siteCost > 0) {
          hasCost = true;
        }



        const relevance = input.get('relevance')?.value;

        const inputYearRaw = input.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : +inputYearRaw || 0;

        const inputIndicatorId = input.get('indicatorId')?.value;

        if (relevance == 1 && inputYear == year && (!indicatorId || indicatorId == inputIndicatorId)) {
          hasIncluded = true;

          const purchaseFitnessRaw = input.get('purchaseFitness')?.value ?? '0';
          // const purchaseFitness = parseFloat(
          //   (typeof purchaseFitnessRaw === 'string'
          //     ? purchaseFitnessRaw
          //     : purchaseFitnessRaw + '%'
          //   ).toString().replace('%', '')
          // ) || 0;
          const purchaseFitness = this.parseNumber(
            (typeof purchaseFitnessRaw === 'string'
              ? purchaseFitnessRaw
              : purchaseFitnessRaw + '%'
            ).toString().replace('%', '')
          );


          numerator += siteCost * purchaseFitness;
          denominator += siteCost;

        }
      });
    });

    if (!hasCost) return '';
    if (!hasIncluded) return '';
    if (denominator === 0) return '';
    return Math.round(numerator / denominator) + '%';
  }


  calculateDataCompleteness(year: number, categoryIndex: number, indicatorId?: number): string {
    const selectedYear = year;
    const allRelevanceValues: number[] = [];


    this.sites.controls.forEach(site => {
      const categories = site.get('categories') as FormArray;
      if (!categories || !categories.length) return;

      const categoryGroup = categories.at(categoryIndex) as FormGroup;
      if (!categoryGroup) return;

      const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs || !fitnessInputs.length) return;

      //  Filter relevance values based on year + indicatorId
      fitnessInputs.controls.forEach(input => {
        const inputYearRaw = input.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : Number(inputYearRaw);

        const inputIndicatorId = input.get('indicatorId')?.value;

        if (inputYear == selectedYear && (!indicatorId || indicatorId == inputIndicatorId)) {
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


  toggleIndicators() {
    this.showIndicators = !this.showIndicators;
    this.getlatestYeardata();
    this.cd.detectChanges();

  }

  getlatestYeardata(): void {
    const allYears = this.uniqueYearsFromFitnessInputs; // number[][]
    this.categoryYearsData = allYears.map(yearsArr => ({
      topYear: yearsArr[0] ?? null,
      remainingYears: yearsArr.slice(1),
    }));

    // expand state per category (1D)
    this.showRemaining = this.categoryYearsData.map(() => false);
  }




  hasRemainingYears(catIndex: number): boolean {
    return !!(
      this.categoryYearsData &&
      this.categoryYearsData[catIndex] &&
      this.categoryYearsData[catIndex].remainingYears.length > 0
    );
  }



  onRelevanceChange(siteIndex: number, categoryIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const categories = siteGroup.get('categories') as FormArray;
    const inputs = categories.at(categoryIndex).get('fitnessInputs') as FormArray;
    const yearValue = inputs.at(inputIndex).get('year')?.value;

    let year: number = 0;
    if (yearValue instanceof Date) year = yearValue.getFullYear();
    else year = +yearValue;
    this.disableFieldsByPurchaseType(siteIndex);
    this.calculatePurchaseFitness(siteIndex, categoryIndex, inputIndex);
    this.calculateProgressIndicator(year, siteIndex, categoryIndex);
    this.calculateDataCompleteness(year, categoryIndex, categoryIndex);

    if (year && !isNaN(year)) {
      this.getlatestYeardata();
    }
  }



  ngOnInit() {

    this.sites.controls.forEach((siteGroup, siteIndex) => {


      siteGroup.get('PurchaseType')?.valueChanges.subscribe(() => {
        this.disableFieldsByPurchaseType(siteIndex);
        this.cd.detectChanges();
      });

      const categories = siteGroup.get('categories') as FormArray;

      categories.controls.forEach((categoryGroup, categoryIndex) => {
        const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

        fitnessInputs.controls.forEach((inputGroup, inputIndex) => {
          const yearValue = inputGroup.get('year')?.value;
          let year: number = 0;

          if (yearValue instanceof Date) {
            year = yearValue.getFullYear();
          } else {
            year = +yearValue;
          }

          const indicatorId = inputGroup.get('indicatorId')?.value;

          if (year) {
            this.disableFieldsByPurchaseType(siteIndex);
            this.calculatePurchaseFitness(siteIndex, categoryIndex, inputIndex);
            this.calculateProgressIndicator(year, categoryIndex, indicatorId);
            this.calculateDataCompleteness(year, categoryIndex, indicatorId);
          }
        });
      });


      const purchaseTypeValue = siteGroup.get('PurchaseType')?.value;
      setTimeout(() => {
        if (purchaseTypeValue) {
          this.disableFieldsByPurchaseType(siteIndex);
          this.cd.detectChanges();
        }
      }, 300);
    });


    if (this.be004Tabs && this.be004Tabs.length > 0) {
      this.selectedCategory = this.be004Tabs[0];
    }


    setTimeout(() => {
      this.sites.controls.forEach((_, siteIndex) => {
        this.disableFieldsByPurchaseType(siteIndex);
      });
      this.cd.detectChanges();
    }, 1000);
  }



  disableFieldsByPurchaseType(siteIndex: number) {

    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const purchaseType: string = siteGroup.get('PurchaseType')?.value;

    const disabledFieldsMap: { [key: string]: string[] } = {
      'Product input': ['companyContinuously', 'allHotspotsHaveBeenAvoided'],
      'Outsourced core function': ['allHotspotFromCardle', 'companyContinuously'],
      'Ancillary spend': ['allHotspotsHaveBeenAvoided', 'allHotspotFromCardle']
    };

    const disabledFields = disabledFieldsMap[purchaseType] || [];


    const categories = siteGroup.get('categories') as FormArray;
    categories.controls.forEach((categoryGroup: AbstractControl) => {
      const fitnessInputs = (categoryGroup as FormGroup).get('fitnessInputs') as FormArray;

      fitnessInputs.controls.forEach((inputGroup: AbstractControl) => {
        disabledFields.forEach(field => {
          const ctrl = (inputGroup as FormGroup).get(field);
          if (ctrl) {
            ctrl.disable({ emitEvent: false });
          }
        });
      });
    });
  }


  calculatePurchaseFitness(siteIndex: number, categoryIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const categories = siteGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance: number = inputGroup.get('relevance')?.value;
    const purchaseType: string = siteGroup.get('PurchaseType')?.value;

    this.handlePotentialHotspotDependency(siteIndex, categoryIndex, inputIndex);


    const normalize = (val: any): boolean => {
      if (val === true || val === "Yes" || val === 1 || val === "1") return true;
      return false;
    };

    // Normalize all fields
    const purchaseDoesNotUsePhase = normalize(inputGroup.get('purchaseDoesNotUsePhase')?.value);
    const hotspotConducted = normalize(inputGroup.get('hotspotConducted')?.value);
    const potentialHotspot = normalize(inputGroup.get('potentialHotspot')?.value);
    const actualHotspots = normalize(inputGroup.get('actualHotspots')?.value);
    const allHighIntensityHotspots = normalize(inputGroup.get('allHighIntensityHotspots')?.value);
    const allHotspotsHaveBeenAvoided = normalize(inputGroup.get('allHotspotsHaveBeenAvoided')?.value);
    const allHotspotFromCardle = normalize(inputGroup.get('allHotspotFromCardle')?.value);
    const companyContinuously = normalize(inputGroup.get('companyContinuously')?.value);

    let T9 = 0;

    if (relevance == 1) {
      let countYesGI = 0;
      if (purchaseDoesNotUsePhase) countYesGI++;
      if (hotspotConducted) countYesGI++;
      if (potentialHotspot) countYesGI++;

      T9 = countYesGI < 3 ? 0 : 3;
      if (actualHotspots) T9++;
      if (allHighIntensityHotspots) T9++;

      if (purchaseType == "Outsourced core function" && allHotspotsHaveBeenAvoided) T9++;
      if (purchaseType == "Product input" && allHotspotFromCardle) T9++;
      if (purchaseType == "Ancillary spend" && companyContinuously) T9++;
    }

    let fitness: number | "" = "";

    if (relevance != 1) {
      fitness = "";
      inputGroup.patchValue({
        purchaseDoesNotUsePhase: false,
        hotspotConducted: false,
        potentialHotspot: false,
        actualHotspots: false,
        allHighIntensityHotspots: false,
        allHotspotsHaveBeenAvoided: false,
        allHotspotFromCardle: false,
        companyContinuously: false
      }, { emitEvent: false });
    }
    else if (!potentialHotspot && !(purchaseDoesNotUsePhase && hotspotConducted)) {
      fitness = 0;
    }
    else if (!purchaseDoesNotUsePhase || !hotspotConducted) {
      fitness = 0;
    }
    else {

      if (T9 < 3) fitness = 0;
      else if (T9 == 3) fitness = 25;
      else if (T9 == 4) fitness = 50;
      else if (T9 == 5) fitness = 75;
      else if (T9 == 6) fitness = 100;

      if (purchaseDoesNotUsePhase && hotspotConducted && !potentialHotspot) {
        fitness = 100;
      }
    }

    inputGroup.get('purchaseFitness')?.setValue(fitness != "" ? fitness + "%" : "");
  }

  handlePotentialHotspotDependency(siteIndex: number, categoryIndex: number, inputIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const purchaseType: string = siteGroup.get('PurchaseType')?.value;

    const categories = siteGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const potentialHotspot = inputGroup.get('potentialHotspot')?.value;


    const fields = [
      'actualHotspots',
      'allHighIntensityHotspots',
      'allHotspotsHaveBeenAvoided',
      'allHotspotFromCardle',
      'companyContinuously'
    ];


    const disabledFieldsMap: { [key: string]: string[] } = {
      'Product input': ['companyContinuously', 'allHotspotsHaveBeenAvoided'],
      'Outsourced core function': ['allHotspotFromCardle', 'companyContinuously'],
      'Ancillary spend': ['allHotspotsHaveBeenAvoided', 'allHotspotFromCardle']
    };
    const purchaseTypeDisabled = disabledFieldsMap[purchaseType] || [];

    fields.forEach(field => {
      const ctrl = inputGroup.get(field);
      if (!ctrl) return;

      if (!potentialHotspot) {
        ctrl.setValue(null, { emitEvent: false });
        ctrl.disable({ emitEvent: false });
      } else {

        if (!purchaseTypeDisabled.includes(field)) {
          ctrl.enable({ emitEvent: false });
        }
      }
    });
  }
  hasCategoryData(categoryId: number | undefined): boolean {
    if (!this.categoryYearsData || !this.be004Tabs) return false;

    const index = this.be004Tabs.findIndex((tab: any) => tab.id == categoryId);
    if (index == -1) return false;

    return !!this.categoryYearsData[index]?.topYear;
  }




  openHelpDialog(criteria: string, notes: string): void {
    this.dialog.open(HelpDialogComponent, {
      width: '500px',
      data: { criteria, notes }
    });
  }




  get sites(): FormArray {

    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }


  _oldsetYear(event: any, datepicker: any, siteIndex: number, categoryIndex: number, inputIndex: number): void {
    let selectedYear: number;

    if (event && typeof event.year === 'function') {
      selectedYear = event.year(); // moment.js object
    } else if (typeof event === 'number') {
      selectedYear = event;
    } else if (event instanceof Date) {
      selectedYear = event.getFullYear();
    } else {
      console.error('Unexpected yearSelected event value:', event);
      return;
    }

    // const siteGroup = this.sites.at(siteIndex) as FormGroup;
    // const categories = siteGroup.get('categories') as FormArray;
    // const categoryGroup = categories.at(categoryIndex) as FormGroup;
    // const inputs = categoryGroup.get('fitnessInputs') as FormArray;




    const siteGroup = this.sites.at(siteIndex) as FormGroup;

    const categories = siteGroup.get('categories') as FormArray;

    const categoryGroup = categories.at(categoryIndex) as FormGroup;


    // const fitnessInputs = categories.at(categoryIndex).get('fitnessInputs') as FormArray;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;

    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    //  Check duplicate year only inside this category
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
      datepicker?.close?.();
      return;
    }

    //  Set selected year
    inputGroup.get('year')?.setValue(new Date(selectedYear, 0, 1));
    inputGroup.get('year')?.setValue('2058');
    inputGroup.get('year')?.updateValueAndValidity();

    // If you want global validation or recalculation
    // this.calculateDataCompleteness(selectedYear);
    // console.log(this.sites.at(siteIndex) as FormGroup, 'sitegroup')
  }
  setYear(event: any, datepicker: any, siteIndex: number, categoryIndex: number, inputIndex: number): void {
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

    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const categories = siteGroup.get('categories') as FormArray;
    const categoryGroup = categories.at(categoryIndex) as FormGroup;
    const fitnessInputs = categoryGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    if (!inputGroup) return;

    const isDuplicate = fitnessInputs.controls.some((input, idx) => {
      if (idx == inputIndex) return false;
      const yearVal = input.get('year')?.value;
      const existingYear =
        yearVal instanceof Date ? yearVal.getFullYear() :
          typeof yearVal === 'number' ? yearVal : null;
      return existingYear == selectedYear;
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

    const yearMap = siteGroup.get('employeeYearMap')?.value || {};
    const matchedCost = yearMap[selectedYear];

    if (matchedCost != null && matchedCost != undefined) {
      inputGroup.get('fitnessCost')?.setValue(matchedCost);
      this.formatCalculatedFitnessFields(inputGroup);

    } else {
      inputGroup.get('fitnessCost')?.reset();
    }

    this.calculatePurchaseFitness(siteIndex, categoryIndex, inputIndex);
    datepicker?.close?.();
    this.getlatestYeardata();
  }



  onYearTyped(event: Event, siteIndex: number, categoryIndex: number, inputIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      const numericYear = parseInt(value, 10);
      this.setYear(numericYear, null, siteIndex, categoryIndex, inputIndex);
    }
  }





  get uniqueYearsFromFitnessInputs(): number[][] {

    const numCategories =
      this.be004Tabs?.length ??
      (((this.sites.at(0)?.get('categories') as FormArray)?.length) || 0);


    const categoryYearSets: Array<Set<number>> =
      Array.from({ length: numCategories }, () => new Set<number>());

    this.sites.controls.forEach(site => {
      const categories = site.get('categories') as FormArray;
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





  // parseNumber(val: any): number {
  //   return Number(val?.toString().replace(/,/g, '')) || 0;
  // }
  parseNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(val.toString().replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }
  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  }

  private formatCalculatedFitnessFields(inputGroup: FormGroup): void {
    const fieldNames = ['fitnessCost'];
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
    this.formSubmittedFlag = true;
    const valuesArray = this.parentForm.get(this.arrayName) as FormArray;

    valuesArray.controls.forEach(valueGroup => {
      valueGroup.markAllAsTouched();
    });

    this.loading = true;
    const filteredValues = valuesArray.value
      .map((valueGroup: any) => {
        const validCategories: any[] = [];

        valueGroup.categories.forEach((category: any) => {
          const validFitnessInputs = category.fitnessInputs

            .filter((f: any) => {
              const relevance = f.relevance;
              const year = f.year;
              const isValidYear =
                (year instanceof Date && !isNaN(year.getTime())) ||
                (typeof year == 'number' && String(year).length == 4);
              const hasRelevance =
                relevance != null &&
                relevance != undefined &&
                String(relevance).trim() != '';
              return hasRelevance && isValidYear;
            })

            .map((f: any) => {

              let onlyYear = f.year;
              if (f.year instanceof Date) {
                onlyYear = f.year.getFullYear();
              }
              return { ...f, year: onlyYear };
            });

          if (validFitnessInputs.length > 0) {
            validCategories.push({
              // ...category,
              categoryId: category.categoryId,
              categoryName: category.categoryName,

              // fitnessInputs: validFitnessInputs
              fitnessInputs: validFitnessInputs.map((f: any) => ({
                ...f,
                fitnessCost: this.parseNumber(f.fitnessCost)
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


    const progressIndicators: any[] = [];

    this.uniqueYearsFromFitnessInputs.forEach((yearsArr, categoryIndex) => {
      yearsArr.forEach(year => {
        const score = this.calculateProgressIndicator(year, categoryIndex);

        const firstSite = this.sites.at(0) as FormGroup;
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

      value: filteredValues.map((site: any) => ({

        purchase: site.Purchase,
        purchase_id: site.id,
        purchase_information_id: site.Purchase_information_id,
        cost: site.Cost,
        purchase_type: site.PurchaseType,
        be04_data: site.categories.map((cat: any) => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          fitnessInputs: cat.fitnessInputs
        }))
      })),
      progress_indicators: progressIndicators,
      fit_entry_id: this.fitEntryId,
      goalCode_id: goalCodeId,
    };


    //console.log(" BE Form Submitted:", formData);

    this.commonService.addData('be-form/submit/be04', formData).subscribe(
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
      },
      (error) => {
        this.loading = false;
        console.error(" Error submitting form:", error);
      }
    );
  }



}