
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from 'src/app/components/help-dialog/help-dialog.component';
import { GlobalFlagService } from 'src/app/services/global-flag.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ViewChild, TemplateRef } from '@angular/core';

interface Company {
  id: string;
  name: string;
  location: string;
  siteIdManual: string
}
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
  selector: 'app-be03-form',
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
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // en-GB gives DD/MM/YYYY by default
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './be03-form.component.html',
  styleUrl: './be03-form.component.scss'
})
export class Be03FormComponent implements OnChanges, OnInit {
  @Input() parentForm!: FormGroup;
  @Input() arrayName!: string;
  @Output() calculate = new EventEmitter<void>();
  @Input() fitEntryId: number;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();
  @Input() goal!: any;

  @ViewChild('progressGraphDialog')
  progressGraphDialog!: TemplateRef<any>;
  progressChartOptions: any = null;
  public chartOptions: any = null;


  loading: boolean = false;
  relevantsArr: any = [];
  resourceType: any = [];
  sitesArr: Company[] = [];
  commonFitnessCriteria: any = [];
  CompanyID: any;
  buttonEnable: boolean = false; // By default disabled
  showIndicators: boolean = false;
  routeId: any = '';
  private hasBound = false;
  startYear = new Date();
  selectedProgressYear: number | null = null;
  topYear: number;
  remainingYears: number[];
  showRemaining: boolean = false;
  formSubmittedFlag: boolean = false;
  activeTab: 'progress' | 'context' = 'progress';


  constructor(private cd: ChangeDetectorRef, private cdRef: ChangeDetectorRef, private fb: FormBuilder, private router: Router, private commonService: CommonService, private userService: UserService, private _snackBar: MatSnackBar, private rout: Router, private route: ActivatedRoute, private dialog: MatDialog, private globalFlagService: GlobalFlagService) {
    // Initialize the form with necessary fields
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.CompanyID = this.userService.CompanyID
    this.parentForm = this.fb.group({
      sites: this.fb.array([])  // Define FormArray for sites
    });
    this.commonService.getData('list/relevanace4data').subscribe((response) => {
      if (response.status === true) {
        this.relevantsArr = response.data
      }
    });
    this.commonService.getData('list/Resourcetypes').subscribe((response) => {
      if (response.status === true) {
        this.resourceType = response.data
      }
    });
    this.commonService.getData('list/common_fitness_criteria').subscribe((response) => {
      if (response.status === true) {
        this.commonFitnessCriteria = response.data
      }
    });
    this.commonService.getData(`site/sites/${this.CompanyID}`).subscribe((response) => {
      if (response.status === true) {
        this.sitesArr = response.data
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
  switchTab(tab: 'progress' | 'context') {
    this.activeTab = tab;
  }
  ngOnInit() {
    setTimeout(() => {
      const sitesArray = this.parentForm.get(this.arrayName) as FormArray;
      if (sitesArray && sitesArray.length > 0) {
        this.sites.controls.forEach(site => {
          this.bindSiteGroupEvents(site as FormGroup);
        });
      }
    });
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();

    const sitesArray = this.parentForm.get(this.arrayName) as FormArray;
    if (sitesArray && sitesArray.length > 0) {
      this.sites.controls.forEach(site => {
        this.bindSiteGroupEvents(site as FormGroup);
      });
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['parentForm'] || changes['arrayName']) {
      const sitesArray = this.parentForm.get(this.arrayName) as FormArray;
      if (sitesArray && sitesArray.length > 0) {
        this.sites.controls.forEach(site => {
          this.bindSiteGroupEvents(site as FormGroup);
        });
      }
    }
    if (changes['fitEntryId']?.currentValue) {
      // console.log('ngOnChanges fitEntryId:', this.fitEntryId);
    }
  }
  ngDoCheck() {
    if (!this.hasBound && this.parentForm && this.arrayName) {
      const sitesArray = this.parentForm.get(this.arrayName) as FormArray;
      if (sitesArray && sitesArray.length > 0) {
        this.sites.controls.forEach(site => {
          this.bindSiteGroupEvents(site as FormGroup);
        });
        this.hasBound = true;
      }
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

    const years = [...this.uniqueYearsFromFitnessInputs]
      .sort((a, b) => a - b);

    const progressData = years.map(year => {

      const value = this.calculateProgressIndicator(year);

      if (!value) {
        return null;
      }

      return Number(value.replace('%', ''));

    });

    this.chartOptions = {

      series: [
        {
          name: 'Natural resources',
          type: 'line',
          data: progressData
        }
      ],

      chart: {
        type: 'line',
        height: 420,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },

      stroke: {
        width: 3,
        curve: 'straight'
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
        tickAmount: 5,

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

      tooltip: {
        y: {
          formatter: (val: number) => val + '%'
        }
      },

      dataLabels: {
        enabled: false
      }

    };

  }

  createSiteFormGroup(): FormGroup {
    return this.fb.group({
      siteName: [''],
      siteId: ['', Validators.required],
      location: [''],
      SiteID: [''],
      id: [0],
      fitEntryId: [this.fitEntryId],
      naturalResource: [''],
      resourceID: [''],
      year: [''],
      locations: ['', [Validators.pattern(/^[a-zA-Z ]*$/)]],
      valueOfNaturalResource: ['', Validators.required],
      relevance: ['', Validators.required],
      resourceType: ['', Validators.required],
      commonFitnessCriteriaId: [null],
      renewableRespectRegenerationRates: [false],
      renewableEcosystemHealth: [false],
      renewableAquaticProtection: [false],
      renewableInvasiveSpeciesControl: [false],
      renewableNoDestructiveTechniques: [false],
      renewableSourcingIndustryStandards: [false],
      animalWelfareMaintained: [false],
      animalNoEndangeredHunting: [false],
      animalSourcingstandards: [false],
      nonrenewableSourcingIndustryStandards: [false],
      nonrenewableNoConflictOrHrViolation: [false],
      nonrenewableNoDestructiveExtraction: [false],
      nonrenewableEcosystemHealthMaintained: [false],
      nonrenewableEcosystemProductionImpactControl: [false],
      resourceFitnessPercent: [''],
      comments: [''],
      contextDescription: [''],
    });
  }


  addSite(): void {
    const newSiteGroup = this.createSiteFormGroup();
    this.sites.push(newSiteGroup);
    this.bindSiteGroupEvents(newSiteGroup);
  }
  calculateContextIndicator(): string {
    return "";
  }


  createSiteGroup(data?: any): FormGroup {
    const group = this.fb.group({

      siteName: [data?.site_name || ''],
      siteId: [data?.site_id || '', [Validators.required]],
      location: [data?.location || ''],
      SiteID: [data?.site_id || ''],
      id: [data?.id || 0],
      fitEntryId: [data?.fitEntryId || this.fitEntryId],
      year: [data?.year ? new Date(+data.year, 0, 1) : null, Validators.required],

      naturalResource: [data?.naturalResource || ''],
      resourceID: [data?.resourceID || ''],
      locations: [data?.locations || '', [Validators.pattern(/^[a-zA-Z ]*$/)]],
      valueOfNaturalResource: [data?.valueOfNaturalResource || '', Validators.required],
      relevance: [data?.relevance || '', Validators.required],
      resourceType: [data?.resourceType || '', Validators.required],
      commonFitnessCriteriaId: [data?.commonFitnessCriteriaId || null],
      renewableRespectRegenerationRates: [data?.renewableRespectRegenerationRates || false],
      renewableEcosystemHealth: [data?.renewableEcosystemHealth || false],
      renewableAquaticProtection: [data?.renewableAquaticProtection || false],
      renewableInvasiveSpeciesControl: [data?.renewableInvasiveSpeciesControl || false],
      renewableNoDestructiveTechniques: [data?.renewableNoDestructiveTechniques || false],
      renewableSourcingIndustryStandards: [data?.renewableSourcingIndustryStandards || false],
      animalWelfareMaintained: [data?.animalWelfareMaintained || false],
      animalNoEndangeredHunting: [data?.animalNoEndangeredHunting || false],
      animalSourcingstandards: [data?.animalSourcingstandards || false],
      nonrenewableSourcingIndustryStandards: [data?.nonrenewableSourcingIndustryStandards || false],
      nonrenewableNoConflictOrHrViolation: [data?.nonrenewableNoConflictOrHrViolation || false],
      nonrenewableNoDestructiveExtraction: [data?.nonrenewableNoDestructiveExtraction || false],
      nonrenewableEcosystemHealthMaintained: [data?.nonrenewableEcosystemHealthMaintained || false],
      nonrenewableEcosystemProductionImpactControl: [data?.nonrenewableEcosystemProductionImpactControl || false],
      // siteFitness: [data?.site_fitness != null ? `${data.site_fitness}%` : null],
      contextDescription: [data?.context_description || ''],
      resourceFitnessPercent: [data?.resourceFitnessPercent != null ? `${data.resourceFitnessPercent}%` : null],
      comments: [data?.comments || '']
    });

    return group;
  }
  get sites(): FormArray {
    return (this.parentForm?.get(this.arrayName) as FormArray) || new FormArray([]);
  }



  bindSiteGroupEvents(siteGroup: FormGroup): void {
    this.handleResourceTypeChange(siteGroup);


    const relevance = siteGroup.get('relevance')?.value;
    const selectedType = siteGroup.get('resourceType')?.value;
    const yearVal = siteGroup.get('year')?.value;
    if (relevance !== 1) {
      this.disableAllFields(siteGroup);
    } else {
      if (selectedType === 2) {
        this.enableFields(siteGroup, [
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards'
        ]);
        this.disableFields(siteGroup, [
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards',
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
      } else if (selectedType === 1) {
        this.enableFields(siteGroup, [
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards',
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards'
        ]);
        this.disableFields(siteGroup, [
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
      } else if (selectedType === 3) {
        this.enableFields(siteGroup, [
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
        this.disableFields(siteGroup, [
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards',
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards'
        ]);
      } else {
        this.enableAllFields(siteGroup);
      }
    }


    siteGroup.get('relevance')?.valueChanges.subscribe(() => {
      this.handleResourceTypeChange(siteGroup);
      this.calculateSiteFitness();
      this.calculateProgressIndicator(yearVal);


    });

    siteGroup.get('resourceType')?.valueChanges.subscribe(selectedType => {
      this.handleResourceTypeChange(siteGroup);
      const relevance = siteGroup.get('relevance')?.value;

      // ... your existing logic here
    });
    siteGroup.get('siteId')?.valueChanges.subscribe(() => {
      this.checkDuplicateSiteYear(siteGroup);
    });


    siteGroup.get('year')?.valueChanges.subscribe(() => {
      this.checkDuplicateSiteYear(siteGroup);
    });


  }


  // getSiteNameById(siteId: any): string {
  //   const site = this.sitesArr.find((s: any) => s.id === siteId);
  //   return site ? site.name : '';
  // }
  getSiteNameById(siteId: any): Company | null {
    const site = this.sitesArr.find((s: Company) => s.id === siteId);

    return site ? site : null;
  }



  disableFields(siteGroup: FormGroup, fields: string[]): void {
    fields.forEach(field => {
      const control = siteGroup.get(field);
      if (control) {
        control.setValue(false, { emitEvent: false });
        control.disable({ emitEvent: false });
      }
    });
  }


  removeSite(index: number): void {
    const siteGroup = this.sites.at(index) as FormGroup;
    const dbId = siteGroup.get('id')?.value;

    // Case 1: Not saved in DB (newly added site)
    if (!dbId || dbId === 0) {
      if (this.sites.length >= 1) {
        this.sites.removeAt(index);
      }
      // else {
      //   this._snackBar.open('At least one site form is required.', 'Close', { duration: 3000 });
      // }
      return;
    }

    // Case 2: Already saved in DB — confirm & send delete request
    Swal.fire({
      title: 'Are you sure you want to delete this site?',
      text: 'Once deleted, this data cannot be recovered.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {

        this.commonService.postData(`be-form/delete/${dbId}`, {}).subscribe({
          next: () => {
            // Remove from FormArray
            Swal.fire('Deleted!',
              'Your data has been successfully deleted',
              'success');
            this.sites.removeAt(index);
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Something went wrong while deleting.', 'error');
          }
        });
      }
    });
  }



  enableFields(siteGroup: FormGroup, fields: string[]): void {
    fields.forEach(field => siteGroup.get(field)?.enable({ emitEvent: false }));
  }

  enableAllFields(siteGroup: FormGroup): void {
    const allFields = [
      'renewableRespectRegenerationRates',
      'renewableEcosystemHealth',
      'renewableAquaticProtection',
      'renewableInvasiveSpeciesControl',
      'renewableNoDestructiveTechniques',
      'renewableSourcingIndustryStandards',
      'animalWelfareMaintained',
      'animalNoEndangeredHunting',
      'animalSourcingstandards',
      'nonrenewableSourcingIndustryStandards',
      'nonrenewableNoConflictOrHrViolation',
      'nonrenewableNoDestructiveExtraction',
      'nonrenewableEcosystemHealthMaintained',
      'nonrenewableEcosystemProductionImpactControl'
    ];
    this.enableFields(siteGroup, allFields);
  }

  disableAllFields(siteGroup: FormGroup): void {
    const allFields = [
      'renewableRespectRegenerationRates',
      'renewableEcosystemHealth',
      'renewableAquaticProtection',
      'renewableInvasiveSpeciesControl',
      'renewableNoDestructiveTechniques',
      'renewableSourcingIndustryStandards',
      'animalWelfareMaintained',
      'animalNoEndangeredHunting',
      'animalSourcingstandards',
      'nonrenewableSourcingIndustryStandards',
      'nonrenewableNoConflictOrHrViolation',
      'nonrenewableNoDestructiveExtraction',
      'nonrenewableEcosystemHealthMaintained',
      'nonrenewableEcosystemProductionImpactControl'
    ];
    this.disableFields(siteGroup, allFields);
  }

  calculateSiteFitness(): void {
    const isYes = (val: any): boolean =>
      val === true || val === 'Yes' || val === 1;

    this.sites.controls.forEach(siteGroup => {
      const relevance = siteGroup.get('relevance')?.value;
      const resourceType = siteGroup.get('resourceType')?.value;
      const commonFitnessCriteriaId = siteGroup.get('commonFitnessCriteriaId')?.value;
      if (relevance == 1 || relevance == 2 || relevance == 3) {
        this.buttonEnable = true;
      }


      if (relevance !== 1 || !resourceType || commonFitnessCriteriaId != 4) {
        siteGroup.get('resourceFitnessPercent')?.setValue('0%', { emitEvent: false });
        return;
      }

      const allFields = [
        'renewableRespectRegenerationRates',
        'renewableEcosystemHealth',
        'renewableAquaticProtection',
        'renewableInvasiveSpeciesControl',
        'renewableNoDestructiveTechniques',
        'renewableSourcingIndustryStandards',
        'animalWelfareMaintained',
        'animalNoEndangeredHunting',
        'animalSourcingstandards',
        'nonrenewableSourcingIndustryStandards',
        'nonrenewableNoConflictOrHrViolation',
        'nonrenewableNoDestructiveExtraction',
        'nonrenewableEcosystemHealthMaintained',
        'nonrenewableEcosystemProductionImpactControl'
      ];

      let yesCount = 0;
      let totalEnabled = 0;

      allFields.forEach(field => {
        const control = siteGroup.get(field);
        if (control && !control.disabled) {
          totalEnabled++;
          if (isYes(control.value)) {
            yesCount++;
          }
        }
      });

      // calculation
      const fitness = totalEnabled > 0 ? Math.round((yesCount / totalEnabled) * 100) : 0;


      const finalFitness = (fitness == 100) ? '100%' : '0%';

      siteGroup.get('resourceFitnessPercent')?.setValue(finalFitness, { emitEvent: false });
    });
  }

  checkDuplicateSiteYear(siteGroup: FormGroup): void {
    const currentSiteId = siteGroup.get('siteId')?.value;
    const selectedYear = siteGroup.get('year')?.value;

    if (!currentSiteId || !selectedYear) return;

    const isDuplicate = this.formArray.controls.some((site, idx) => {
      if (site == siteGroup) return false;

      const otherSiteId = site.get('siteId')?.value;
      const otherYear = site.get('year')?.value;

      return otherSiteId == currentSiteId && otherYear == selectedYear;
    });

    const yearControl = siteGroup.get('year');

    if (isDuplicate) {

      yearControl?.setValue('', { emitEvent: false });
      yearControl?.setErrors({ duplicateYear: true });
      yearControl?.markAsTouched();
    } else {

      if (yearControl?.hasError('duplicateYear')) {
        yearControl.setErrors(null);
      }
    }
  }





  handleResourceTypeChange(siteGroup: FormGroup): void {
    const relevance = siteGroup.get('relevance')?.value;
    const selectedType = siteGroup.get('resourceType')?.value;

    if (relevance == 1) {
      if (selectedType == 2) {
        this.enableFields(siteGroup, [
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards'
        ]);
        this.disableFields(siteGroup, [
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards',
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
      } else if (selectedType == 1) {
        this.enableFields(siteGroup, [
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards',
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards'
        ]);
        this.disableFields(siteGroup, [
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
      } else if (selectedType == 3) {
        this.enableFields(siteGroup, [
          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl'
        ]);
        this.disableFields(siteGroup, [
          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards',
          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards'
        ]);
      } else {
        this.enableAllFields(siteGroup);
      }
    } else {
      this.disableAllFields(siteGroup);
    }
  }
  currentIndex = 0;
  calculateProgressIndicator(year: number): string {
    const siteValues = this.sites?.value as any[];
    if (!siteValues || siteValues.length === 0) return '';

    const included = siteValues.filter(site => {
      const isRelevant = site.relevance == 1;
      if (!year) return isRelevant;

      const rawYear = site.year;
      let extractedYear: number | null = null;

      if (rawYear instanceof Date) {
        extractedYear = rawYear.getFullYear();
      } else if (typeof rawYear === 'number') {
        extractedYear = rawYear;
      } else if (typeof rawYear === 'string' && rawYear.length === 4) {
        extractedYear = parseInt(rawYear, 10);
      }

      return isRelevant && extractedYear == year;
    });

    if (included.length == 0) return '';

    let numerator = 0;
    let denominator = 0;

    included.forEach(site => {
      let fitnessRaw = site.resourceFitnessPercent || 0;
      const resourceRaw = site.valueOfNaturalResource || 0;

      const resourceValue = Number(resourceRaw.toString().replace(/,/g, ''));
      let fitness: number = 0;
      if (typeof fitnessRaw === 'string') {
        fitnessRaw = fitnessRaw.replace('%', '').trim();
        fitness = parseFloat(fitnessRaw);
      } else if (typeof fitnessRaw === 'number') {
        fitness = fitnessRaw;
      }

      numerator += fitness * resourceValue;
      denominator += resourceValue;
    });

    if (denominator == 0) return '';

    const result = numerator / denominator;
    return Math.round(result) + '%';
  }

  setYear(event: any, datepicker: any, siteIndex: number): void {
    let selectedYear: string;

    if (event && typeof event.year === 'function') {
      selectedYear = String(event.year()); // moment.js object
    } else if (typeof event === 'number') {
      selectedYear = String(event);
    } else if (event instanceof Date) {
      selectedYear = String(event.getFullYear());
    } else {
      console.error('Unexpected yearSelected event value:', event);
      return;
    }

    const siteGroup = this.formArray.at(siteIndex) as FormGroup;
    const currentSiteId = siteGroup.get('siteId')?.value; //  current site ID


    const isDuplicate = this.formArray.controls.some((site, idx) => {
      if (idx == siteIndex) return false;

      const otherSiteId = site.get('siteId')?.value;
      const otherYear = site.get('year')?.value;

      return otherSiteId == currentSiteId && otherYear == selectedYear;
    });

    if (isDuplicate) {
      // Optional: if you don't want to clear the field, comment out the next line
      siteGroup.get('year')?.setValue('');
      siteGroup.get('year')?.setErrors({ duplicateYear: true });
      siteGroup.get('year')?.markAsTouched();
      datepicker?.close();
      return;
    }

    siteGroup.get('year')?.setValue(selectedYear);
    siteGroup.get('year')?.setErrors(null);
    datepicker?.close();
  }

  onYearTyped(event: Event, siteIndex: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;

    if (value && value.length === 4 && /^\d{4}$/.test(value)) {
      this.setYear(parseInt(value, 10), null, siteIndex);
    }
  }

  get uniqueYearsFromFitnessInputs(): number[] {
    const yearsSet = new Set<number>();

    (this.sites?.value as any[])?.forEach((site: any) => {
      const yearVal = site?.year;
      const relevanceVal = site?.relevance;

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

    return Array.from(yearsSet).sort((a, b) => b - a); // descending order
  }

  triggerChangeDetection(): void {
    this.cd.detectChanges();
  }
  //   getContextDescription(year: number): { siteName: string; contextDescription: string }[] {

  //   const entries: any[] = [];

  //   if (!this.formArray?.length) return entries;

  //   this.formArray.controls.forEach((siteGroup: AbstractControl) => {

  //     const siteName =
  //       siteGroup.get('siteName')?.value ||
  //       'Site';

  //     const siteYear = siteGroup.get('year')?.value;
  //     const desc = (siteGroup.get('contextDescription')?.value || '').trim();

  //     if (siteYear == year && desc) {
  //       entries.push({
  //         siteName,
  //         contextDescription: desc
  //       });
  //     }

  //   });

  //   return entries;
  // }
  getContextDescription(year: number): { siteName: string; contextDescription: string }[] {

    const entries: any[] = [];

    if (!this.formArray?.length) return entries;

    this.formArray.controls.forEach((siteGroup: AbstractControl) => {

      const siteId = siteGroup.get('siteId')?.value;
      const siteObj = this.getSiteNameById(siteId);

      const siteName = siteObj?.name || 'Site';

      const siteYear = siteGroup.get('year')?.value;
      const desc = (siteGroup.get('contextDescription')?.value || '').trim();

      if (siteYear == year && desc) {
        entries.push({
          siteName,
          contextDescription: desc
        });
      }

    });

    return entries;
  }


  submitForm() {
    this.globalFlagService.setSubmitted(true);
    this.formSubmittedFlag = true;
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;

    siteArray.controls.forEach(siteGroup => {
      siteGroup.markAllAsTouched();
    });
    this.loading = true;
    const validSites = siteArray.controls
      .map(siteGroup => {
        const val = siteGroup.value;
        const relevance = val.relevance;
        const year = val.year;
        const isValidYear = year;
        const siteId = val.siteId;

        if (!!relevance && isValidYear && siteId) {
          return {
            ...val,
            year: (val.year instanceof Date) ? val.year.getFullYear() : val.year,
            valueOfNaturalResource: this.parseNumber(val.valueOfNaturalResource),

            totalEnergyUsed: val.totalEnergyUsed,
            renewableEnergyUsed: val.renewableEnergyUsed,
          };
        }
        return null;
      })
      .filter(site => site !== null);

    // console.log('Valid Sites:', validSites);

    const atLeastOneValid = validSites.length > 0;
    if (!atLeastOneValid) return;

    const progressIndicatorIds = this.goal?.ProgressIndicators?.map((pi: any) => pi.progress_indicator_id) || [];
    const contextIndicatorIds = this.goal?.ContextIndicators?.map((ci: any) => ci.context_indicator_id) || [];
    const goalCodeId = this.goal?.goal_code || null;

    const uniqueYears = [...new Set(validSites.map(site => site.year))].sort((a, b) => b - a);

    const progressIndicators = uniqueYears.map(year => ({
      year,
      score: this.calculateProgressIndicator(year),
      dataCompleteness: this.calculateDataCompleteness(parseInt(year, 10))

    })).flatMap(indicator =>
      progressIndicatorIds.map((id: number) => ({
        id,
        score: indicator.score,
        year: indicator.year,
        dataCompleteness: indicator.dataCompleteness
      }))
    );


    if (this.routeId != null) {
      this.fitEntryId = this.routeId;
    }

    const formData = {
      sites: validSites,
      progress_indicators: progressIndicators,
      //context_indicators: contextIndicators,
      progress_indicator_ids: progressIndicatorIds,
      context_indicator_ids: contextIndicatorIds,
      // data_completeness: this.dataCompletenessStatus,
      goalCode_id: goalCodeId,
      fit_entry_id: this.fitEntryId,
      // BEID: this.BEID
    };

    // console.log('Form Submitted:', formData);

    this.commonService.addData('be-form/submit/be03', formData).subscribe(
      response => {

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
      },
      error => {
        this.loading = false;
        console.error('An error occurred:', error);
      }
    );
  }

  parseNumber(val: any): number {
    return Number(val?.toString().replace(/,/g, '')) || 0;
  }

  resetBE03FormFields() {
    const siteArray = this.parentForm.get(this.arrayName) as FormArray;
    if (siteArray && siteArray.controls) {
      siteArray.controls.forEach((group: AbstractControl) => {
        const siteGroup = group as FormGroup;

        siteGroup.patchValue({
          fitEntryId: '',
          naturalResource: '',
          resourceID: '',
          locations: '',
          valueOfNaturalResource: '',
          relevance: '',
          resourceType: '',
          commonFitnessCriteriaId: null,
          renewableRespectRegenerationRates: false,
          renewableEcosystemHealth: false,
          renewableAquaticProtection: false,
          renewableInvasiveSpeciesControl: false,
          renewableNoDestructiveTechniques: false,
          renewableSourcingIndustryStandards: false,

          animalWelfareMaintained: false,
          animalNoEndangeredHunting: false,
          animalSourcingstandards: false,

          nonrenewableSourcingIndustryStandards: false,
          nonrenewableNoConflictOrHrViolation: false,
          nonrenewableNoDestructiveExtraction: false,
          nonrenewableEcosystemHealthMaintained: false,
          nonrenewableEcosystemProductionImpactControl: false,

          resourceFitnessPercent: null,
          comments: ''
        });

        [
          'fitEntryId',
          'naturalResource',
          'resourceID',
          'locations',
          'valueOfNaturalResource',
          'relevance',
          'resourceType',
          'commonFitnessCriteriaId',

          'renewableRespectRegenerationRates',
          'renewableEcosystemHealth',
          'renewableAquaticProtection',
          'renewableInvasiveSpeciesControl',
          'renewableNoDestructiveTechniques',
          'renewableSourcingIndustryStandards',

          'animalWelfareMaintained',
          'animalNoEndangeredHunting',
          'animalSourcingstandards',

          'nonrenewableSourcingIndustryStandards',
          'nonrenewableNoConflictOrHrViolation',
          'nonrenewableNoDestructiveExtraction',
          'nonrenewableEcosystemHealthMaintained',
          'nonrenewableEcosystemProductionImpactControl',

          'resourceFitnessPercent',
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
  // calculateDataCompleteness(year: number | string): string {
  // const selectedYear = year;

  // const relevanceValues: number[] = this.sites.controls
  //   .filter(siteGroup => {
  //     const siteYear = siteGroup.get('year')?.value;
  //     const yearVal = siteYear instanceof Date ? siteYear.getFullYear() : Number(siteYear);
  //     return yearVal == selectedYear;
  //   })
  //   .map(siteGroup => siteGroup.get('relevance')?.value)
  //   .filter(val => val !== null && val !== undefined && !isNaN(val));

  // if (relevanceValues.length > 0) {
  //   const hasNotRelevant = relevanceValues.includes(2);
  //   const hasInsufficient = relevanceValues.includes(3);
  //   const hasOtherExcluded = relevanceValues.includes(4);
  //   const hasIncluded = relevanceValues.includes(1);

  //   if (hasNotRelevant) {
  //     return 'Calculation based on complete data';
  //   }
  //   if (hasInsufficient) {
  //     return 'Calculation based on incomplete data';
  //   }
  //   if (hasOtherExcluded) {
  //     return 'Calculation may be based on incomplete data';
  //   }
  //   if (hasIncluded && relevanceValues.every(val => val == 1)) {
  //     return 'Calculation based on complete data';
  //   }
  // }

  // return '';
  // }
  calculateDataCompleteness(year: number | string): string {
    const selectedYear = Number(year);
    const allRelevanceValues: number[] = [];


    this.sites.controls.forEach(siteGroup => {
      const siteYear = siteGroup.get('year')?.value;
      const yearVal = siteYear instanceof Date ? siteYear.getFullYear() : Number(siteYear);

      if (yearVal == selectedYear) {
        const relevanceVal = siteGroup.get('relevance')?.value;
        if (relevanceVal !== null && relevanceVal !== undefined && !isNaN(relevanceVal)) {
          allRelevanceValues.push(Number(relevanceVal));
        }
      }
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


