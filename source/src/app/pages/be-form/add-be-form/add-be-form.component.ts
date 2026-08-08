import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder, FormArray,
  AbstractControl
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { catchError, from, map, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { Be01FormComponent } from '../be01-form/be01-form.component';
import { Be02FormComponent } from '../be02-form/be02-form.component'// Adjust path as needed
import { Be03FormComponent } from '../be03-form/be03-form.component'; // Adjust path as needed
import { Be06FormComponent } from '../be06-form/be06-form.component';

import { Be05FormComponent } from '../be05-form/be05-form.component';

import { Be07FormComponent } from '../be07-form/be07-form.component';
import { Be08FormComponent } from '../be08-form/be08-form.component';
import { Be10FormComponent } from '../be10-form/be10-form.component';
import { Be11FormComponent } from '../be11-form/be11-form.component';
import { Be12FormComponent } from '../be12-form/be12-form.component';
import { Be13FormComponent } from '../be13-form/be13-form.component';
import { Be14FormComponent } from '../be14-form/be14-form.component';
import { Be15FormComponent } from '../be15-form/be15-form.component';

// import { Be16FormComponent } from '../be16-form/be16-form.component';
import { Be17FormComponent } from '../be17-form/be17-form.component';
import { Be18FormComponent } from '../be18-form/be18-form.component';

import { Be16FormComponent } from '../be16-form/be16-form.component';
import { Be09FormComponent } from '../be09-form/be09-form.component';
import { Be20FormComponent } from '../be20-form/be20-form.component';
import { Be19FormComponent } from '../be19-form/be19-form.component';
import { Be21FormComponent } from '../be21-form/be21-form.component';
import { Be22FormComponent } from '../be22-form/be22-form.component';
import { N } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-add-be-form',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSelectModule,
    Be01FormComponent,
    Be02FormComponent,
    Be05FormComponent,
    Be06FormComponent,
    Be03FormComponent,
    Be08FormComponent,
    Be09FormComponent,
    Be10FormComponent,
    Be07FormComponent,
    Be11FormComponent,
    Be12FormComponent,
    Be13FormComponent,
    Be14FormComponent,
    Be15FormComponent,

    // Be16FormComponent
    Be17FormComponent,
    Be18FormComponent,

    Be16FormComponent,
    Be19FormComponent,
    Be20FormComponent,
    Be21FormComponent,
    Be22FormComponent

  ],
  templateUrl: './add-be-form.component.html',
  styleUrl: './add-be-form.component.scss'
})
export class AddBeFormComponent {

  sidebarItems = ['BE01', 'BE02', 'BE03', 'BE05', 'BE06', 'BE07', 'BE08', 'BE09', 'BE10', 'BE11', 'BE12', 'BE13', 'BE14', 'BE15', 'BE16', 'BE17', 'BE20', 'BE21', 'BE22'];

  selected = 'BE01';
  siteForm: FormGroup;
  employeeForm: FormGroup;
  productForm: FormGroup;
  be01Form: FormGroup;
  be02Form: FormGroup;
  be03Form: FormGroup;
  be05Form: FormGroup;
  be06Form: FormGroup;
  be07Form: FormGroup;
  be08Form: FormGroup;
  be09Form: FormGroup;
  be10Form: FormGroup;
  be11Form: FormGroup;
  be12Form: FormGroup;
  be13Form: FormGroup;
  be14Form: FormGroup;
  be15Form: FormGroup;
  be16Form: FormGroup;

  be17Form: FormGroup;
  be18Form: FormGroup;

  be20Form: FormGroup;
  be19Form: FormGroup;
  be21Form: FormGroup;
  be22Form: FormGroup;

  RoleID: any = 1;
  CompanyID: any;
  company_id: any
  fitEntryId: any = '';
  title: any = 'Input Progress Data';
  riskBGColor: any = '';
  riskFontColor: any = '';
  residualRiskList: any[] = [];
  loading: boolean = false;
  BEData: any = []
  siteMasterList: any = []
  employeeMasterList: any = []
  productsMasterList: any = []
  @ViewChild('select') select: MatSelect;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID
    // console.log(this.CompanyID, 'CompanyID')
    this.siteForm = this.formBuilder.group({
      sites: this.formBuilder.array([])
    });
    this.employeeForm = this.formBuilder.group({
      employee: this.formBuilder.array([])
    });
    this.productForm = this.formBuilder.group({
      products: this.formBuilder.array([])
    });
    //Get All Sites List

    this.fetchSites();
    this.fetchProducts();
    this.fetchEmpolyee();

    this.be01Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be02Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be03Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be05Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be06Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be07Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be08Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be09Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be10Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be11Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be12Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be13Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be14Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be15Form = this.formBuilder.group({ products: this.formBuilder.array([]) });

    this.be16Form = this.formBuilder.group({ products: this.formBuilder.array([]) });
    this.be17Form = this.formBuilder.group({
      products: this.formBuilder.array([]),
      AU: [''],
      AV: [''],
      AW: [0],
      AX: [0],
      G4: [0],
    });

    this.be18Form = this.formBuilder.group({ products: this.formBuilder.array([]) });
    //Get All Break Even Goal List
    this.fetchBreakEvenGoals();

    this.be19Form = this.formBuilder.group({ products: this.formBuilder.array([]) });
    this.be20Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be21Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be22Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    //Get All Break Even Goal List 
    this.fetchBreakEvenGoals();

  }

  get be01Sites(): FormArray {
    return this.be01Form.get('sites') as FormArray;
  }
  get be02Sites(): FormArray {
    return this.be02Form.get('sites') as FormArray;
  }
  get be03Sites(): FormArray {
    return this.be03Form.get('sites') as FormArray;
  }
  get be05Sites(): FormArray {
    return this.be05Form.get('sites') as FormArray;
  }
  get be06Sites(): FormArray {
    return this.be06Form.get('sites') as FormArray;
  }
  get be07Sites(): FormArray {
    return this.be07Form.get('sites') as FormArray;
  }
  get be08Sites(): FormArray {
    return this.be08Form.get('sites') as FormArray;
  }
  get be09Sites(): FormArray {
    return this.be09Form.get('sites') as FormArray;
  }
  get be10Employee(): FormArray {
    return this.be10Form.get('employee') as FormArray;
  }
  get be11Employee(): FormArray {
    return this.be11Form.get('employee') as FormArray;
  }
  get be12Employee(): FormArray {
    return this.be12Form.get('employee') as FormArray;
  }
  get be13Employee(): FormArray {
    return this.be13Form.get('employee') as FormArray;
  }
  get be14Employee(): FormArray {
    return this.be14Form.get('employee') as FormArray;
  }
  get be15Products(): FormArray {
    return this.be15Form.get('products') as FormArray;
  }
  get be16Products(): FormArray {
    return this.be16Form.get('products') as FormArray;
  }
  get be17Products(): FormArray {
    return this.be17Form.get('products') as FormArray;
  }
  get be18Products(): FormArray {
    return this.be18Form.get('products') as FormArray;
  }
  get be19Products(): FormArray {
    return this.be19Form.get('products') as FormArray;
  }
  get be20Employee(): FormArray {
    return this.be20Form.get('employee') as FormArray;
  }
  get be21Sites(): FormArray {
    return this.be21Form.get('sites') as FormArray;
  }
  get be22Sites(): FormArray {
    return this.be22Form.get('sites') as FormArray;
  }

  fetchBreakEvenGoals() {
    this.commonService.getData('be-form/getAllBE').subscribe((response) => {
      if (response.status === true) {
        this.BEData = response.data;
        this.sidebarItems = this.BEData.map((goal: { goal_code: any; }) => goal.goal_code);
        this.selected = this.sidebarItems[0];
      }
    });
  }

  fetchEmpolyee() {

    if (this.RoleID == 1) {
      this.company_id = 2
    } else {
      this.company_id = this.CompanyID
      //this.company_id = 2 
    }
    this.commonService.getData('list/employee/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        this.employeeMasterList = response.data
        // console.log("EMP data" + response.data)
        this.employeeMasterList.forEach((employee: { employee_id: any; employee_group: any; group_id: any; number_of_employees: any; site_name: any; location: any; site_id_manual: any; site_location: any }) => {
          // console.log("EMP data 2" + employee.employee_group)
          // this.employeeMasterList.forEach((site: any) => {
          this.be10Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            EmployeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            hazardControlsInPlace: [false],
            riskAssessmentDone: [false],
            riskTrainingProvided: [false],
            safetyPoliciesMonitored: [false],
            antiBullyingPolicy: [false],
            flexibleWorkConditions: [false],
            stressGuidanceAccess: [false],
            healthIssueSupportPolicy: [false],
            smokeFreeWorkEnvironment: [false],
            smokeFreeCommunalAreas: [false],
            healthyEatingAccess: [false],
            workBreaksAllowed: [false],
            flexibleBreaksForExercise: [false],

            siteFitness: [null],
            comments: ['']
          }));
          this.be11Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            employeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            number_of_employees_living_wage: [''],
            employee_fitness_percentage: [null],
            comments: ['']
          }));
          this.be12Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            employeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            no_child_labour: [false],
            fair_employment_status: [false],
            freedom_of_association: [false],
            fair_working_hours: [false],
            overtime_compensation: [false],
            right_to_refuse_irregular_work: [false],
            reasonable_schedule_notice: [false],
            holiday_entitlement: [false],
            weekly_rest_day: [false],
            maternity_paternity_leave: [false],
            employee_fitness_percentage: [null],
            comments: ['']
          }));
          this.be13Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            employeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            clear_policy_commitment: [false],
            senior_official_responsible: [false],
            policy_communicated: [false],
            policy_in_hr_practices: [false],
            reporting_procedure_available: [false],
            actions_and_feedback_documented: [false],
            control_effectiveness_assessed: [false],
            controls_adjusted_if_needed: [false],
            employee_fitness_percentage: [null],

            comments: ['']
          }));
          this.be14Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            employeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            design_involvement: [false],
            issue_scope_inclusive: [false],
            timely_resolution: [false],
            active_communication: [false],
            confidentiality_protection: [false],
            responsibility_assigned: [false],
            independent_advice_access: [false],
            full_information_during_process: [false],
            consulted_on_changes: [false],
            feedback_requested: [false],
            performance_monitored: [false],
            feedback_included_in_assessment: [false],
            improvements_implemented: [false],
            employee_fitness_percentage: [null],
            comments: ['']
          }));


          this.be20Employee.push(this.formBuilder.group({
            employeeId: [employee.employee_id],
            employeeGroup: [employee.employee_group],
            employeeGroupId: [employee.group_id],
            employeeLocation: [employee.location],
            employeeNO: [employee.number_of_employees],
            employeeSite: [employee.site_name],
            siteLocation: [employee.site_location],
            siteIdManual: [employee.site_id_manual],
            relevance: ['', Validators.required],
            hotspot_assessment: [false],
            hotspot_Procedures: [false],
            ethics_inplace: [false],
            ethics_positions: [false],
            internal_breaches: [false],
            internal_issues: [false],
            internal_employees: [false],
            internal_processes: [false],
            employee_fitness_percentage: [null],
            comments: ['']
          }));


        });
      }
    });
  }


  fetchSites() {
    if (this.RoleID == 1) {
      this.company_id = 2
    } else {
      this.company_id = this.CompanyID
      // this.company_id = 2
    }
    this.commonService.getData('list/sites/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        this.siteMasterList = response.data
        // console.log(this.siteMasterList)
        this.siteMasterList.forEach((site: any) => {
          this.sites.push(this.createSiteGroup(site));
        });
        this.siteMasterList.forEach((site: { site_id: any; site_name: any; site_id_manual: any; location: any; }) => {
          this.be01Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevance: ['', Validators.required],
            // year:['' , [Validators.required]], 
            renewableEnergyUsed: [null],
            totalEnergyUsed: [null],
            siteFitness: [''],
            comments: ['']
          }));

          this.be02Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevance: ['', Validators.required],
            relevance1: ['', Validators.required],
            fitWaterVolume: [0],
            unfitWaterVolume: [0],
            commercialOffset: [''],
            workerFitWater: [0],
            workerUnfitWater: [0],
            commercialFit: [0],
            commercialUnfit: [0],
            commercialTotal: [0],
            siteFitness: [''],
            siteFitness1: [''],
            dischargeRelevance: [''],
            fitDischarged: [0],
            totalDischarged: [0],
            dischargeFitness: [''],
            comments: ['']
          }));

          this.be03Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            // siteId: [site.site_id_manual],
            location: [site.location],
            siteId: [''],
            // relevanceId: [''],                            
            fitEntryId: [''],
            id: [0],
            //  year: [new Date().getFullYear()],

            naturalResource: [''],
            resourceID: [''],
            locations: ['', [Validators.pattern(/^[a-zA-Z ]*$/)]],
            valueOfNaturalResource: ['',Validators.required],
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
            contextDescription: [''],
            resourceFitnessPercent: [''],
            comments: ['']
          }));


          this.be06Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevance: ['', Validators.required],
            ghgReferenceYear: [null],
            ghgReportingYear: [null],
            ghgAdequatelyOffset: [null],
            siteFitnessPercent: [null],
            NOGHGemissionsAreReleased: [''],
            comments: [''],
            GHGemissionsyear: [''],
          }));

          this.be07Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevance: ['', Validators.required],
            site_assessed_waste_id: [''],
            waste_reference_year: [null],
            waste_reporting_year: [null],
            site_fitness_percent: [null],
            comments: [''],
            wastegeneratedyear: [''],
          }));
          this.be05Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevanceGaseous: ['', Validators.required],
            gaseousReferenceYear: [null],
            gaseousReportingYear: [null],
            gaseousSiteFitnessPercent: [null],
            relevanceLiquid: ['', Validators.required],
            liquidReferenceYear: [null],
            liquidReportingYear: [null],
            liquidSiteFitnessPercent: [null],
            relevanceSolid: ['', Validators.required],
            solidReferenceYear: [null],
            solidReportingYear: [null],
            solidSiteFitnessPercent: [null],
            liquidemissionyear: [null],
            Solidemissionyear: [null],
            Gaseousemissionyear: [null],
            comments: ['']
          }));
          this.be08Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            site_id: [site.site_id],
            relevance: ['', Validators.required],
            siteArea: [null],
            localImpactIdentified: [false],
            valueAreaIdentified: [false],
            valueAreaProtected: [false],
            noImpactOnPristineEcosystems: [false],
            landRightsUncontested: [false],
            communityConsentObtained: [false],
            pastDamageNeutralized: [false],
            siteFitness: [null],
            comments: ['']
          }));
          this.be09Sites.push(this.formBuilder.group({
            siteName: [site.site_name],
            siteId: [site.site_id_manual],
            location: [site.location],
            relevance: ['', Validators.required],
            site_id: [site.site_id],
            assessment_conducted: [false],
            affected_communities_identified: [false],
            communities_at_risk: [false],
            mechanism_inclusive: [false],
            stakeholders_involved_in_mechanism_design: [false],
            concerns_resolved_timely: [false],
            info_accessible: [false],
            info_communicated: [false],
            appropriate_communication_channels: [false],
            responsible_party_assigned: [false],
            access_to_neutral_advice: [false],
            users_informed: [false],
            complaint_publicly_viewable: [false],
            user_feedback_collected: [false],
            performance_monitored: [false],
            improvements_implemented: [false],
            community_consultation_prior_activities: [false],
            site_fitness_percentage: [null],
            comments: ['']
          }));




          this.be21Sites.push(this.formBuilder.group({
            // siteName: [site.site_name],
            // siteId: [site.site_id_manual],
            // location: [site.location],


            companyis_mnc: [false],
            public_website: [false],
            public_tax_appointed: [false],
            public_tax_strategy: [false],
            public_tax_marketed: [false],
            public_tax_no_tax: [false],
            public_tax_direct: [false],
            public_tax_stated: [false],
            public_tax_independent: [false],
            public_tax_discloses: [false],
            tax_policies_totalescore: [null],

            transparency_company: [false],
            transparency_evidence: [false],
            transparency_address: [false],
            transparency_ultimate: [false],
            transparency_totalescore: [null],
            taxrate_reconciliation: [false],
            taxrate_current: [false],
            taxrate_narrative: [false],
            taxrate_deferred: [false],
            taxrate_totalescore: [null],

            country_by_disclose: [false],
            country_by_residence: [false],
            country_by_net_asset_value: [false],
            country_by_net_period_provided: [false],
            country_by_income: [false],
            country_by_current_tax_charge: [false],
            country_by_average_number: [false],
            country_by_total_context_score: [null],
            comments: [''],
          }));
          this.be22Sites.push(this.formBuilder.group({
            // siteName: [site.site_name],
            // siteId: [site.site_id_manual],
            // location: [site.location],

            lobbying_seek_to_influence: [false],
            lobbying_supporting_individuals: [false],
            lobbying_specific_positions: [false],
            lobbying_all_departments: [false],

            contributions_directly_undertake: [false],
            contributions_diligence_before: [false],
            contributions_recipient_engages: [false],
            contributions_due_diligence: [false],
            contributions_regular_review: [false],
            contributions_clear_guidance: [false],

            disclosure_recipient_name: [false],
            disclosure_amount: [false],
            disclosure_date_of_contribution: [false],
            disclosure_company_raised: [false],
            comments: [''],
          }));


        });
      }
    });
  }
  fetchProducts() {
    if (this.RoleID == 1) {
      this.company_id = 2
    } else {
      this.company_id = this.CompanyID
    }
    this.commonService.getData('list/product/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        this.productsMasterList = response.data
        // console.log(this.productsMasterList, 'this.productsMasterList')
        // console.log(this.productsMasterList.length, 'this.productsMasterList.length')
        // this.productsMasterList.forEach((products: any) => {
        //   this.sites.push(this.createProductGroup(products));
        // });
        this.productsMasterList.forEach((product: { product_id: any; product_typename: any; product_name: any; product_id_manual: any; revenue_cost: any; user_group: any; user_group_id: any }) => {
          // console.log('659', product.product_name)
          this.be17Products.push(this.formBuilder.group({
            product_id: [product.product_id],
            productType: [product.product_typename],
            productName: [product.product_name],
            productId: [product.product_id_manual],
            revenueCost: [product.revenue_cost],
            userGroup: [product.user_group],
            userGroupId: [product.user_group_id],
            relevance: ['', Validators.required],
            GDMMusePhase: [false],
            GDMMendOfLife: [false],
            WDKMPusePhase: [false],
            CWUILHRusePhase: [false],
            EDVPusePhase: [false],
            EDVendOfLife: [false],
            GFUPEusePhase: [false],
            GFUPEendOfLife: [false],
            GCSCusePhase: [false],
            GCSCendOfLife: [false],
            phycal_gd_is_an_intrmdt_gd: [false],
            intrmdt_gd_asses_reprvv_user: [false],
            RPUFGusePhase: [false],
            RPUFGendOfLife: [false],
            service_result_in_negative_impacts: [false],
            service_could_harm_ecosystems: [false],
            service_ngtv_impacts_physcl_mntl_wlbng: [false],
            service_reinforce_bhvr_undrm_ftns: [false],
            service_perpetuates_orx_rlc_infr_ngtv_impacts: [false],
            productFitnessusePhase: [0],
            productFitnessendOfLife: [0],
            AF: [''],
            AG: [''],
            AH: [''],
            AI: [''],
            AJ: [''],
            AK: [''],
            AL: [''],
            AM: [''],
            AN: [''],
            AO: [''],
            AP: [''],
            AQ: [''],
            AR: [''],
            AS: [''],
            AU: [''],
            AV: [''],
            AW: [''],
            AX: [''],


            comments: ['']
          }));
          // console.log(this.be17Products, 'this.be17Products')
          this.be18Products.push(this.formBuilder.group({
            // productType: [product.product_type],
            product_id: [product.product_id],
            productName: [product.product_name],
            productId: [product.product_id_manual],
            revenueCost: [product.revenue_cost],
            // userGroup: [product.user_group],
            // userGroupId: [product.user_group_id],
            relevance: ['', Validators.required],
            emitGHGs: [false],
            lifetimeUsePhase: [0],
            unitSold: [0],
            productFitness: [0],
            comments: ['']
          }));
          this.be15Products.push(this.formBuilder.group({
            product_id: [product.product_id],
            productName: [product.product_name],
            productId: [product.product_id_manual],
            revenueCost: [product.revenue_cost],
            userGroup: [product.user_group],
            productType: [product.product_typename],
            userGroupId: [product.user_group_id],
            relevance: ['', Validators.required],
            user_groups_communicationplans: [false],
            communications_are_considered: [false],
            communications_crucial_information: [false],
            communications_product_information: [false],
            purchase_information_needed: [false],
            purchase_physical_goods: [],
            purchase_nature_andquantities: [],
            purchase_characteristics_ofproducts: [],
            purchase_ambiguous_term: [],
            purchase_comparative: [],
            purchase_user_groups: [],
            use_users_provided: [],
            use_nutrition_information: [],
            use_with_guidance: [],
            use_guidance_provided: [],
            post_physical_good: [],
            post_improper_disposal: [],
            product_fitness_percentage: [null],
            // revenue: [], 
            comments: ['']
          }));
          this.be16Products.push(this.formBuilder.group({
            product_id: [product.product_id],
            productName: [product.product_name],
            productId: [product.product_id_manual],
            productType: [product.product_typename],
            revenueCost: [product.revenue_cost],
            userGroup: [product.user_group],
            userGroupId: [product.user_group_id],
            relevance: ['', Validators.required],

            legitimacy: [false],
            positive_outcomes: [false],
            accessibility: [false],
            reduce_uncertainty: [false],
            fairness_concerns_investigated: [false],
            fairness_policies_consult: [false],
            transparency_throughout_investigation: [false],
            transparency_process_investigating: [false],
            transparency_valid_acknowledged: [false],
            transparency_alternatively_investigation: [false],
            engage_actively: [false],
            improve_continuously_performance: [false],
            improve_continuously_implement: [false],
            product_fitness_percentage: [null],
            // revenue: [],                          
            comments: ['']
          }));
          this.be19Products.push(this.formBuilder.group({
            product_id: [product.product_id],
            productName: [product.product_name],
            productId: [product.product_id_manual],
            revenueCost: [product.revenue_cost],
            userGroup: [product.user_group],
            userGroupId: [product.user_group_id],
            productType: [product.product_typename],
            // revenue:[''], 
            relevance: ['', Validators.required],
            numberof_distinct: [null],
            fitness1_repurposing: [null],
            fitness1_sold: [null],
            fitness2_repurposing: [null],
            fitness2_sold: [null],
            fitness3_repurposing: [null],
            fitness3_sold: [null],
            fitness4_repurposing: [null],
            fitness4_sold: [null],
            fitness5_repurposing: [null],
            fitness5_sold: [null],
            fitness6_repurposing: [null],
            fitness6_sold: [null],
            fitness7_repurposing: [null],
            fitness7_sold: [null],
            fitness8_repurposing: [null],
            fitness8_sold: [null],
            fitness9_repurposing: [null],
            fitness9_sold: [null],
            fitness10_repurposing: [null],
            fitness10_sold: [null],
            product_fitness_percentage: [null],

            comments: ['']
          }));

        });
      }
    });
  }


  submitBE01() {
    // console.log('Submit BE01', this.be01Form.value);
  }
  submitBE02() {
    // console.log('Submit BE02', this.be02Form.value);
  }
  submitBE03() {
    // console.log('Submit BE03', this.be03Form.value);
  }
  submitBE06() {
    // console.log('Submit BE05', this.be06Form.value);
  }
  submitBE07() {
    // console.log('Submit BE07', this.be07Form.value);
  }
  createSiteGroup(site: any): FormGroup {
    return this.formBuilder.group({
      siteName: [site.site_name],
      siteId: [site.site_id_manual],
      location: [site.location],
      relevance: ['', Validators.required],
      renewableEnergyUsed: [0],
      totalEnergyUsed: [0],
      fitWaterVolume: [0],
      unfitWaterVolume: [0],
      commercialOffset: [''],
      workerFitWater: [0],
      workerUnfitWater: [0],
      commercialFit: [0],
      commercialUnfit: [0],
      commercialTotal: [0],
      fitDischarged: [0],
      totalDischarged: [0],
      siteFitness: [''],
      dischargeRelevance: [''],
      dischargeFitness: [''],
      comments: ['']
    });
  }

  get sites(): FormArray {
    return this.siteForm.get('sites') as FormArray;
  }
  get employes(): FormArray {
    return this.employeeForm.get('employee') as FormArray;
  }

  // Calculate site fitness based on formula
  calculateSiteFitness(index: number) {
    const siteGroup = this.sites.at(index);
    const relevance = siteGroup.get('relevance')?.value;
    const renewable = siteGroup.get('renewableEnergyUsed')?.value || 0;
    const total = siteGroup.get('totalEnergyUsed')?.value || 0;

    if (relevance !== 'Included') {
      siteGroup.get('siteFitness')?.setValue('', { emitEvent: false });
    } else if (total < renewable) {
      siteGroup.get('siteFitness')?.setValue('Error', { emitEvent: false });
    } else if (total === 0) {
      siteGroup.get('siteFitness')?.setValue('', { emitEvent: false });
    } else {
      const fitness = renewable / total;
      siteGroup.get('siteFitness')?.setValue((fitness * 100).toFixed(2) + '%', { emitEvent: false });
    }
  }

  calculateProgressIndicator(): string {
    let totalRenewable = 0;
    let totalEnergy = 0;
    let includedCount = 0;

    this.sites.controls.forEach(site => {
      if (site.get('relevance')?.value === 'Included') {
        includedCount++;
        totalRenewable += Number(site.get('renewableEnergyUsed')?.value) || 0;
        totalEnergy += Number(site.get('totalEnergyUsed')?.value) || 0;
      }
    });

    if (totalRenewable > totalEnergy) {
      return 'Error';
    } else if (includedCount === 0) {
      return '';
    } else if (totalEnergy === 0) {
      return '';
    } else {
      return ((totalRenewable / totalEnergy) * 100).toFixed(2) + '%';
    }
  }


  calculateContextIndicator(): number {
    let totalEnergy = 0;

    this.sites.controls.forEach(site => {
      if (site.get('relevance')?.value === 'Included') {
        totalEnergy += Number(site.get('totalEnergyUsed')?.value) || 0;
      }
    });

    return totalEnergy;
  }

  ngOnInit() {

  }
  onSubmit() {
    this.loading = true;
    // console.log(this.siteForm, 'this.siteForm')
    this.siteForm.controls['CompanyName'].markAsTouched()
    this.siteForm.controls['CompanyNumber'].markAsTouched()
    this.siteForm.controls['CompanyEmail'].markAsTouched()
    // this.siteForm.controls['NRAScore'].markAsTouched()

    this.siteForm.controls['CompanyAddress'].markAsTouched()
    // this.siteForm.controls['ExternalTreatScore'].markAsTouched()
    this.siteForm.controls['FirstName'].markAsTouched()
    this.siteForm.controls['LastName'].markAsTouched()
    // this.siteForm.controls['riskOwners'].markAsTouched()
    // console.log(this.siteForm, 'this.siteForm')
    if (this.siteForm.valid) {
      // this.siteForm.controls['riskOwners'].setValue(this.riskOwners)
      this.commonService.addData('company/add/', this.siteForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/company']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }

  public handleError(error: any) {
    // console.log(error, 'error 123')
  }
  selectItem(item: string) {
    this.selected = item;
  }
  handleFormSubmission(event: { fitEntryId: number, nextForm: string }) {
    const { fitEntryId, nextForm } = event;
    this.fitEntryId = fitEntryId;
    console.log(this.fitEntryId, 'this.fitEntryId Main')
    this.selected = nextForm; // switch to next form dynamically
  }
  // handleFormSubmissionBe05(id: number) {
  //   this.fitEntryId = id;
  //   console.log(this.fitEntryId,'this.fitEntryId Main')
  //   this.selected = 'BE06'; // switch to next form dynamically
  // }

  getSelectedGoal() {
    return this.BEData.find((goal: { goal_code: string; }) => goal.goal_code === this.selected);
  }

  goBack() {
    // Add your logic
  }


  calculateAll() {
    this.sites.controls.forEach(site => {
      // Total commercial water calculation
      const commercialFit = +site.get('commercialFit')?.value || 0;
      const commercialUnfit = +site.get('commercialUnfit')?.value || 0;
      site.get('commercialTotal')?.setValue(commercialFit + commercialUnfit);

      // Simple site fitness based on renewable/total
      const relevance = site.get('relevance')?.value;
      const renewable = +site.get('renewableEnergyUsed')?.value || 0;
      const total = +site.get('totalEnergyUsed')?.value || 0;

      if (relevance !== 'Included') {
        site.get('siteFitness')?.setValue('');
      } else if (total < renewable) {
        site.get('siteFitness')?.setValue('Error');
      } else if (total === 0) {
        site.get('siteFitness')?.setValue('');
      } else {
        const result = (renewable / total) * 100;
        site.get('siteFitness')?.setValue(result.toFixed(2) + '%');
      }

      // Discharge fitness
      const dischargeRel = site.get('dischargeRelevance')?.value;
      const fitDischarged = +site.get('fitDischarged')?.value || 0;
      const totalDischarged = +site.get('totalDischarged')?.value || 0;

      if (dischargeRel !== 'Included') {
        site.get('dischargeFitness')?.setValue('');
      } else if (totalDischarged === 0) {
        site.get('dischargeFitness')?.setValue('');
      } else {
        const result = (fitDischarged / totalDischarged) * 100;
        site.get('dischargeFitness')?.setValue(result.toFixed(2) + '%');
      }
    });
  }
}
