import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-be09-form',
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
  templateUrl: './be09-form.component.html',
  styleUrl: './be09-form.component.scss'
})
export class Be09FormComponent implements OnInit, OnChanges, AfterViewInit {
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
  activeTab: 'progress' | 'context' = 'progress';
  contextUnit: string = '';

  constructor(private globalFlagService: GlobalFlagService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private commonService: CommonService, private _snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, private dialog: MatDialog) {
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
  get formArray(): FormArray {
    return this.parentForm.get(this.arrayName) as FormArray;
  }

  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }
  ngAfterViewInit() {
    // Initial bind after view is ready
    setTimeout(() => this.setupBE09Listeners(), 0);

    // Agar dynamic form me controls add ho rahe hain to dobara bind karo
    this.sites.valueChanges.subscribe(() => {
      setTimeout(() => this.setupBE09Listeners(), 0);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['parentForm'] || changes['fitEntryId']) {
      setTimeout(() => {
        this.setupBE09Listeners();
      }, 0);
    }
  }
  getContextDescription(year: number): { siteName: string; contextDescription: string }[] {

    if (!this.sites?.length) return [];

    const entries: any[] = [];

    this.sites.controls.forEach((site: AbstractControl) => {
      const siteGroup = site as FormGroup;
      const siteName = siteGroup.get('siteName')?.value;

      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs?.length) return;

      fitnessInputs.controls.forEach((input: AbstractControl) => {

        const yearVal = input.get('year')?.value;
        const inputYear =
          yearVal instanceof Date ? yearVal.getFullYear() : Number(yearVal);

        const desc = input.get('contextDescription')?.value?.trim();

        if (inputYear == year && desc) {
          entries.push({
            siteName,
            contextDescription: desc
          });
        }
      });
    });

    return entries;
  }





  ngOnInit() {
    //  alert("ngOnInit")
    //this.setupBE09Listeners();
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

    const progress = years.map(year => {
      const value = this.calculateProgressIndicator(year);
      return value ? Number(value.replace('%', '')) : null;
    });

    const affectedCommunities = years.map(year =>
      Number(this.calculateContextIndicator(0, year))
    );

    const communitiesAtRisk = years.map(year =>
      Number(this.calculateContextIndicator(1, year))
    );

    this.chartOptions = {

      series: [

        {
          name: 'Affected Communities Identified',
          type: 'column',
          data: affectedCommunities,
          color: '#42A5F5'
        },

        {
          name: 'Communities at Risk',
          type: 'column',
          data: communitiesAtRisk,
          color: '#66BB6A'
        },

        {
          name: 'Site Fitness',
          type: 'line',
          data: progress,
          color: '#E53935'
        }

      ],

      chart: {
        type: 'line',
        height: 430,
        toolbar: {
          show: false
        }
      },

      stroke: {
        width: [0, 0, 3]
      },

      markers: {
        size: [0, 0, 4]
      },

      plotOptions: {
        bar: {
          columnWidth: '40%'
        }
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
          tickAmount: 5,

          title: {
            text: 'Progress Indicator (%)'
          },

          labels: {
            formatter: (value: number) => value + '%'
          }
        },

        {
          opposite: true,

          title: {
            text: 'Communities'
          }
        }

      ],

      tooltip: {

        shared: true,

        y: {
          formatter: (value: number, opts: any) => {

            if (opts.seriesIndex === 2) {
              return value + '%';
            }

            return value.toString();

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

    // return Array.from(yearsSet).sort();
    return Array.from(yearsSet).sort((a, b) => b - a);
  }
  // calculateDataCompleteness(year: number): string {
  //   const selectedYear = year;

  //   for (let i = this.sites.length - 1; i >= 0; i--) {
  //     const site = this.sites.at(i);
  //     const fitnessInputs = site.get('fitnessInputs') as FormArray;

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
  //       if (hasIncluded && relevanceValues.every(val => val === 1)) {
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


  setupBE09Listeners1(): void {
    this.sites.controls.forEach((siteGroup, siteIndex) => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach((inputGroup: AbstractControl, inputIndex: number) => {
        const group = inputGroup as FormGroup;

        const checkboxFields = [
          'assessment_conducted',
          'affected_communities_identified',
          'communities_at_risk',
          'mechanism_inclusive',
          'stakeholders_involved_in_mechanism_design',
          'concerns_resolved_timely',
          'info_accessible',
          'info_communicated',
          'appropriate_communication_channels',
          'responsible_party_assigned',
          'access_to_neutral_advice',
          'users_informed',
          'complaint_publicly_viewable',
          'user_feedback_collected',
          'performance_monitored',
          'improvements_implemented',
          'community_consultation_prior_activities'
        ];

        const conditionalFields = [
          'stakeholders_involved_in_mechanism_design',
          'info_communicated',
          'appropriate_communication_channels',
          'community_consultation_prior_activities'
        ];

        // Conditional fields disable initially
        conditionalFields.forEach(field => {
          group.get(field)?.disable({ emitEvent: false });
        });

        // Bind "communities_at_risk" listener only once
        const communitiesAtRiskControl = group.get('communities_at_risk');
        if (communitiesAtRiskControl && !(communitiesAtRiskControl as any).__subscribed) {
          (communitiesAtRiskControl as any).__subscribed = true;
          communitiesAtRiskControl.valueChanges.subscribe(value => {
            const isSelected = value === true || value === 1 || value === '1';
            conditionalFields.forEach(field => {
              const ctrl = group.get(field);
              if (ctrl) {
                if (isSelected) {
                  ctrl.enable({ emitEvent: false });
                } else {
                  ctrl.setValue(false, { emitEvent: false });
                  ctrl.disable({ emitEvent: false });
                }
              }
            });
          });

        }

        // Bind checkbox listeners only once
        checkboxFields.forEach(field => {
          const control = group.get(field);
          if (control && !(control as any).__subscribed) {
            (control as any).__subscribed = true;
            control.valueChanges.subscribe(() => {
              const inputYearRaw = group.get('year')?.value;
              const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;

              this.calculateSiteFitness(siteIndex, inputIndex);
              this.calculateProgressIndicator(year);
            });
          }
        });

        // Bind relevance change listener only once
        const relevanceControl = group.get('relevance');
        if (relevanceControl && !(relevanceControl as any).__subscribed) {
          (relevanceControl as any).__subscribed = true;
          relevanceControl.valueChanges.subscribe(relevance => {
            checkboxFields.forEach(field => {
              const ctrl = group.get(field);
              ctrl?.setValue(false, { emitEvent: false });
              ctrl?.disable({ emitEvent: false });
            });

            if (relevance == 1) {
              checkboxFields.forEach(field => {
                if (!conditionalFields.includes(field)) group.get(field)?.enable({ emitEvent: false });
              });
              if (group.get('communities_at_risk')?.value == true) {
                conditionalFields.forEach(field => group.get(field)?.enable({ emitEvent: false }));
              }
            }

            const inputYearRaw = group.get('year')?.value;
            const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
            this.calculateSiteFitness(siteIndex, inputIndex);
            this.calculateProgressIndicator(year);
          });
        }
      });
    });
  }
  //  setupBE09Listeners(): void {
  //   this.sites.controls.forEach((siteGroup, siteIndex) => {
  //     const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs) return;

  //     fitnessInputs.controls.forEach((inputGroup: AbstractControl, inputIndex: number) => {
  //       const group = inputGroup as FormGroup;

  //       const checkboxFields = [
  //         'assessment_conducted',
  //         'affected_communities_identified',
  //         'communities_at_risk',
  //         'mechanism_inclusive',
  //         'stakeholders_involved_in_mechanism_design',
  //         'concerns_resolved_timely',
  //         'info_accessible',
  //         'info_communicated',
  //         'appropriate_communication_channels',
  //         'responsible_party_assigned',
  //         'access_to_neutral_advice',
  //         'users_informed',
  //         'complaint_publicly_viewable',
  //         'user_feedback_collected',
  //         'performance_monitored',
  //         'improvements_implemented',
  //         'community_consultation_prior_activities'
  //       ];

  //       const conditionalFields = [
  //         'stakeholders_involved_in_mechanism_design',
  //         'info_communicated',
  //         'appropriate_communication_channels',
  //         'community_consultation_prior_activities'
  //       ];

  //       // Conditional fields disable initially
  //       conditionalFields.forEach(field => {
  //         group.get(field)?.disable({ emitEvent: false });
  //       });

  //       // Function to handle conditional enable/disable
  //       const applyConditionalState = (value: any) => {
  //         const relevanceVal = group.get('relevance')?.value;
  //         conditionalFields.forEach(field => {
  //           const ctrl = group.get(field);
  //           if (!ctrl) return;

  //           if (relevanceVal == 1 && value) {
  //             ctrl.enable({ emitEvent: false });
  //           } else {
  //             ctrl.setValue(false, { emitEvent: false });
  //             ctrl.disable({ emitEvent: false });
  //           }
  //         });
  //       };

  //       // Bind "communities_at_risk" listener only once
  //       const communitiesAtRiskControl = group.get('communities_at_risk');
  //       if (communitiesAtRiskControl && !(communitiesAtRiskControl as any).__subscribed) {
  //         (communitiesAtRiskControl as any).__subscribed = true;
  //         communitiesAtRiskControl.valueChanges.subscribe(value => {
  //           applyConditionalState(value);
  //         });
  //         // Initial check
  //         applyConditionalState(communitiesAtRiskControl.value);
  //       }

  //       // Bind checkbox listeners only once
  //       checkboxFields.forEach(field => {
  //         const control = group.get(field);
  //         if (control && !(control as any).__subscribed) {
  //           (control as any).__subscribed = true;
  //           control.valueChanges.subscribe(() => {
  //             const inputYearRaw = group.get('year')?.value;
  //             const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
  //             this.calculateSiteFitness(siteIndex, inputIndex);
  //             this.calculateProgressIndicator(year);
  //           });
  //         }
  //       });

  //       // Bind relevance change listener only once
  //       const relevanceControl = group.get('relevance');
  //       if (relevanceControl && !(relevanceControl as any).__subscribed) {
  //         (relevanceControl as any).__subscribed = true;
  //         relevanceControl.valueChanges.subscribe(relevance => {
  //           // First disable everything
  //           checkboxFields.forEach(field => {
  //             const ctrl = group.get(field);
  //             ctrl?.setValue(false, { emitEvent: false });
  //             ctrl?.disable({ emitEvent: false });
  //           });

  //           if (relevance == 1) {
  //             // Enable non-conditional fields
  //             checkboxFields.forEach(field => {
  //               if (!conditionalFields.includes(field)) group.get(field)?.enable({ emitEvent: false });
  //             });
  //             // Apply communities_at_risk dependent logic
  //             applyConditionalState(group.get('communities_at_risk')?.value);
  //           }

  //           const inputYearRaw = group.get('year')?.value;
  //           const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
  //           this.calculateSiteFitness(siteIndex, inputIndex);
  //           this.calculateProgressIndicator(year);
  //         });
  //       }
  //     });
  //   });
  // }
  setupBE09Listeners(): void {
    this.sites.controls.forEach((siteGroup, siteIndex) => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach((inputGroup: AbstractControl, inputIndex: number) => {
        const group = inputGroup as FormGroup;

        const checkboxFields = [
          'assessment_conducted',
          'affected_communities_identified',
          'communities_at_risk',
          'mechanism_inclusive',
          'stakeholders_involved_in_mechanism_design',
          'concerns_resolved_timely',
          'info_accessible',
          'info_communicated',
          'appropriate_communication_channels',
          'responsible_party_assigned',
          'access_to_neutral_advice',
          'users_informed',
          'complaint_publicly_viewable',
          'user_feedback_collected',
          'performance_monitored',
          'improvements_implemented',
          'community_consultation_prior_activities'
        ];

        const conditionalFields = [
          'stakeholders_involved_in_mechanism_design',
          'info_communicated',
          'appropriate_communication_channels',
          'community_consultation_prior_activities'
        ];

        const isTruthy = (v: any) =>
          v === true || v === 1 || v === '1' || v === 'true' || v === 'Yes';

        // ---- helpers ----
        const applyConditionalState = (communitiesAtRiskVal: any) => {
          const relevanceVal = group.get('relevance')?.value;
          conditionalFields.forEach(field => {
            const ctrl = group.get(field);
            if (!ctrl) return;

            if (relevanceVal == 1 && isTruthy(communitiesAtRiskVal)) {
              ctrl.enable({ emitEvent: false });
            } else {
              ctrl.setValue(false, { emitEvent: false });
              ctrl.disable({ emitEvent: false });
            }
          });
        };

        const applyBaseStateForRelevance = (relevanceVal: any) => {
          checkboxFields.forEach(field => {
            const ctrl = group.get(field);
            if (!ctrl) return;

            if (relevanceVal == 1) {
              // non-conditional fields enable
              if (!conditionalFields.includes(field)) {
                ctrl.enable({ emitEvent: false });
              }
            } else {
              // relevance off => sab disable + uncheck
              ctrl.setValue(false, { emitEvent: false });
              ctrl.disable({ emitEvent: false });
            }
          });

          // Conditional fields ka state communities_at_risk par depend karta hai:
          applyConditionalState(group.get('communities_at_risk')?.value);
        };

        // ---- INIT (run once per inputGroup) ----
        if (!(group as any).__be09InitDone) {
          (group as any).__be09InitDone = true;

          // initial: conditional ko disable, par sirf first time
          conditionalFields.forEach(field => {
            group.get(field)?.disable({ emitEvent: false });
          });

          // initial relevance-based base state
          applyBaseStateForRelevance(group.get('relevance')?.value);
        }

        // ---- LISTENERS (bind once) ----
        // communities_at_risk
        const communitiesAtRiskControl = group.get('communities_at_risk');
        if (communitiesAtRiskControl && !(communitiesAtRiskControl as any).__subscribed) {
          (communitiesAtRiskControl as any).__subscribed = true;
          communitiesAtRiskControl.valueChanges.subscribe(val => {
            applyConditionalState(val);

            // calculations (year-aware)
            const inputYearRaw = group.get('year')?.value;
            const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
            this.calculateSiteFitness(siteIndex, inputIndex);
            this.calculateProgressIndicator(year);
          });
        }


        checkboxFields.forEach(field => {
          const control = group.get(field);
          if (control && !(control as any).__subscribed) {
            (control as any).__subscribed = true;
            control.valueChanges.subscribe(() => {
              const inputYearRaw = group.get('year')?.value;
              const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
              this.calculateSiteFitness(siteIndex, inputIndex);
              this.calculateProgressIndicator(year);
            });
          }
        });

        // relevance
        const relevanceControl = group.get('relevance');
        if (relevanceControl && !(relevanceControl as any).__subscribed) {
          (relevanceControl as any).__subscribed = true;
          relevanceControl.valueChanges.subscribe(relevanceVal => {
            applyBaseStateForRelevance(relevanceVal);

            const inputYearRaw = group.get('year')?.value;
            const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
            this.calculateSiteFitness(siteIndex, inputIndex);
            this.calculateProgressIndicator(year);
          });
        }

        // ---- initial calculations ----
        const inputYearRaw = group.get('year')?.value;
        const year = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;
        this.calculateSiteFitness(siteIndex, inputIndex);
        this.calculateProgressIndicator(year);
      });
    });
  }








  calculateBE09DataCompleteness(): string {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    const relevanceValues: number[] = siteArray.controls.map(siteGroup =>
      siteGroup.get('relevance')?.value
    );
    const includedCount = relevanceValues.filter(val => val === 1).length;
    const insufficientDataCount = relevanceValues.filter(val => val === 3).length;
    const otherExcludedCount = relevanceValues.filter(val => val === 4).length;
    if (includedCount === 0) {
      return '';
    } else if (insufficientDataCount > 0) {
      return 'Calculation based on incomplete data';
    } else if (otherExcludedCount > 0) {
      return 'Calculation may be based on incomplete data';
    } else {
      return 'Calculation based on complete data';
    }
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



  // calculateSiteFitness(index: number) {
  //   const siteGroup = this.sites.at(index);
  //   const relevance = siteGroup.get('relevance')?.value;

  //   const setValue = (val: any) =>
  //     siteGroup.get('site_fitness_percentage')?.setValue(val, { emitEvent: false });

  //   if (relevance != 1) {
  //     setValue('');
  //     return;
  //   }

  //   const isYes = (val: any): boolean =>
  //     val === true || val === "Yes" || val === 1;
  //   const scoringTable = [0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];

  //   const G = isYes(siteGroup.get('affected_communities_identified')?.value);
  //   const H = isYes(siteGroup.get('communities_at_risk')?.value);
  //   const I = isYes(siteGroup.get('mechanism_inclusive')?.value);
  //   const J = isYes(siteGroup.get('stakeholders_involved_in_mechanism_design')?.value);
  //   const K = isYes(siteGroup.get('concerns_resolved_timely')?.value);
  //   const L = isYes(siteGroup.get('info_accessible')?.value);
  //   const M = isYes(siteGroup.get('info_communicated')?.value);
  //   const N = isYes(siteGroup.get('appropriate_communication_channels')?.value);
  //   const O = isYes(siteGroup.get('responsible_party_assigned')?.value);
  //   const P = isYes(siteGroup.get('access_to_neutral_advice')?.value);
  //   const Q = isYes(siteGroup.get('users_informed')?.value);
  //   const R = isYes(siteGroup.get('complaint_publicly_viewable')?.value);
  //   const S = isYes(siteGroup.get('user_feedback_collected')?.value);
  //   const T = isYes(siteGroup.get('performance_monitored')?.value);
  //   const U = isYes(siteGroup.get('improvements_implemented')?.value);
  //   const V = isYes(siteGroup.get('community_consultation_prior_activities')?.value);


  //   const AA = (!H && I && K) ? 1 : 0;

  //   const AB =
  //     (L ? 1 : 0) +
  //     (O ? 1 : 0) +
  //     (P ? 1 : 0) +
  //     ((Q && R) ? 1 : 0) +
  //     ((S && T && U) ? 1 : 0) +
  //     1;

  //   const AC = AB >= 0 ? scoringTable[Math.min(AB, scoringTable.length - 1)] : 0;
  //   const AD = AA ? (AC * AA) : 0;


  //   const AE = (H && I && J && K) ? 1 : 0;

  //   const AF =
  //     ((L && M && N) ? 1 : 0) +
  //     (O ? 1 : 0) +
  //     (P ? 1 : 0) +
  //     ((Q && R) ? 1 : 0) +
  //     ((S && T && U) ? 1 : 0) +
  //     (V ? 1 : 0);

  //   const AG = AF >= 0 ? scoringTable[Math.min(AF, scoringTable.length - 1)] : 0;
  //   const AH = AE ? (AE * AG) : 0;


  //   let finalScore: number | null = null;
  //   if (G && !H) {
  //     finalScore = AD;
  //   } else if (G && H) {
  //     finalScore = AH;
  //   }

  //   const percentage = finalScore !== null ? Math.round(finalScore * 100) + '%' : '';
  //   setValue(percentage);
  //   this.calculateBE09DataCompleteness()
  // }
  calculateSiteFitness1(index: number, inputIndex: number): void {
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;
    // console.log(inputGroup.value, 'inputGroup.value');

    const relevance = inputGroup.get('relevance')?.value;

    const setValue = (val: any) =>
      inputGroup.get('site_fitness_percentage')?.setValue(val, { emitEvent: false });

    if (relevance != 1) {
      setValue('');
      return;
    }

    const isYes = (val: any): boolean =>
      val === true || val === 'Yes' || val === 1;

    const scoringTable = [0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];

    const G = isYes(inputGroup.get('affected_communities_identified')?.value);
    const H = isYes(inputGroup.get('communities_at_risk')?.value);
    const I = isYes(inputGroup.get('mechanism_inclusive')?.value);
    const J = isYes(inputGroup.get('stakeholders_involved_in_mechanism_design')?.value);
    const K = isYes(inputGroup.get('concerns_resolved_timely')?.value);
    const L = isYes(inputGroup.get('info_accessible')?.value);
    const M = isYes(inputGroup.get('info_communicated')?.value);
    const N = isYes(inputGroup.get('appropriate_communication_channels')?.value);
    const O = isYes(inputGroup.get('responsible_party_assigned')?.value);
    const P = isYes(inputGroup.get('access_to_neutral_advice')?.value);
    const Q = isYes(inputGroup.get('users_informed')?.value);
    const R = isYes(inputGroup.get('complaint_publicly_viewable')?.value);
    const S = isYes(inputGroup.get('user_feedback_collected')?.value);
    const T = isYes(inputGroup.get('performance_monitored')?.value);
    const U = isYes(inputGroup.get('improvements_implemented')?.value);
    const V = isYes(inputGroup.get('community_consultation_prior_activities')?.value);

    const AA = (!H && I && K) ? 1 : 0;

    const AB =
      (L ? 1 : 0) +
      (O ? 1 : 0) +
      (P ? 1 : 0) +
      ((Q && R) ? 1 : 0) +
      ((S && T && U) ? 1 : 0) +
      1;

    const AC = scoringTable[Math.min(AB, scoringTable.length - 1)];
    const AD = AA ? (AC * AA) : 0;

    const AE = (H && I && J && K) ? 1 : 0;

    const AF =
      ((L && M && N) ? 1 : 0) +
      (O ? 1 : 0) +
      (P ? 1 : 0) +
      ((Q && R) ? 1 : 0) +
      ((S && T && U) ? 1 : 0) +
      (V ? 1 : 0);

    const AG = scoringTable[Math.min(AF, scoringTable.length - 1)];
    const AH = AE ? (AE * AG) : 0;

    let finalScore: number | null = null;
    if (G && !H) {
      finalScore = AD;
    } else if (G && H) {
      finalScore = AH;
    }

    const percentage = finalScore !== null ? Math.round(finalScore * 100) + '%' : '';
    setValue(percentage);

    // Trigger completeness update
    this.calculateBE09DataCompleteness();
  }
  calculateSiteFitness(index: number, inputIndex: number): void {
    // alert("ok")
    const siteGroup = this.sites.at(index);
    const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
    const inputGroup = fitnessInputs.at(inputIndex) as FormGroup;

    const relevance = inputGroup.get('relevance')?.value;

    const setValue = (val: any) =>
      inputGroup.get('site_fitness_percentage')?.setValue(val, { emitEvent: false });
    const inputYearRaw = inputGroup.get('year')?.value;
    const inputYear = inputYearRaw instanceof Date ? inputYearRaw.getFullYear() : +inputYearRaw || 0;

    if (relevance != 1) {
      setValue('');
      return;
    }

    const isYes = (val: any): boolean =>
      val === true || val === 'Yes' || val === 1;

    const scoringTable = [0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];

    const G = isYes(inputGroup.get('affected_communities_identified')?.value);
    const H = isYes(inputGroup.get('communities_at_risk')?.value);
    const I = isYes(inputGroup.get('mechanism_inclusive')?.value);
    const J = isYes(inputGroup.get('stakeholders_involved_in_mechanism_design')?.value);
    const K = isYes(inputGroup.get('concerns_resolved_timely')?.value);
    const L = isYes(inputGroup.get('info_accessible')?.value);
    const M = isYes(inputGroup.get('info_communicated')?.value);
    const N = isYes(inputGroup.get('appropriate_communication_channels')?.value);
    const O = isYes(inputGroup.get('responsible_party_assigned')?.value);
    const P = isYes(inputGroup.get('access_to_neutral_advice')?.value);
    const Q = isYes(inputGroup.get('users_informed')?.value);
    const R = isYes(inputGroup.get('complaint_publicly_viewable')?.value);
    const S = isYes(inputGroup.get('user_feedback_collected')?.value);
    const T = isYes(inputGroup.get('performance_monitored')?.value);
    const U = isYes(inputGroup.get('improvements_implemented')?.value);
    const V = isYes(inputGroup.get('community_consultation_prior_activities')?.value);

    const AA = (!H && I && K) ? 1 : 0;

    const AB =
      (L ? 1 : 0) +
      (O ? 1 : 0) +
      (P ? 1 : 0) +
      ((Q && R) ? 1 : 0) +
      ((S && T && U) ? 1 : 0) +
      1;

    const AB_Safe = Math.min(AB, scoringTable.length - 1);
    const AC = scoringTable[AB_Safe];
    const AD = AA ? (AC * AA) : 0;

    const AE = (H && I && J && K) ? 1 : 0;

    const AF =
      ((L && M && N) ? 1 : 0) +
      (O ? 1 : 0) +
      (P ? 1 : 0) +
      ((Q && R) ? 1 : 0) +
      ((S && T && U) ? 1 : 0) +
      (V ? 1 : 0);

    const AF_Safe = Math.min(AF, scoringTable.length - 1);
    const AG = scoringTable[AF_Safe];
    const AH = AE ? (AE * AG) : 0;

    let finalScore: number | null = null;
    if (G && !H) {
      finalScore = AD;
    } else if (G && H) {
      finalScore = AH;
    }
    const percentage = finalScore !== null ? `${Math.round(finalScore * 100)}%` : '';
    setValue(percentage);

    this.calculateDataCompleteness(inputYear);
  }








  getRelevanceNameById(id: number): string {
    const match = this.relevantsArr.find((opt: { id: number, name: string }) => opt.id === id);
    return match ? match.name : 'Not set';
  }
  // calculateProgressIndicator(): string {
  //   const validSites = this.sites.controls.filter(site =>
  //     site.get('relevance')?.value == 1 &&
  //     site.get('affected_communities_identified')?.value == true
  //   );
  //   const denominator = validSites.length;
  //   if (denominator === 0) return '';
  //   let numerator = 0;
  //   validSites.forEach(site => {
  //     const siteFitnessString = site.get('site_fitness_percentage')?.value || '0%';
  //     const siteFitness = parseFloat(siteFitnessString.replace('%', '')) || 0;
  //     numerator += siteFitness;
  //   });

  //   const result = numerator / denominator;
  //   return Math.round(result) + '%';
  // }
  calculateProgressIndicator1(): string {
    let numerator = 0;
    let denominator = 0;

    this.sites.controls.forEach(siteGroup => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;
        const affected = inputGroup.get('affected_communities_identified')?.value;

        if (relevance == 1 && affected == 1) {
          const fitnessString = inputGroup.get('site_fitness_percentage')?.value || '0%';
          const fitness = parseFloat(fitnessString.replace('%', '')) || 0;

          numerator += fitness;
          denominator++;
        }
      });
    });

    if (denominator === 0) return '';
    const result = numerator / denominator;

    return Math.round(result) + '%';
  }

  // new
  //   calculateProgressIndicator(): string {
  //   let numerator = 0;
  //   let denominator = 0;

  //   this.sites.controls.forEach(siteGroup => {
  //     const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs) return;

  //     fitnessInputs.controls.forEach(inputGroup => {
  //       const relevance = inputGroup.get('relevance')?.value;
  //       const affected = inputGroup.get('affected_communities_identified')?.value;

  //       if (relevance == 1 && affected==1) {
  //         const fitnessString = inputGroup.get('site_fitness_percentage')?.value || '0%';
  //         const fitness = parseFloat(fitnessString.replace('%', '')) || 0;

  //         numerator += fitness;
  //         denominator++;
  //       }
  //     });
  //   });

  //   if (denominator === 0) return '';
  //   const result = numerator / denominator;
  //   return Math.round(result) + '%';
  // }



  // calculateContextIndicator(index: number): number {
  //   const includedSites = this.sites.controls.filter(
  //     site => site.get('relevance')?.value == 1
  //   );

  //   const isTruthy = (val: any) => val === true || val === 'true' || val === 'Yes';
  //   if (index === 0) {
  //     return includedSites.filter(site =>
  //       isTruthy(site.get('affected_communities_identified')?.value)
  //     ).length;
  //   }
  //   if (index === 1) {
  //     return includedSites.filter(site =>
  //       isTruthy(site.get('communities_at_risk')?.value)
  //     ).length;
  //   }

  //   return 0;
  // }

  calculateProgressIndicator(year: number): string {
    let numerator = 0;
    let denominator = 0;

    this.sites.controls.forEach(siteGroup => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = inputGroup.get('relevance')?.value;
        const affected = inputGroup.get('affected_communities_identified')?.value;

        // Year handling
        const inputYearRaw = inputGroup.get('year')?.value;
        const inputYear = inputYearRaw instanceof Date
          ? inputYearRaw.getFullYear()
          : +inputYearRaw || 0;

        if (relevance == 1 && affected == 1 && inputYear === year) {
          const fitnessString = inputGroup.get('site_fitness_percentage')?.value || '0%';
          const fitness = parseFloat(fitnessString.toString().replace('%', '')) || 0;

          numerator += fitness;
          denominator++;
        }
      });
    });

    if (denominator === 0) return '';
    const result = numerator / denominator;
    return Math.round(result) + '%';
  }


  // calculateContextIndicator(index: number): number {
  //   let count = 0;

  //   const isTruthy = (val: any) => val === true || val === 'true' || val === 'Yes';

  //   this.sites.controls.forEach(siteGroup => {
  //     const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
  //     if (!fitnessInputs) return;

  //     fitnessInputs.controls.forEach(inputGroup => {
  //       const relevance = inputGroup.get('relevance')?.value;
  //       if (relevance != 1) return;

  //       if (index === 0 && isTruthy(inputGroup.get('affected_communities_identified')?.value)) {
  //         count++;
  //       }

  //       if (index === 1 && isTruthy(inputGroup.get('communities_at_risk')?.value)) {
  //         count++;
  //       }
  //     });
  //   });

  //   return count;
  // }
  calculateContextIndicator(index: number, year: number | null): number | string {
    let count = 0;

    //const isTruthy = (val: any) => val === true || val === 'true' || val === 'Yes';
    const isTruthy = (val: any): boolean => {
      if (val === true || val == 1 || val == '1') return true;
      if (typeof val == 'string' && val.toLowerCase() == 'true') return true;
      if (typeof val == 'string' && val.toLowerCase() == 'yes') return true;
      return false;
    };

    this.sites.controls.forEach(siteGroup => {
      const fitnessInputs = siteGroup.get('fitnessInputs') as FormArray;
      if (!fitnessInputs) return;

      fitnessInputs.controls.forEach(inputGroup => {
        const relevance = +inputGroup.get('relevance')?.value || 0;
        if (relevance !== 1) return;
        const yearRaw = inputGroup.get('year')?.value;
        const inputYear = yearRaw instanceof Date
          ? yearRaw.getFullYear()
          : (isNaN(+yearRaw) ? null : +yearRaw);
        if (year !== null && inputYear !== year) return;
        if (index == 0 && isTruthy(inputGroup.get('affected_communities_identified')?.value)) {
          count++;
        }
        if (index == 1 && isTruthy(inputGroup.get('communities_at_risk')?.value)) {
          count++;
        }
      });
    });
    // if (index == 2) {
    //   return " ";
    // }
    return count;
  }
  triggerChangeDetection(): void {
    this.cdr.detectChanges();
  }






  // submitForm() {
  //   const siteArray = this.parentForm.get(this.arrayName) as FormArray;

  //   siteArray.controls.forEach(siteGroup => {
  //     siteGroup.markAllAsTouched();
  //   });

  //   const validSites = siteArray.controls
  //     .map(siteGroup => {
  //       const site = siteGroup.value;
  //       return {
  //         ...site,
  //         fitnessInputs: (siteGroup.get('fitnessInputs') as FormArray).getRawValue()
  //       };
  //     });

  //   const atLeastOneValid = validSites.length > 0;
  //   if (atLeastOneValid) {
  //     const progressIndicatorVal = this.calculateProgressIndicator();
  //     const contextIndixator_TotalOfPotentially = this.calculateContextIndicator(0);
  //     const contextIndixator_risk_communities = this.calculateContextIndicator(1);
  //     const contextIndixator_methodology_used = this.calculateContextIndicator(2);
  //     const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
  //     const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
  //     const goalCodeId = this.goal.goal_code;

  //     if (this.routeId !== null && this.routeId !== undefined) {
  //       this.fitEntryId = this.routeId; // Convert to number if routeId is not null or undefined
  //     }
  //     const completeness = this.calculateBE09DataCompleteness();
  //     const formData = {
  //       sites: validSites,
  //       progressIndicatorVal,
  //       contextIndixator_TotalOfPotentially,
  //       contextIndixator_risk_communities,
  //       data_completeness: {
  //         emissions: completeness
  //       },
  //       contextIndixator_methodology_used,
  //       progress_indicator_ids: progressIndicatorIds,
  //       context_indicator_ids: contextIndicatorIds,
  //       goalCode_id: goalCodeId,
  //       fit_entry_id: this.fitEntryId
  //     };


  //     console.log('BE09 Form Submitted:', formData);
  //     //  

  //     this.commonService.addData('be-form/submit/be09', formData).subscribe(
  //       response => {
  //         this._snackBar.open(response.message, '', {
  //           duration: 2000,
  //           verticalPosition: 'top',
  //           horizontalPosition: 'end',
  //           panelClass: ['customSuccessClass']
  //         });
  //         // this.resetBE09FormFields()
  //         setTimeout(() => {
  //           this.loading = false;
  //            this.router.navigate(['/be-form']);
  //         }, 2000);

  //       },
  //       error => {
  //         console.error('An error occurred:', error);
  //       }
  //     );
  //   }
  // }
  submitForm(showMessageAndRedirect: boolean = true) {
    this.globalFlagService.setSubmitted(true);
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;

    // Mark all touched to trigger validation
    siteArray.controls.forEach(siteGroup => siteGroup.markAllAsTouched());
    this.loading = true;
    // Extract valid sites like BE08
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
              year: val.year instanceof Date ? val.year.getFullYear() : val.year
            };
          });

        return {
          ...siteGroup.value,
          fitnessInputs: validFitnessInputs
        };
      })
      .filter(site => site.fitnessInputs.length > 0);

    if (validSites.length === 0) return; // stop if nothing valid

    // Collect all distinct years
    const years = Array.from(new Set(validSites.flatMap(site => site.fitnessInputs.map((fi: any) => fi.year))));

    const progressIndicatorIds = this.goal.ProgressIndicators.map((pi: any) => pi.progress_indicator_id);
    const contextIndicatorIds = this.goal.ContextIndicators.map((ci: any) => ci.context_indicator_id);
    const goalCodeId = this.goal.goal_code;

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
        id: contextIndicatorIds[0],
        score: this.parseNumber(this.calculateContextIndicator(0, year)),
        year
      },
      {
        id: contextIndicatorIds[1],
        score: this.parseNumber(this.calculateContextIndicator(1, year)),
        year
      },
      {
        id: contextIndicatorIds[2],
        score: this.parseNumber(this.calculateContextIndicator(2, year)),
        year
      }
    ])).flat();

    // === Final payload ===
    const formData = {
      sites: validSites,
      progress_indicators: progressIndicators,
      context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId
    };

    // console.log('BE09 Form Submitted:', formData);

    // === API Call ===
    this.commonService.addData('be-form/submit/be09', formData).subscribe(
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
  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    return Number(String(value).replace(/,/g, '').trim()) || 0;
  }

  isAtLeastOneSiteValid(): boolean {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    return siteArray.controls.some(siteGroup => siteGroup.valid);
  }
  resetBE09FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          assessment_conducted: false,
          affected_communities_identified: false,
          communities_at_risk: false,
          mechanism_inclusive: false,
          stakeholders_involved_in_mechanism_design: false,
          concerns_resolved_timely: false,
          info_accessible: false,
          info_communicated: false,
          appropriate_communication_channels: false,
          responsible_party_assigned: false,
          access_to_neutral_advice: false,
          users_informed: false,
          complaint_publicly_viewable: false,
          user_feedback_collected: false,
          performance_monitored: false,
          improvements_implemented: false,
          community_consultation_prior_activities: false,
          site_fitness_percentage: null,
          comments: ''
        });

        [
          'assessment_conducted',
          'affected_communities_identified',
          'communities_at_risk',
          'mechanism_inclusive',
          'stakeholders_involved_in_mechanism_design',
          'concerns_resolved_timely',
          'info_accessible',
          'info_communicated',
          'appropriate_communication_channels',
          'responsible_party_assigned',
          'access_to_neutral_advice',
          'users_informed',
          'complaint_publicly_viewable',
          'user_feedback_collected',
          'performance_monitored',
          'improvements_implemented',
          'community_consultation_prior_activities',
          'site_fitness_percentage',
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

  getFitnessInputs(site: AbstractControl): FormArray {
    return site.get('fitnessInputs') as FormArray;
  }



  addFitnessInput(siteIndex: number) {
    const siteGroup = this.sites.at(siteIndex) as FormGroup;
    const inputs = siteGroup.get('fitnessInputs') as FormArray;
    inputs.push(this.createFitnessInput());
    this.setupBE09Listeners();
  }

  createFitnessInput(data?: any): FormGroup {
    return this.fb.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      assessment_conducted: [data?.assessment_conducted || false],
      affected_communities_identified: [data?.affected_communities_identified || false],
      communities_at_risk: [data?.communities_at_risk || false],
      mechanism_inclusive: [data?.mechanism_inclusive || false],
      stakeholders_involved_in_mechanism_design: [data?.stakeholders_involved_in_mechanism_design || false],
      concerns_resolved_timely: [data?.concerns_resolved_timely || false],
      info_accessible: [data?.info_accessible || false],
      info_communicated: [data?.info_communicated || false],
      appropriate_communication_channels: [data?.appropriate_communication_channels || false],
      responsible_party_assigned: [data?.responsible_party_assigned || false],
      access_to_neutral_advice: [data?.access_to_neutral_advice || false],
      users_informed: [data?.users_informed || false],
      complaint_publicly_viewable: [data?.complaint_publicly_viewable || false],
      user_feedback_collected: [data?.user_feedback_collected || false],
      performance_monitored: [data?.performance_monitored || false],
      improvements_implemented: [data?.improvements_implemented || false],
      community_consultation_prior_activities: [data?.community_consultation_prior_activities || false],
      contextDescription: [data?.context_description || ''],
      // site_fitness_percentage: [data?.site_fitness_percentage || null],
      site_fitness_percentage: [data?.site_fitness_percentage != null ? (data.site_fitness_percentage * 100).toFixed(2) + '%' : null],
      comments: [data?.comments || ''],
    });
  }

  // removeFitnessInput(siteIndex: number, inputIndex: number) {
  //   const siteGroup = this.sites.at(siteIndex) as FormGroup;
  //   const inputs = siteGroup.get('fitnessInputs') as FormArray;

  //   if (inputs.length > 1) {
  //     inputs.removeAt(inputIndex);
  //   }
  // }
  switchTab(tab: 'progress' | 'context') {
    this.activeTab = tab;
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
          form: 'be09'
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
