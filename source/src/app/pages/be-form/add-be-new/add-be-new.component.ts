import { Component, ElementRef, QueryList, ViewChild, ViewChildren, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder, FormArray,
  AbstractControl
} from '@angular/forms';
import * as moment from 'moment';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { catchError, from, map, of, Observable, forkJoin } from 'rxjs';
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
import { Be04FormComponent } from '../be04-form/be04-form.component';

import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { Be23FormComponent } from '../be23-form/be23-form.component';
import { GlobalFlagService } from 'src/app/services/global-flag.service';
import Swal from 'sweetalert2';


export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-be-new',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSelectModule,
    Be01FormComponent, Be02FormComponent, Be05FormComponent, Be06FormComponent, Be03FormComponent, Be08FormComponent, Be09FormComponent, Be10FormComponent, Be07FormComponent, Be11FormComponent, Be12FormComponent, Be13FormComponent, Be14FormComponent, Be15FormComponent, Be17FormComponent, Be18FormComponent, Be16FormComponent, Be19FormComponent, Be20FormComponent, Be21FormComponent, Be22FormComponent, MatDatepickerModule, MatNativeDateModule, Be23FormComponent, Be04FormComponent
  ],
  providers: [
    provideMomentDateAdapter(MY_FORMATS)
  ],
  templateUrl: './add-be-new.component.html',
  styleUrl: './add-be-new.component.scss'
})
export class AddBeNewComponent implements AfterViewInit {

  sidebarItems: any = {};
  siteSidebarItems: any = [];
  employeeSidebarItems: any = [];
  productSidebarItems: any = [];
  @ViewChild('stepper') stepper: MatStepper;
  selected = 'BE01';
  siteForm: FormGroup;
  employeeForm: FormGroup;
  productForm: FormGroup;
  GovernanceformGroup: FormGroup;
  SupplyChainFormGroup: FormGroup;
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

  be04Form: FormGroup;
  be23Form: FormGroup;
  RoleID: any = 1;
  UserID: any = 0;
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
  governanceSidebarItems: any = [];
  private isInternalStepChange = false;
  be04Loading = true;
  activeStep: number = 0;
  BasicformGroup: any;
  SiteformGroup: any;
  EmpformGroup: any;
  ProductformGroup: any;
  BasicFitForm: any;
  selectedMonthYear: string = '';
  fit_entry: any = '';
  routeId: string | null = null;
  selectedGoal: any | null = 'BE01';
  isEditMode: boolean = false;
  editData: any[] = [];
  today = new Date();

  editBe11Data: any[] = [];
  editBe12Data: any[] = [];
  editBe13Data: any[] = [];
  editBe14Data: any[] = [];
  editBe20Data: any[] = [];

  editData2: any[] = [];
  editData3: any[] = [];
  editDataPurchase: any[] = [];
  editDataFinancial: any[] = [];
  byURLSelected: string | null = '';
  byURLStepSelected: any | null = 0;
  be04Tabs: any = [];
  supplyChainSidebarItems: any = [];
  isSupplyChainLoading = false;
  isLoading = false;
  goalMap: any = {
    site: [1, 2, 3, 5, 6, 7, 8, 9],
    supplychain: [4],
    employee: [10, 11, 12, 13, 14],
    product: [15, 16, 17, 18, 19],
    governance: [20, 21, 22, 23]
  };
  beGoals: any = []
  stepMap: any[] = [];

  @ViewChild('select') select: MatSelect;
  @ViewChildren(MatStep, { read: ElementRef }) stepElements!: QueryList<ElementRef>;
  @Output() formSubmitted = new EventEmitter<{ fitEntryId: number, nextForm: string }>();
  @Input() editFitId?: any;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private globalFlagService: GlobalFlagService
  ) {
    this.routeId = this.route.snapshot.paramMap.get('editFitId');
    this.byURLSelected = this.route.snapshot.paramMap.get('begoal');
    this.RoleID = this.userService.RoleID
    this.UserID = this.userService.UserID
    this.CompanyID = this.userService.CompanyID
    this.siteForm = this.formBuilder.group({
      sites: this.formBuilder.array([])
    });
    this.employeeForm = this.formBuilder.group({
      employee: this.formBuilder.array([])
    });
    this.productForm = this.formBuilder.group({
      products: this.formBuilder.array([])
    });
    this.GovernanceformGroup = this.formBuilder.group({
      governance: this.formBuilder.array([])
    });
    this.SupplyChainFormGroup = this.formBuilder.group({
      supplyChain: this.formBuilder.array([])
    });




    //Get All Sites List
    // console.log('Edit Time entry:', this.routeId);
    // Basic Fit Form Form Builder
    this.BasicFitForm = this.formBuilder.group({
      FutureFitName: ['', [Validators.required]],
      FitMonthYear: ['', [Validators.required]],
      fit_entry_id: [''],
    });

    this.fetchSites();

    this.fetchPurchase();
    this.fetchEmpolyee();
    this.fetchProducts();

    this.fetchFinancial();
    if (!this.byURLSelected) {
      // this.selected = this.selectedGoal;
      if (this.siteSidebarItems.length) this.selected = 'BE01';
      else if (this.supplyChainSidebarItems.length) this.selected = 'BE04';
      else if (this.employeeSidebarItems.length) this.selected = 'BE10';

    }
    // console.log(this.selected, 'this.selected')
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
    // this.fetchBreakEvenGoals();

    this.be19Form = this.formBuilder.group({ products: this.formBuilder.array([]) });
    this.be20Form = this.formBuilder.group({ employee: this.formBuilder.array([]) });
    this.be21Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be22Form = this.formBuilder.group({ sites: this.formBuilder.array([]) });
    this.be04Form = this.formBuilder.group({ purchase: this.formBuilder.array([]) });
    this.be23Form = this.formBuilder.group({ financial: this.formBuilder.array([]) });
    //Get All Break Even Goal List 
    this.fetchBreakEvenGoals();
    // this.setActiveStepClass(0);

    // if (this.routeId !== null && this.routeId !== undefined) {
    this.isEditMode = true;
    // console.log('Edit Mode is ON');
    // Fetch existing data for editing
    // this.loadExistingData();
    // }

  }

  getGoalsForGroup(group: string) {

    const goals = this.goalMap[group];

    return this.beGoals
      .filter((id: number) => goals.includes(id))
      .map((id: number) => 'BE' + id.toString().padStart(2, '0'));
  }


  onFitSubmit(stepper: MatStepper) {

    this.loading = true;
    if (this.isEditMode == true) {
      this.BasicFitForm.controls['fit_entry_id'].setValue(this.routeId);
    }
    this.BasicFitForm.controls['FutureFitName'].markAsTouched()
    this.BasicFitForm.controls['FitMonthYear'].markAsTouched()



    // console.log(this.BasicFitForm, 'this.BasicFitForm')
    if (this.BasicFitForm.valid) {
      this.commonService.addData('be-form/submit/submit_basic_future_fit', this.BasicFitForm.value).subscribe(
        response => {
          this.fit_entry = response.data.fit_entry;
          // console.log('Fit Entry ID in angular side:', this.fit_entry);
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.fitEntryId = this.fit_entry
            this.selected = 'BE01'
            // this.router.navigate(['/site']);
            stepper.next();
          }, 2000);

        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }

  oldonStepChange(event: StepperSelectionEvent) {
    let currentIndex = event.selectedIndex;
    this.activeStep = currentIndex;
    if (this.byURLStepSelected) {
      currentIndex = this.byURLStepSelected
      this.activeStep = this.byURLStepSelected;
    }
    this.setActiveStepClass(currentIndex);
    switch (currentIndex) {
      case 0: // Sites
        if (this.siteSidebarItems.length > 0) {
          this.selectItem(this.siteSidebarItems[0]);
        }
        break;
      case 1:   // Supply Chain
        if (this.supplyChainSidebarItems.length > 0) {
          this.selectItem(this.supplyChainSidebarItems[0]);
        }
        break;


      //   setTimeout(() => {

      //   if (this.supplyChainSidebarItems.length > 0) {
      //     this.selectItem(this.supplyChainSidebarItems[0]);
      //   }
      // }, 2000);
      // break;
      case 2: // Employees
        if (this.employeeSidebarItems.length > 0) {
          this.selectItem(this.employeeSidebarItems[0]);
        }
        break;
      case 3: // Products
        if (this.productSidebarItems.length > 0) {
          this.selectItem(this.productSidebarItems[0]);
        }
        break;
      case 4: // Governance
        if (this.governanceSidebarItems.length > 0) {
          this.selectItem(this.governanceSidebarItems[0]);
        }
        break;



    }
  }

  onStepChange(event: StepperSelectionEvent) {
    if (this.isInternalStepChange) return;
    const nextIndex = event.selectedIndex;
    const currentIndex = this.activeStep;


    const currentForm = this.getFormByStepIndex(currentIndex);


    if (currentForm && currentForm.dirty && !this.globalFlagService.isSubmitted()) {
      Swal.fire({
        title: 'Unsaved changes',
        text: 'You have unsaved changes. Do you really want to switch steps?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, discard changes',
        cancelButtonText: 'Stay on this step',
        // reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Mark form as pristine (optional)
          currentForm.markAsPristine();
          this.moveToStep(nextIndex, event);
        } else {
          // Stay on same step
          this.stepper.selectedIndex = currentIndex;
        }
      });
    } else {
      // If form clean or submitted — move normally
      this.moveToStep(nextIndex, event);
    }
  }
  private OLD11_03_2026_moveToStep(nextIndex: number, event: StepperSelectionEvent) {
    let currentIndex = nextIndex;
    this.activeStep = nextIndex;

    // if (this.byURLStepSelected) {
    //   currentIndex = this.byURLStepSelected;
    //   this.activeStep = this.byURLStepSelected;
    // }
    if (this.byURLStepSelected !== null && this.byURLStepSelected !== undefined) {
      currentIndex = this.byURLStepSelected;
      this.activeStep = this.byURLStepSelected;
      this.byURLStepSelected = null; // prevent future override
    }

    this.setActiveStepClass(currentIndex);

    switch (currentIndex) {
      case 0: // Sites
        if (this.siteSidebarItems.length > 0) {
          this.selectItem(this.siteSidebarItems[0]);
        }
        break;
      // case 1:   // Supply Chain
      //   if (this.supplyChainSidebarItems.length > 0) {
      //     this.selectItem(this.supplyChainSidebarItems[0]);
      //   }
      //   break;
      case 1:
        this.isSupplyChainLoading = true;

        setTimeout(() => {
          this.isSupplyChainLoading = false;
          const firstItem = this.supplyChainSidebarItems[0];
          if (firstItem) {
            this.selectItem(firstItem);
          }
        });
        break;



      case 2: // Employees
        if (this.employeeSidebarItems.length > 0) {
          this.selectItem(this.employeeSidebarItems[0]);
        }
        break;
      case 3: // Products
        if (this.productSidebarItems.length > 0) {
          this.selectItem(this.productSidebarItems[0]);
        }
        break;
      case 4:
        if (this.governanceSidebarItems.length > 0) {
          this.selectItem(this.governanceSidebarItems[0]);
        }
        break;
    }
    const sidebarMap = [
      this.siteSidebarItems,
      this.supplyChainSidebarItems,
      this.employeeSidebarItems,
      this.productSidebarItems,
      this.governanceSidebarItems
    ];
    console.log(sidebarMap[2], 'this.employeeSidebarItems')
    setTimeout(() => {
      const firstItem = sidebarMap[currentIndex + 1]?.[0];
      console.log(firstItem, 'firstItem')
      console.log(currentIndex, 'currentIndex')
      if (firstItem) {
        this.selectItem(firstItem);
      }
    });
    // this.isInternalStepChange = true;
    // this.stepper.selectedIndex = currentIndex;
    // this.isInternalStepChange = false;
    // this.stepper.selectedIndex = currentIndex;
  }
  private moveToStep(nextIndex: number, event: StepperSelectionEvent) {

    this.activeStep = nextIndex;

    if (this.byURLStepSelected !== null && this.byURLStepSelected !== undefined) {
      nextIndex = this.byURLStepSelected;
      this.activeStep = this.byURLStepSelected;
      this.byURLStepSelected = null;
    }

    this.setActiveStepClass(nextIndex);
    console.log(nextIndex, 'nextIndex')
    // switch (nextIndex) {

    //   case 0:
    //     if (this.siteSidebarItems.length > 0) {
    //       this.selectItem(this.siteSidebarItems[0]);
    //     }
    //     break;

    //   case 1:
    //     this.isSupplyChainLoading = true;
    //     setTimeout(() => {
    //       this.isSupplyChainLoading = false;
    //       if (this.supplyChainSidebarItems.length > 0) {
    //         this.selectItem(this.supplyChainSidebarItems[0]);
    //       }
    //     });
    //     break;

    //   case 2:
    //     if (this.employeeSidebarItems.length > 0) {
    //       this.selectItem(this.employeeSidebarItems[0]);
    //     }
    //     break;

    //   case 3:
    //     if (this.productSidebarItems.length > 0) {
    //       this.selectItem(this.productSidebarItems[0]);
    //     }
    //     break;

    //   case 4:
    //     console.log(this.governanceSidebarItems,'this.governanceSidebarItems')
    //     if (this.governanceSidebarItems.length > 0) {
    //       this.selectItem(this.governanceSidebarItems[0]);
    //     }
    //     break;
    // }
    const step = this.stepMap[nextIndex];

    if (step && step.items.length) {
      this.selectItem(step.items[0]);
    }


    this.isInternalStepChange = true;
    this.stepper.selectedIndex = nextIndex;
    this.isInternalStepChange = false;
  }



  getFormByStepIndex(stepIndex: number): FormGroup | null {
    switch (stepIndex) {
      case 0: return this.be01Form;
      case 1: return this.be02Form;
      case 2: return this.be03Form;
      case 3: return this.be05Form;
      case 4: return this.be06Form;
      case 5: return this.be07Form;
      case 6: return this.be08Form;
      case 7: return this.be09Form;
      case 8: return this.be10Form;
      case 9: return this.be11Form;
      case 10: return this.be12Form;
      case 11: return this.be13Form;
      case 12: return this.be14Form;
      case 13: return this.be15Form;
      case 14: return this.be16Form;
      case 15: return this.be17Form;
      case 16: return this.be18Form;
      case 17: return this.be19Form;
      case 18: return this.be20Form;
      case 19: return this.be21Form;
      case 20: return this.be22Form;
      case 21: return this.be23Form;
      default: return null;
    }
  }
  getFormByStepIndexTest(stepForm: any): FormGroup | null {
    switch (stepForm) {
      case 'BE01': return this.be01Form;
      case 'BE02': return this.be02Form;
      case 'BE03': return this.be03Form;
      case 'BE04': return this.be04Form;
      case 'BE05': return this.be05Form;
      case 'BE06': return this.be06Form;
      case 'BE07': return this.be07Form;
      case 'BE08': return this.be08Form;
      case 'BE09': return this.be09Form;
      case 'BE10': return this.be10Form;
      case 'BE11': return this.be11Form;
      case 'BE12': return this.be12Form;
      case 'BE13': return this.be13Form;
      case 'BE14': return this.be14Form;
      case 'BE15': return this.be15Form;
      case 'BE16': return this.be16Form;
      case 'BE17': return this.be17Form;
      case 'BE18': return this.be18Form;
      case 'BE19': return this.be19Form;
      case 'BE20': return this.be20Form;
      case 'BE21': return this.be21Form;
      case 'BE22': return this.be22Form;
      case 'BE23': return this.be23Form;
      default: return null;
    }
  }


  setActiveStepClass(activeIndex: number) {
    this.stepElements.forEach((stepEl, index) => {
      const nativeElement = stepEl.nativeElement;
      if (index === activeIndex) {
        nativeElement.classList.add('active-step');
      } else {
        nativeElement.classList.remove('active-step');
      }
    });
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

  get be04Sites(): FormArray {
    return this.be04Form.get('purchase') as FormArray;
  }
  get be23Products(): FormArray {
    return this.be23Form.get('financial') as FormArray;
  }

  fetchBreakEvenGoals() {

    this.commonService.getData('users/getbyId/' + this.UserID).subscribe((response) => {
      if (response.status && response.data[0]) {

        this.beGoals = response.data[0].goal_ids;

        this.siteSidebarItems = this.getGoalsForGroup('site');
        this.supplyChainSidebarItems = this.getGoalsForGroup('supplychain');
        this.employeeSidebarItems = this.getGoalsForGroup('employee');
        this.productSidebarItems = this.getGoalsForGroup('product');
        this.governanceSidebarItems = this.getGoalsForGroup('governance');
        this.loadBEGoals();
      }
    });


    // this.commonService.getData('be-form/getAllBE2').subscribe((response) => {
    //   if (response.status === true) {
    //     const data = response.data;

    //     // Clear existing data
    //     this.sidebarItems = []; // Use an object to hold dynamic sidebar items
    //     this.BEData = null;    // Will be set dynamically
    //     // this.selected = null;

    //     // Dynamically assign each group (site, employees, products, etc.)
    //     for (const key in data) {
    //       if (data.hasOwnProperty(key)) {
    //         const group = data[key];
    //         this.sidebarItems[key] = group.map((item: any) => item.goal_code);
    //       }
    //     }

    //     // Optionally, set the first available group as default
    //     const firstKey = Object.keys(this.sidebarItems)[0];
    //     if (firstKey) {
    //       this.BEData = data[firstKey];
    //       this.selected = this.sidebarItems[firstKey][0];
    //     }
    //   }
    // });

  }

  loadBEGoals() {
    this.commonService.getData('be-form/getAllBE2').subscribe((response) => {
      if (response.status === true) {
        const data = response.data;

        this.BEData = data;


        // if (this.RoleID == 3) { 
        if (this.RoleID != 1 && this.RoleID != 2) {
          this.siteSidebarItems = this.filterGoals(
            data.sites.filter((goal: any) => goal.goal_code !== 'BE04')
          );
          this.employeeSidebarItems = this.filterGoals(data.employees);
          const governanceCodes = ['BE20', 'BE21', 'BE22', 'BE23'];
          const productGoals = data.products.filter((goal: any) =>
            !governanceCodes.includes(goal.goal_code)
          );
          this.productSidebarItems = this.filterGoals(productGoals);

          this.supplyChainSidebarItems = this.filterGoals(
            data.sites.filter((x: any) => x.goal_code === 'BE04')
          );


          const governanceGoals = data.products.filter((goal: any) =>
            governanceCodes.includes(goal.goal_code)
          );

          this.governanceSidebarItems = this.filterGoals(governanceGoals);
          console.log(this.supplyChainSidebarItems, 'this.supplyChainSidebarItems')

        } else {
          this.siteSidebarItems = data.sites
            .map((goal: any) => goal.goal_code)
            .filter((code: any) => code != 'BE04');
          this.supplyChainSidebarItems = ['BE04'];

          this.employeeSidebarItems = data.employees.map((goal: any) => goal.goal_code);
          console.log(this.employeeSidebarItems, 'this.employeeSidebarItems')
          const governanceCodes = ['BE20', 'BE21', 'BE22', 'BE23'];
          this.productSidebarItems = data.products.map((goal: any) => goal.goal_code);
          this.productSidebarItems = this.productSidebarItems.filter(
            (x: string) => !governanceCodes.includes(x)
          );

          this.governanceSidebarItems = governanceCodes;
        }


        const goalExistsInSidebar = this.siteSidebarItems.some((item: any) => item === this.selectedGoal);

        if (this.byURLSelected) {
          if (this.siteSidebarItems.includes(this.byURLSelected)) {
            this.activeStep = 0;
            this.byURLStepSelected = 0;
            this.selected = this.byURLSelected;
            // optionally set context: this.currentGroup = 'site';
          }
          else if (this.supplyChainSidebarItems.includes(this.byURLSelected)) {
            this.activeStep = 1;
            this.byURLStepSelected = 1;
            this.selected = this.byURLSelected;
          }

          else if (this.employeeSidebarItems.includes(this.byURLSelected)) {
            this.activeStep = 2;
            this.byURLStepSelected = 2;
            this.selected = this.byURLSelected;
            // this.currentGroup = 'employee';
          } else if (this.productSidebarItems.includes(this.byURLSelected)) {
            this.activeStep = 3;
            this.byURLStepSelected = 3;
            this.selected = this.byURLSelected;
            // this.currentGroup = 'product';
          } else if (this.governanceSidebarItems.includes(this.byURLSelected)) {
            this.activeStep = 4;
            this.byURLStepSelected = 4;
            this.selected = this.byURLSelected;
          }



          else {
            this.activeStep = 0;
            this.byURLStepSelected = 0;
            this.selected = this.siteSidebarItems[0]; // fallback
            // this.currentGroup = 'site';
          }
        } else {
          this.activeStep = 0;
          this.byURLStepSelected = 0;
          this.selected = this.siteSidebarItems[0]; // fallback
          // this.currentGroup = 'site';
        }

        this.stepMap = [];

        if (this.siteSidebarItems.length) {
          this.stepMap.push({ index: 0, items: this.siteSidebarItems });
        }

        if (this.supplyChainSidebarItems.length) {
          this.stepMap.push({ index: 1, items: this.supplyChainSidebarItems });
        }

        if (this.employeeSidebarItems.length) {
          this.stepMap.push({ index: 2, items: this.employeeSidebarItems });
        }

        if (this.productSidebarItems.length) {
          this.stepMap.push({ index: 3, items: this.productSidebarItems });
        }

        if (this.governanceSidebarItems.length) {
          this.stepMap.push({ index: 4, items: this.governanceSidebarItems });
        }

        setTimeout(() => {

          this.stepper.selectedIndex = this.activeStep;

          const firstStep = this.stepMap[this.activeStep];

          if (firstStep && firstStep.items.length) {
            this.selectItem(firstStep.items[0]);
          }

        }, 200);
      }
    });
  }

  filterGoals(goals: any[]) {

    return goals
      .filter(goal => this.beGoals.includes(goal.goal_id))
      .map(goal => goal.goal_code);

  }


  //  fetchEmpolyee() {

  //   if (this.RoleID == 1) {
  //     this.company_id = 2;
  //   } else {
  //     this.company_id = this.CompanyID;
  //   }

  //   this.commonService.getData('list/employee/' + this.company_id).subscribe((response) => {
  //     if (response.status === true) {
  //       this.employeeMasterList = response.data;
  //       const body = { company_id: this.company_id };

  //       if (this.isEditMode) {
  //         const be10$ = this.commonService.postData(`be-listing/getbe10Details/${this.routeId}`, body);
  //         const be11$ = this.commonService.postData(`be-listing/getbe11Details/${this.routeId}`, body);
  //         const be12$ = this.commonService.postData(`be-listing/getbe12Details/${this.routeId}`, body);
  //         const be13$ = this.commonService.postData(`be-listing/getbe13Details/${this.routeId}`, body);
  //         const be14$ = this.commonService.postData(`be-listing/getbe14Details/${this.routeId}`, body);
  //         const be20$ = this.commonService.postData(`be-listing/getbe20Details/${this.routeId}`, body);

  //         forkJoin([be10$, be11$, be12$, be13$, be14$, be20$]).subscribe(([res10, res11, res12, res13, res14, res20]) => {
  //           this.editData = res10.success ? res10.data.employees : [];
  //           this.editBe11Data = res11.success ? res11.data.employees : [];
  //           this.editBe12Data = res12.success ? res12.data.employees : [];
  //           this.editBe13Data = res13.success ? res13.data.employees : [];
  //           this.editBe14Data = res14.success ? res14.data.employees : [];
  //           this.editBe20Data = res20.success ? res20.data.employees : [];

  //           this.buildEmployeeForms();
  //         });
  //       } else {
  //         this.buildEmployeeForms(); // insert mode
  //       }
  //     }
  //   });
  // }


  // buildEmployeeForms() {
  //   this.employeeMasterList.forEach((employee: any) => {
  //     const id = employee.employee_id;

  //     const be10 = this.editData?.find(d => d.employee_id === id)?.be10_data?.[0] ?? null;
  //     const be11 = this.editBe11Data?.find(d => d.employee_id === id)?.be11_data?.[0] ?? null;
  //     const be12 = this.editBe12Data?.find(d => d.employee_id === id)?.be12_data?.[0] ?? null;
  //     const be13 = this.editBe13Data?.find(d => d.employee_id === id)?.be13_data?.[0] ?? null;
  //     const be14 = this.editBe14Data?.find(d => d.employee_id === id)?.be14_data?.[0] ?? null;
  //     const be20 = this.editBe20Data?.find(d => d.employee_id === id)?.be20_data?.[0] ?? null;

  //     // BE10
  //     this.be10Employee.push(this.formBuilder.group({
  //       employeeId: [id],
  //       employeeGroup: [employee.employee_group],
  //       employeeGroupId: [employee.group_id],
  //       employeeLocation: [employee.location],
  //       EmployeeNO: [employee.number_of_employees],
  //       employeeSite: [employee.site],
  //       relevance: [be10?.relevance_id || '', Validators.required],
  //       hazardControlsInPlace: [be10?.hazard_controls_in_place === 1],
  //       riskAssessmentDone: [be10?.risk_assessment_done == 1],
  //       riskTrainingProvided: [be10?.risk_training_provided == 1],
  //       safetyPoliciesMonitored: [be10?.safety_policies_monitored == 1],
  //       antiBullyingPolicy: [be10?.anti_bullying_policy == 1],
  //       flexibleWorkConditions: [be10?.flexible_work_conditions == 1],
  //       stressGuidanceAccess: [be10?.stress_guidance_access === 1],
  //       healthIssueSupportPolicy: [be10?.health_issue_support_policy == 1],
  //       smokeFreeWorkEnvironment: [be10?.smoke_free_work_environment == 1],
  //       smokeFreeCommunalAreas: [be10?.smoke_free_communal_areas == 1],
  //       healthyEatingAccess: [be10?.healthy_eating_access == 1],
  //       workBreaksAllowed: [be10?.work_breaks_allowed == 1],
  //       flexibleBreaksForExercise: [be10?.flexible_breaks_for_exercise == 1],
  //       siteFitness: [be10?.site_fitness ?? null],
  //       comments: [be10?.comments || ''],
  //       BEID: [be10?.id || 0]
  //     }));

  //     // BE11
  //     this.be11Employee.push(this.formBuilder.group({
  //       employeeId: [id],
  //       employeeGroup: [employee.employee_group],
  //       employeeGroupId: [employee.group_id],
  //       employeeLocation: [employee.location],
  //       employeeNO: [employee.number_of_employees],
  //       employeeSite: [employee.site],
  //       relevance: [be11?.relevance_id || '', Validators.required],
  //       number_of_employees_living_wage: [be11?.number_of_employees_living_wage ?? 0],
  //       employee_fitness_percentage: [be11?.employee_fitness_percentage ?? null],
  //       comments: [be11?.comments || ''],
  //       BEID: [be11?.id || 0]
  //     }));

  //     // BE12
  //     this.be12Employee.push(this.formBuilder.group({
  //       employeeId: [id],
  //       employeeGroup: [employee.employee_group],
  //       employeeGroupId: [employee.group_id],
  //       employeeLocation: [employee.location],
  //       employeeNO: [employee.number_of_employees],
  //       employeeSite: [employee.site],
  //       relevance: [be12?.relevance_id || '', Validators.required],
  //       no_child_labour: [be12?.no_child_labour === 1],
  //       fair_employment_status: [be12?.fair_employment_status === 1],
  //       freedom_of_association: [be12?.freedom_of_association === 1],
  //       fair_working_hours: [be12?.fair_working_hours === 1],
  //       overtime_compensation: [be12?.overtime_compensation === 1],
  //       right_to_refuse_irregular_work: [be12?.right_to_refuse_irregular_work === 1],
  //       reasonable_schedule_notice: [be12?.reasonable_schedule_notice === 1],
  //       holiday_entitlement: [be12?.holiday_entitlement === 1],
  //       weekly_rest_day: [be12?.weekly_rest_day === 1],
  //       maternity_paternity_leave: [be12?.maternity_paternity_leave === 1],
  //       employee_fitness_percentage: [be12?.employee_fitness_percentage ?? null],
  //       comments: [be12?.comments || ''],
  //       BEID: [be12?.id || 0]
  //     }));

  //     // BE13
  //     this.be13Employee.push(this.formBuilder.group({
  //       employeeId: [id],
  //       employeeGroup: [employee.employee_group],
  //       employeeGroupId: [employee.group_id],
  //       employeeLocation: [employee.location],
  //       employeeNO: [employee.number_of_employees],
  //       employeeSite: [employee.site],
  //       relevance: [be13?.relevance_id || '', Validators.required],
  //       clear_policy_commitment: [be13?.clear_policy_commitment === 1],
  //       senior_official_responsible: [be13?.senior_official_responsible === 1],
  //       policy_communicated: [be13?.policy_communicated === 1],
  //       policy_in_hr_practices: [be13?.policy_in_hr_practices === 1],
  //       reporting_procedure_available: [be13?.reporting_procedure_available === 1],
  //       actions_and_feedback_documented: [be13?.actions_and_feedback_documented === 1],
  //       control_effectiveness_assessed: [be13?.control_effectiveness_assessed === 1],
  //       controls_adjusted_if_needed: [be13?.controls_adjusted_if_needed === 1],
  //       employee_fitness_percentage: [be13?.employee_fitness_percentage ?? null],
  //       comments: [be13?.comments || ''],
  //       BEID: [be13?.id || 0]
  //     }));

  //     // BE14
  //     this.be14Employee.push(this.formBuilder.group({
  //       employeeId: [id],
  //       employeeGroup: [employee.employee_group],
  //       employeeGroupId: [employee.group_id],
  //       employeeLocation: [employee.location],
  //       employeeNO: [employee.number_of_employees],
  //       employeeSite: [employee.site],
  //       relevance: [be14?.relevance_id || '', Validators.required],
  //       design_involvement: [be14?.design_involvement === 1],
  //       issue_scope_inclusive: [be14?.issue_scope_inclusive === 1],
  //       timely_resolution: [be14?.timely_resolution === 1],
  //       active_communication: [be14?.active_communication === 1],
  //       confidentiality_protection: [be14?.confidentiality_protection === 1],
  //       responsibility_assigned: [be14?.responsibility_assigned === 1],
  //       independent_advice_access: [be14?.independent_advice_access === 1],
  //       full_information_during_process: [be14?.full_information_during_process === 1],
  //       consulted_on_changes: [be14?.consulted_on_changes === 1],
  //       feedback_requested: [be14?.feedback_requested === 1],
  //       performance_monitored: [be14?.performance_monitored === 1],
  //       feedback_included_in_assessment: [be14?.feedback_included_in_assessment === 1],
  //       improvements_implemented: [be14?.improvements_implemented === 1],
  //       employee_fitness_percentage: [be14?.employee_fitness_percentage ?? null],
  //       comments: [be14?.comments || ''],
  //       BEID: [be14?.id || 0]
  //     }));

  //     // BE20
  //     this.be20Employee.push(this.formBuilder.group({
  //        employeeId: [employee.employee_id],
  //             employeeGroup: [employee.employee_group],
  //             employeeGroupId: [employee.group_id],
  //             employeeLocation: [employee.location],
  //             employeeNO: [employee.number_of_employees],
  //             employeeSite: [employee.site],
  //             relevance: [''],
  //             hotspot_assessment: [false],
  //             hotspot_Procedures: [false],
  //             ethics_inplace: [false],
  //             ethics_positions: [false],
  //             internal_breaches: [false],
  //             internal_issues: [false],
  //             internal_employees: [false],
  //             internal_processes: [false],
  //             employee_fitness_percentage: [null],
  //             comments: ['']
  //     }));
  //   });
  // }
  createEmployeeYearMap(yearString: string, employeeString: string): Record<string, number> {
    if (!yearString || !employeeString) return {};

    const years = yearString.split(',').map(y => y.trim());
    const employees = employeeString.split(',').map(e => e.trim());
    const map: Record<string, number> = {};

    years.forEach((year, i) => {
      const empCount = parseInt(employees[i] || '0', 10);
      if (year && !isNaN(empCount)) map[year] = empCount;
    });

    return map;
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

        let fetchEditData$: Observable<any>;
        if (this.isEditMode) {
          fetchEditData$ = this.commonService.getData('be-listing/getEmployeeDetails/' + this.company_id + '/' + this.routeId);
        } else {
          fetchEditData$ = of({ success: false });
        }
        fetchEditData$.subscribe((res: any) => {
          if (res.success) {
            this.editData3 = res.data.employees;
          }

          this.employeeMasterList.forEach((employee: { employee_id: any; year: any; employee_group: any; group_id: any; number_of_employees: any; site_name: any; location: any; site_id_manual: any; site_location: any }) => {
            const existingData = this.isEditMode == true
              ? this.editData3?.find((d: any) => d.employee_id === employee.employee_id)
              : null;
            const be20 = existingData?.be20_data ?? [];
            const be10 = existingData?.be10_data ?? [];
            const be11 = existingData?.be11_data ?? [];
            const be12 = existingData?.be12_data ?? [];
            const be13 = existingData?.be13_data ?? [];
            const be14 = existingData?.be14_data ?? [];
            const fieldsArrayBe10 = [];
            if (be10?.length) {
              for (let i = 0; i < be10?.length; i++) {
                const be10Item = be10[i];
                fieldsArrayBe10.push(this.createFitnessInputBe10(be10Item));
              }
            } else {
              fieldsArrayBe10.push(this.createFitnessInputBe10({}));
            }

            const fitnessFormArrayBe10 = this.formBuilder.array(fieldsArrayBe10);
            this.be10Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              EmployeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be10?.id || 0],
              fitnessInputs: fitnessFormArrayBe10,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));
            // this.be10Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   EmployeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be10?.relevance_id || '', Validators.required],
            //   hazardControlsInPlace: [be10?.hazard_controls_in_place === 1],
            //   riskAssessmentDone: [be10?.risk_assessment_done == 1],
            //   riskTrainingProvided: [be10?.risk_training_provided == 1],
            //   safetyPoliciesMonitored: [be10?.safety_policies_monitored == 1],
            //   antiBullyingPolicy: [be10?.anti_bullying_policy == 1],
            //   flexibleWorkConditions: [be10?.flexible_work_conditions == 1],
            //   stressGuidanceAccess: [be10?.stress_guidance_access === 1],
            //   healthIssueSupportPolicy: [be10?.health_issue_support_policy == 1],
            //   smokeFreeWorkEnvironment: [be10?.smoke_free_work_environment == 1],
            //   smokeFreeCommunalAreas: [be10?.smoke_free_communal_areas == 1],
            //   healthyEatingAccess: [be10?.healthy_eating_access == 1],
            //   workBreaksAllowed: [be10?.work_breaks_allowed == 1],
            //   flexibleBreaksForExercise: [be10?.flexible_breaks_for_exercise == 1],
            //   siteFitness: [be10?.site_fitness ?? null],
            //   comments: [be10?.comments || ''],
            //   BEID: [be10?.id || 0]
            // }));

            // BE11


            const fieldsArrayBe11 = [];
            if (be11?.length) {
              for (let i = 0; i < be11.length; i++) {
                const be11Item = be11[i];
                fieldsArrayBe11.push(this.createFitnessInputBe11(be11Item));
              }
            } else {
              fieldsArrayBe11.push(this.createFitnessInputBe11({}));
            }

            const fitnessFormArrayBe11 = this.formBuilder.array(fieldsArrayBe11);

            this.be11Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              employeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be11?.[0]?.id || 0],
              fitnessInputs: fitnessFormArrayBe11,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));


            // this.be11Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   employeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be11?.relevance_id || '', Validators.required],
            //   number_of_employees_living_wage: [be11?.number_of_employees_living_wage ?? null],
            //   employee_fitness_percentage: [be11?.employee_fitness_percentage ?? null],
            //   comments: [be11?.comments || ''],
            //   BEID: [be11?.id || 0]
            // }));

            // BE12

            // this.be12Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   employeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be12?.relevance_id || '', Validators.required],
            //   no_child_labour: [be12?.no_child_labour === 1],
            //   fair_employment_status: [be12?.fair_employment_status === 1],
            //   freedom_of_association: [be12?.freedom_of_association === 1],
            //   fair_working_hours: [be12?.fair_working_hours === 1],
            //   overtime_compensation: [be12?.overtime_compensation === 1],
            //   right_to_refuse_irregular_work: [be12?.right_to_refuse_irregular_work === 1],
            //   reasonable_schedule_notice: [be12?.reasonable_schedule_notice === 1],
            //   holiday_entitlement: [be12?.holiday_entitlement === 1],
            //   weekly_rest_day: [be12?.weekly_rest_day === 1],
            //   maternity_paternity_leave: [be12?.maternity_paternity_leave === 1],
            //   employee_fitness_percentage: [be12?.employee_fitness_percentage ?? null],
            //   comments: [be12?.comments || ''],
            //   BEID: [be12?.id || 0]
            // }));

            const fieldsArrayBe12 = [];

            if (be12?.length) {
              for (let i = 0; i < be12.length; i++) {
                const be12Item = be12[i];
                fieldsArrayBe12.push(this.createFitnessInputBe12(be12Item));
              }
            } else {
              fieldsArrayBe12.push(this.createFitnessInputBe12({}));
            }

            const fitnessFormArrayBe12 = this.formBuilder.array(fieldsArrayBe12);

            this.be12Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              employeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be12?.[0]?.id || 0],
              fitnessInputs: fitnessFormArrayBe12,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));


            // BE13

            // this.be13Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   employeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be13?.relevance_id || '', Validators.required],
            //   clear_policy_commitment: [be13?.clear_policy_commitment === 1],
            //   senior_official_responsible: [be13?.senior_official_responsible === 1],
            //   policy_communicated: [be13?.policy_communicated === 1],
            //   policy_in_hr_practices: [be13?.policy_in_hr_practices === 1],
            //   reporting_procedure_available: [be13?.reporting_procedure_available === 1],
            //   actions_and_feedback_documented: [be13?.actions_and_feedback_documented === 1],
            //   control_effectiveness_assessed: [be13?.control_effectiveness_assessed === 1],
            //   controls_adjusted_if_needed: [be13?.controls_adjusted_if_needed === 1],
            //   employee_fitness_percentage: [be13?.employee_fitness_percentage ?? null],
            //   comments: [be13?.comments || ''],
            //   BEID: [be13?.id || 0]
            // }));

            // BE14
            const fieldsArrayBe13 = [];

            if (be13?.length) {
              for (let i = 0; i < be13.length; i++) {
                const be13Item = be13[i];
                fieldsArrayBe13.push(this.createFitnessInputBe13(be13Item));
              }
            } else {
              fieldsArrayBe13.push(this.createFitnessInputBe13({}));
            }

            const fitnessFormArrayBe13 = this.formBuilder.array(fieldsArrayBe13);

            this.be13Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              employeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be13?.[0]?.id || 0],
              fitnessInputs: fitnessFormArrayBe13,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));
            const fieldsArrayBe14 = [];

            if (be14?.length) {
              for (let i = 0; i < be14.length; i++) {
                const be14Item = be14[i];
                fieldsArrayBe14.push(this.createFitnessInputBe14(be14Item));
              }
            } else {
              fieldsArrayBe14.push(this.createFitnessInputBe14({}));
            }

            const fitnessFormArrayBe14 = this.formBuilder.array(fieldsArrayBe14);

            this.be14Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              employeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be14?.[0]?.id || 0],
              fitnessInputs: fitnessFormArrayBe14,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));

            // this.be14Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   employeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be14?.relevance_id || '', Validators.required],
            //   design_involvement: [be14?.design_involvement === 1],
            //   issue_scope_inclusive: [be14?.issue_scope_inclusive === 1],
            //   timely_resolution: [be14?.timely_resolution === 1],
            //   active_communication: [be14?.active_communication === 1],
            //   confidentiality_protection: [be14?.confidentiality_protection === 1],
            //   responsibility_assigned: [be14?.responsibility_assigned === 1],
            //   independent_advice_access: [be14?.independent_advice_access === 1],
            //   full_information_during_process: [be14?.full_information_during_process === 1],
            //   consulted_on_changes: [be14?.consulted_on_changes === 1],
            //   feedback_requested: [be14?.feedback_requested === 1],
            //   performance_monitored: [be14?.performance_monitored === 1],
            //   feedback_included_in_assessment: [be14?.feedback_included_in_assessment === 1],
            //   improvements_implemented: [be14?.improvements_implemented === 1],
            //   employee_fitness_percentage: [be14?.employee_fitness_percentage ?? null],
            //   comments: [be14?.comments || ''],
            //   BEID: [be14?.id || 0]
            // }));
            const fieldsArrayBe20 = [];
            if (be20?.length) {
              for (let i = 0; i < be20.length; i++) {
                const be20Item = be20[i];
                fieldsArrayBe20.push(this.createFitnessInputBe20(be20Item));
              }
            } else {
              fieldsArrayBe20.push(this.createFitnessInputBe20({}));
            }

            const fitnessFormArrayBe20 = this.formBuilder.array(fieldsArrayBe20);

            this.be20Employee.push(this.formBuilder.group({
              employeeId: [employee.employee_id],
              employeeGroup: [employee.employee_group],
              employeeGroupId: [employee.group_id],
              employeeLocation: [employee.location],
              employeeNO: [employee.number_of_employees],
              employeeSite: [employee.site_name],
              siteLocation: [employee.site_location],
              siteIdManual: [employee.site_id_manual],
              BEID: [be20?.[0]?.id || 0],  // if multiple fitnessInputs exist
              fitnessInputs: fitnessFormArrayBe20,
              employeeYearMap: [this.createEmployeeYearMap(employee.year, employee.number_of_employees)]
            }));


            // this.be20Employee.push(this.formBuilder.group({
            //   employeeId: [employee.employee_id],
            //   employeeGroup: [employee.employee_group],
            //   employeeGroupId: [employee.group_id],
            //   employeeLocation: [employee.location],
            //   employeeNO: [employee.number_of_employees],
            //   employeeSite: [employee.site_name],
            //   siteLocation: [employee.site_location],
            //   siteIdManual: [employee.site_id_manual],
            //   relevance: [be20?.relevance_id || '', Validators.required],
            //   hotspot_assessment: [be20?.hotspot_assessment || false],
            //   hotspot_Procedures: [be20?.hotspot_Procedures || false],
            //   ethics_inplace: [be20?.ethics_inplace || false],
            //   ethics_positions: [be20?.ethics_positions || false],
            //   internal_breaches: [be20?.internal_breaches || false],
            //   internal_issues: [be20?.internal_issues || false],
            //   internal_employees: [be20?.internal_employees || false],
            //   internal_processes: [be20?.internal_processes || false],
            //   employee_fitness_percentage: [be20?.employee_fitness_percentage || 0],
            //   comments: [be20?.comments || ''],
            //   BEID: [be20?.id || 0]
            // }));


          });
        });
      }
    });
  }

  fetchSites() {
    this.isLoading = true;

    //  alert("ok")
    if (this.RoleID == 1) {
      this.company_id = 2
    } else {
      this.company_id = this.CompanyID

    }
    this.commonService.getData('list/sites/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        this.siteMasterList = response.data
        this.siteMasterList.forEach((site: any) => {
          this.sites.push(this.createSiteGroup(site));
        });
        let fetchEditData$: Observable<any>;

        fetchEditData$ = this.commonService.getData('be-listing/getSiteDetails');
        fetchEditData$.subscribe((res: any) => {
          if (res.success) {
            this.editData = res.data.sites;
          }

          this.be03Sites.clear();
          this.siteMasterList.forEach((site: { site_id: any; site_name: any; site_id_manual: any; location: any; }) => {
            const existingData = this.isEditMode == true
              ? this.editData?.find((d: any) => d.site_id === site.site_id)
              : null;
            const be01 = existingData?.be01_data ?? []; // take the first record if it exists
            // const be02 = existingData?.be02_data ?? [];
            const be02 = existingData?.be02_data ?? [];
            const be03 = existingData?.be03_data?.[0] ?? null;
            const be04 = existingData?.be04_data ?? [];
            const be05 = existingData?.be05_data ?? [];
            const be06 = existingData?.be06_data ?? [];
            const be07 = existingData?.be07_data ?? [];
            const be08 = existingData?.be08_data ?? [];
            const be09 = existingData?.be09_data ?? [];

            const be21 = existingData?.be21_data ?? []
            const be22 = existingData?.be22_data ?? []
            const be23 = existingData?.be23_data ?? [];

            const fieldsArrayBe01 = [];
            if (be01?.length) {
              for (let i = 0; i < be01?.length; i++) {
                const be01Item = be01[i];
                // console.log(be01Item, 'be01Item')

                fieldsArrayBe01.push(this.createFitnessInputBe01(be01Item));
              }
            } else {
              fieldsArrayBe01.push(this.createFitnessInputBe01({}));
            }
            const fitnessFormArrayBe01 = this.formBuilder.array(fieldsArrayBe01);
            this.be01Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              BEID: [be01?.id || 0],
              fitnessInputs: fitnessFormArrayBe01
            }));





            const fieldsArrayBe02 = [];
            if (be02?.length) {
              for (let i = 0; i < be02?.length; i++) {
                const be02Item = be02[i];
                // console.log(be02Item, 'be02Item')

                fieldsArrayBe02.push(this.createFitnessInputBe02(be02Item));

              }
            } else {
              fieldsArrayBe02.push(this.createFitnessInputBe02({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe02 = this.formBuilder.array(fieldsArrayBe02);
            this.be02Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              fitnessInputs: fitnessFormArrayBe02,

              BEID: [be02?.id || 0]
            }));

            this.be03Sites.clear();
            if (existingData?.be03_data?.length > 0) {
              existingData.be03_data.forEach((be03: any) => {
                this.be03Sites.push(this.formBuilder.group({
                  siteName: [site.site_name],
                  location: [site.location],
                  fitEntryId: [''],
                  id: [be03?.id || 0],
                  siteId: [be03?.site_id, [Validators.required]],
                  year: [be03?.year ? String(be03.year) : '', [Validators.required]],
                  naturalResource: [be03?.natural_resource || ''],
                  resourceID: [be03?.natural_resource_id || ''],
                  locations: [be03?.location || '', [Validators.pattern(/^[a-zA-Z ]*$/)]],
                  valueOfNaturalResource: [be03?.value_of_natural_resource || '', Validators.required],
                  relevance: [be03?.relevance_id || '', Validators.required],
                  resourceType: [be03?.resource_id || '', Validators.required],
                  commonFitnessCriteriaId: [be03?.common_fitness_criteria_id || null],
                  renewableRespectRegenerationRates: [be03?.renewable_respect_regeneration_rates || false],
                  renewableEcosystemHealth: [be03?.renewable_ecosystem_health || false],
                  renewableAquaticProtection: [be03?.renewable_aquatic_protection || false],
                  renewableInvasiveSpeciesControl: [be03?.renewable_invasive_species_control || false],
                  renewableNoDestructiveTechniques: [be03?.renewable_no_destructive_techniques || false],
                  renewableSourcingIndustryStandards: [be03?.renewable_sourcing_industry_standards || false],
                  animalWelfareMaintained: [be03?.animal_welfare_maintained || false],
                  animalNoEndangeredHunting: [be03?.animal_no_endangered_hunting || false],
                  animalSourcingstandards: [be03?.animalSourcingstandards || false],
                  nonrenewableSourcingIndustryStandards: [be03?.nonrenewable_sourcing_industry_standards || false],
                  nonrenewableNoConflictOrHrViolation: [be03?.nonrenewable_no_conflict_or_hr_violation || false],
                  nonrenewableNoDestructiveExtraction: [be03?.nonrenewable_no_destructive_extraction || false],
                  nonrenewableEcosystemHealthMaintained: [be03?.nonrenewable_ecosystem_health_maintained || false],
                  nonrenewableEcosystemProductionImpactControl: [be03?.nonrenewable_ecosystem_production_impact_control || false],
                  resourceFitnessPercent: [be03?.resource_fitness_percent ? `${be03.resource_fitness_percent}%` : null],
                  contextDescription: [be03?.context_description || ''],
                  // resourceFitnessPercent: [be03?.resource_fitness_percent || ''],
                  comments: [be03?.comments || ''],

                  BEID: [be03?.id || 0]
                }));
              });
            } else {

              this.be03Sites.push(this.formBuilder.group({
                siteName: [site.site_name],
                location: [site.location],
                fitEntryId: [''],
                id: [0],
                siteId: ['', [Validators.required]],
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
                contextDescription: [''],
                comments: [''],
                BEID: [0]
              }));
            }




            const fieldsArrayBe05 = [];
            if (be05?.length) {
              for (let i = 0; i < be05?.length; i++) {
                const be05Item = be05[i];
                // console.log(be05Item, 'be05Item')

                fieldsArrayBe05.push(this.createFitnessInputBe05(be05Item));

              }
            } else {
              fieldsArrayBe05.push(this.createFitnessInputBe05({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe05 = this.formBuilder.array(fieldsArrayBe05);

            this.be05Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              fitnessInputs: fitnessFormArrayBe05,

              BEID: [be05?.id || 0]
            }));

            const fieldsArrayBe06 = [];
            if (be06?.length) {
              for (let i = 0; i < be06?.length; i++) {
                const be06Item = be06[i];
                // console.log(be06Item, 'be06Item')

                fieldsArrayBe06.push(this.createFitnessInputBe06(be06Item));

              }
            } else {
              fieldsArrayBe06.push(this.createFitnessInputBe06({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe06 = this.formBuilder.array(fieldsArrayBe06);
            this.be06Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              fitnessInputs: fitnessFormArrayBe06,

              BEID: [be06?.id || 0]
            }));

            const fieldsArrayBe07 = [];
            if (be07?.length) {
              for (let i = 0; i < be07?.length; i++) {
                const be07Item = be07[i];
                // console.log(be07Item, 'be07Item')

                fieldsArrayBe07.push(this.createFitnessInputBe07(be07Item));

              }
            } else {
              fieldsArrayBe07.push(this.createFitnessInputBe07({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe07 = this.formBuilder.array(fieldsArrayBe07);
            this.be07Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              fitnessInputs: fitnessFormArrayBe07,

              BEID: [be07?.id || 0]
            }));

            const fieldsArrayBe08 = [];
            if (be08?.length) {
              for (let i = 0; i < be08?.length; i++) {
                const be08Item = be08[i];


                fieldsArrayBe08.push(this.createFitnessInputBe08(be08Item));

              }
            } else {
              fieldsArrayBe08.push(this.createFitnessInputBe08({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe08 = this.formBuilder.array(fieldsArrayBe08);
            this.be08Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site.site_id],
              fitnessInputs: fitnessFormArrayBe08,

              BEID: [be08?.id || 0]
            }));

            const fieldsArrayBe09 = [];
            if (be09?.length) {
              for (let i = 0; i < be09?.length; i++) {
                const be09Item = be09[i];
                // console.log(be09Item, 'be09Item')

                fieldsArrayBe09.push(this.createFitnessInputBe09(be09Item));

              }
            } else {
              fieldsArrayBe09.push(this.createFitnessInputBe09({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe09 = this.formBuilder.array(fieldsArrayBe09);
            this.be09Sites.push(this.formBuilder.group({
              siteName: [site.site_name],
              siteId: [site.site_id_manual],
              location: [site.location],
              site_id: [site?.site_id],
              fitnessInputs: fitnessFormArrayBe09,

              BEID: [be09?.id || 0]
            }));

            const fieldsArrayBe21 = [];
            if (be21?.length) {
              for (let i = 0; i < be21?.length; i++) {
                const be21Item = be21[i];
                // console.log(be21Item, 'be21Item')

                fieldsArrayBe21.push(this.createFitnessInputBe21(be21Item));

              }
            } else {
              fieldsArrayBe21.push(this.createFitnessInputBe21({}));; // Push an empty object if no data exists
            }
            const fitnessFormArrayBe21 = this.formBuilder.array(fieldsArrayBe21);
            this.be21Sites.push(this.formBuilder.group({
              fitnessInputs: fitnessFormArrayBe21,
            }));
            const fieldsArrayBe22 = [];
            if (be22?.length) {
              for (let i = 0; i < be22?.length; i++) {
                const be22Item = be22[i];
                // console.log(be21Item, 'be21Item')

                fieldsArrayBe22.push(this.createFitnessInputBe22(be22Item));

              }
            } else {
              fieldsArrayBe22.push(this.createFitnessInputBe22({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe22 = this.formBuilder.array(fieldsArrayBe22);
            this.be22Sites.push(this.formBuilder.group({
              fitnessInputs: fitnessFormArrayBe22,

              BEID: [be22?.id || 0]
            }));

          });
          this.isLoading = false;
        });

      }
    });


  }

  _oldfetchPurchase() {
    // be04 added by uzair om 22_08_2025

    this.commonService.getData('list/be04_category').subscribe((response) => {
      if (response.status === true) {
        this.be04Tabs = response.data
        // console.log(this.be004Tabs,'----be004Tabs----');
      }
    });

    this.commonService.getData('list/getPurchase/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        const purchaseMaster = response.data



        purchaseMaster.forEach((purchase: {
          purchase_information_id: any;
          purchase: any;
          purchase_id: any;
          cost: any;
          purchase_type: any;
        }) => {
          const existingData = this.isEditMode
            ? this.editData?.find((d: any) => d.purchase_information_id === purchase.purchase_information_id)
            : null;

          const be04 = existingData?.be04_data ?? [];

          //  Explicit typing
          const fieldsArrayBe04: FormGroup[] = [];

          if (be04?.length) {
            for (let i = 0; i < be04.length; i++) {
              const be04Item = be04[i];
              fieldsArrayBe04.push(this.createFitnessInputBe04(be04Item));
            }
          } else {
            fieldsArrayBe04.push(this.createFitnessInputBe04({ purchase_information_id: purchase.purchase_information_id }));
          }

          //  category-wise array
          // const categoriesFormArray = this.formBuilder.array(
          //   this.be04Tabs.map(() =>
          //     this.formBuilder.group({
          //       fitnessInputs: this.formBuilder.array(fieldsArrayBe04)
          //     })
          //   )
          // );
          const categoriesFormArray = this.formBuilder.array(
            this.be04Tabs.map(() =>
              this.formBuilder.group({
                fitnessInputs: this.formBuilder.array(
                  fieldsArrayBe04.map(fi => this.createFitnessInputBe04(fi.value))
                )
              })
            )
          );

          this.be04Sites.push(
            this.formBuilder.group({
              Purchase: [purchase.purchase],
              Purchase_id: [purchase.purchase_id],
              Cost: [purchase.cost],
              PurchaseType: [purchase.purchase_type],
              BEID: [be04?.id || 0],
              categories: categoriesFormArray   // use category-wise here
            })
          );
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
    const renewable = siteGroup.get('renewableEnergyUsed')?.value;
    const total = siteGroup.get('totalEnergyUsed')?.value;

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
        totalRenewable += Number(site.get('renewableEnergyUsed')?.value);
        totalEnergy += Number(site.get('totalEnergyUsed')?.value);
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
  createProductYearMap(yearString: string, revenueString: string): Record<string, number> {
    if (!yearString || !revenueString) return {};

    const years = yearString.split(',').map(y => y.trim());
    const revenues = revenueString.split(',').map(r => r.trim());

    const map: Record<string, number> = {};

    years.forEach((year, i) => {
      const revenueValue = parseFloat(revenues[i] || '0');
      if (year && !isNaN(revenueValue)) {
        map[year] = revenueValue;
      }
    });

    return map;
  }
  onSubmit() {
    this.loading = true;
    this.siteForm.controls['CompanyName'].markAsTouched()
    this.siteForm.controls['CompanyNumber'].markAsTouched()
    this.siteForm.controls['CompanyEmail'].markAsTouched()
    // this.siteForm.controls['NRAScore'].markAsTouched()

    this.siteForm.controls['CompanyAddress'].markAsTouched()
    // this.siteForm.controls['ExternalTreatScore'].markAsTouched()
    this.siteForm.controls['FirstName'].markAsTouched()
    this.siteForm.controls['LastName'].markAsTouched()
    // this.siteForm.controls['riskOwners'].markAsTouched()
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
  oldselectItem(item: string) {
    if (this.byURLSelected) {
      this.selected = this.byURLSelected;
    } else {
      this.selected = item;
    }
  }
  selectItem(item: string) {
    const lastSelected = this.selected; // the form user is leaving
    const currentForm = this.getFormByStepIndexTest(lastSelected);

    // find which step the new item belongs to
    let stepIndex: number | null = null;
    if (this.siteSidebarItems.includes(item)) stepIndex = 0;
    else if (this.supplyChainSidebarItems.includes(item)) stepIndex = 1;

    else if (this.employeeSidebarItems.includes(item)) stepIndex = 2;
    else if (this.productSidebarItems.includes(item)) stepIndex = 3;
    else if (this.governanceSidebarItems.includes(item)) stepIndex = 4;

    if (currentForm && currentForm.dirty && !this.globalFlagService.isSubmitted()) {
      Swal.fire({
        title: 'Unsaved changes',
        text: 'You have unsaved changes. Do you really want to change selection?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, discard changes',
        cancelButtonText: 'Stay on this step',
        // reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          currentForm.markAsPristine();
          this.performSelectItem(item);
        } else {

          return;
        }
      });
    } else {

      this.performSelectItem(item);

    }
  }



  // =====

  private performSelectItem(item: string) {
    if (this.byURLSelected) {
      this.selected = this.byURLSelected;
    } else {
      this.selected = item;
    }
  }

  handleFormSubmission(event: { fitEntryId: number, nextForm: string }) {
    const { fitEntryId, nextForm } = event;
    this.fitEntryId = fitEntryId;
    this.selected = nextForm; // switch to next form dynamically
  }

  getSelectedGoal(type: any) {
    if (this.BEData && this.selected) {
      if (type === 'site' && Array.isArray(this.BEData.sites)) {
        // console.log('Fetching site data', this.BEData.sites.find((goal: { goal_code: string; }) => goal.goal_code == this.selected));
        return this.BEData.sites.find((goal: { goal_code: string; }) => goal.goal_code == this.selected);
      }


      else if (type === 'employee' && Array.isArray(this.BEData.employees)) {
        return this.BEData.employees.find((goal: { goal_code: string; }) => goal.goal_code == this.selected);
      } else if (type === 'product' && Array.isArray(this.BEData.products)) {
        return this.BEData.products.find((goal: { goal_code: string; }) => goal.goal_code == this.selected);
      }
      else if (type === 'governance' && Array.isArray(this.BEData.products)) {
        return this.BEData.products.find(
          (goal: { goal_code: string }) => goal.goal_code == this.selected
        );
      }
      else if (type === 'supplyChain' && Array.isArray(this.BEData.sites)) {
        return this.BEData.sites.find(
          (goal: any) => goal.goal_code == this.selected
        );
      }





    }
    // return this.BEData.find((goal: { goal_code: string; }) => goal.goal_code === this.selected);
  }

  goBack() {
    // Add your logic
  }
  setMonthAndYear(normalizedDate: Date, datepicker: MatDatepicker<Date>) {
    const momentDate = moment(normalizedDate);  // Convert to Moment object
    // console.log(momentDate.format('YYYY-MM'));
    this.BasicFitForm.get('FitMonthYear')?.setValue(momentDate.format('YYYY-MM'));  // Set only month-year
    this.BasicFitForm.controls['FitMonthYear'].updateValueAndValidity();
    this.selectedMonthYear = momentDate.format('MMMM YYYY');
    // console.log(this.BasicFitForm.value, 'form value')
    datepicker.close();  // Close the picker after selection
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


  loadExistingData() {
    this.loading = true;
    this.commonService.getData(`be-listing/getBasicDetails`).subscribe(
      (response) => {
        if (response.status == true) {
          // console.log('Response data:', response.status);
          // Populate BasicFitForm
          // console.log('Response data of name:', response.data[0].future_fit_name);
          this.BasicFitForm.controls['FutureFitName'].setValue(response.data[0].future_fit_name);
          this.BasicFitForm.controls['FitMonthYear'].setValue(response.data[0].fit_year + response.data[0].fit_month);



          this.loading = false;
        }
      },
      (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    );
  }

  // private populateFormArray(formArray: FormArray, data: any[]) {
  //   formArray.clear();
  //   data.forEach(item => {
  //     const group = this.formBuilder.group({ ...}); // Create group with item data
  //     formArray.push(group);
  //   });
  // }
  ngAfterViewInit(): void {
    setTimeout(() => {

      this.byURLSelected = null;
      this.byURLStepSelected = 0;
    }, 5000);
  }

  fetchPurchase() {
    // alert("ok")

    this.commonService.getData('list/be04_category').subscribe((response) => {
      if (response.status === true) {
        this.be04Tabs = response.data;
      }
    });

    this.commonService.getData('list/getPurchase/' + this.company_id).subscribe((response) => {
      if (response.status === true) {
        const purchaseMaster = response.data;


        purchaseMaster.forEach((purchase: {
          purchase_information_id: any;
          purchase: any;
          purchase_id: any;
          cost: any;
          year: any;
          purchase_type: any;
        }) => {

          let fetchEditData$: Observable<any>;

          fetchEditData$ = this.commonService.getData('be-listing/getPurchaseDetails');
          fetchEditData$.subscribe((res: any) => {
            if (res.success) {
              this.editDataPurchase = res.data.purchase;
            }
            const existingData = this.isEditMode
              ? this.editDataPurchase?.find((d: any) => d.purchase_information_id === purchase.purchase_information_id)
              : null;
            const be04 = existingData?.be04_data ?? [];
            const baseFitnessInputs: FormGroup[] = [];

            if (be04?.length) {
              for (let i = 0; i < be04.length; i++) {
                baseFitnessInputs.push(this.createFitnessInputBe04(be04[i]));
              }
            } else {
              baseFitnessInputs.push(
                this.createFitnessInputBe04({ purchase_information_id: purchase.purchase_information_id })
              );
            }

            const categoriesFormArray = this.formBuilder.array(
              this.be04Tabs.map((tab: any) => {
                let categoryInputs: FormGroup[];
                if (be04?.length) {
                  const matches = be04.filter((item: any) => item.category_id === tab.id);
                  if (matches.length) {
                    categoryInputs = matches.map((item: any) => this.createFitnessInputBe04(item));
                  } else {

                    categoryInputs = [
                      this.createFitnessInputBe04({
                        purchase_information_id: purchase.purchase_information_id,
                        category_id: tab.id
                      })
                    ];
                  }
                } else {

                  categoryInputs = [
                    this.createFitnessInputBe04({
                      purchase_information_id: purchase.purchase_information_id,
                      category_id: tab.id
                    })
                  ];
                }
                return this.formBuilder.group({
                  categoryId: [tab.id],
                  categoryName: [tab.name],
                  fitnessInputs: this.formBuilder.array(categoryInputs)
                })
              })
            );


            this.be04Sites.push(
              this.formBuilder.group({
                Purchase: [purchase.purchase],
                Purchase_id: [purchase.purchase_id],
                Purchase_information_id: [purchase.purchase_information_id],
                Cost: [purchase.cost],
                PurchaseType: [purchase.purchase_type],
                BEID: [be04?.id || 0],
                categories: categoriesFormArray,
                employeeYearMap: [this.createPurchaseYearMap(purchase.year, purchase.cost)]
              })
            );
          });
        });
      }
    });
  }

  createPurchaseYearMap(years: string, costs: string): { [key: number]: string } {
    const yearArr = years ? years.split(',') : [];
    const costArr = costs ? costs.split(',') : [];
    const map: { [key: number]: string } = {};

    for (let i = 0; i < yearArr.length; i++) {
      const year = parseInt(yearArr[i]);
      if (!isNaN(year)) {
        const cost = costArr[i]?.trim() || '0';
        map[year] = (cost == '0' || cost == '' ? '' : cost);
      }
    }

    return map;
  }


  fetchFinancial() {

    this.commonService.getData('list/be04_category').subscribe((response) => {
      if (response.status == true) {
        this.be04Tabs = response.data;
      }
    });


    this.commonService.getData('list/getFinanicialAsset/' + this.company_id)
      .subscribe((response: any) => {
        if (response.status === true) {
          const financialMaster = response.data;


          financialMaster.forEach((financial: {
            finanical_id: any;
            financial_asset: any;
            financial_asset_id: any;
            monetary_value: any;
            reporting_period: any;
            year: any;
            purchase_date: any;
            sale_date: any;
          }) => {

            let fetchEditData$: Observable<any>;
            fetchEditData$ = this.commonService.getData('be-listing/getFinancialDetails');
            fetchEditData$.subscribe((res: any) => {
              if (res.success) {
                this.editDataFinancial = res.data.financialAssets;
              }

              const existingData = this.isEditMode
                ? this.editDataFinancial?.find((d: any) => d.finanical_id == financial.finanical_id)
                : null;

              const be23 = existingData?.be23_data ?? [];

              const baseFitnessInputs: FormGroup[] = [];
              if (be23?.length) {
                for (let i = 0; i < be23.length; i++) {
                  baseFitnessInputs.push(this.createFitnessInputBe23(be23[i]));
                }
              } else {
                baseFitnessInputs.push(
                  this.createFitnessInputBe23({ finanical_id: financial.finanical_id })
                );
              }

              const categoriesFormArray = this.formBuilder.array(
                this.be04Tabs.map((tab: any) => {
                  let categoryInputs: FormGroup[];

                  if (be23?.length) {
                    const matches = be23.filter((item: any) => item.category_id === tab.id);
                    if (matches.length) {
                      categoryInputs = matches.map((item: any) => this.createFitnessInputBe23(item));
                    } else {
                      categoryInputs = [
                        this.createFitnessInputBe23({
                          finanical_id: financial.finanical_id,
                          category_id: tab.id
                        })
                      ];
                    }
                  } else {
                    categoryInputs = [
                      this.createFitnessInputBe23({
                        finanical_id: financial.finanical_id,
                        category_id: tab.id
                      })
                    ];
                  }

                  return this.formBuilder.group({
                    categoryId: [tab.id],
                    categoryName: [tab.name],
                    fitnessInputs: this.formBuilder.array(categoryInputs)
                  });
                })
              );

              this.be23Products.push(
                this.formBuilder.group({
                  financialAsset: [financial.financial_asset],
                  financialAssetId: [financial.financial_asset_id],
                  finanicalId: [financial.finanical_id],
                  monetaryValue: [financial.monetary_value],
                  // reportingPeriod: [financial.reporting_period],
                  reportingPeriod: [
                    this.calculateReportingPeriodInDays(financial.purchase_date, financial.sale_date)
                  ],
                  BEID: [be23?.id || 0],
                  categories: categoriesFormArray,
                  financialDateMap: [
                    this.createFinancialDateMap(financial.year, financial.monetary_value)
                  ],

                })
              );
              // console.log(this.be23Products, '----be23Products----')
            });

          });
        }
      });
  }


  createFitnessInputBe04(data?: any): FormGroup {
    const normalizedCost =
      data?.cost == 0 || data?.cost == '0' || data?.cost == null ? '' : data?.cost;

    const year = data?.year ? new Date(data.year, 0, 1) : '';
    // console.log(year, 'data -- 1737')
    return this.formBuilder.group({
      id: [data?.id || 0],
      //  year: [data?.year || new Date().getFullYear()],
      year: [year, [Validators.required]],
      fitnessCost: [normalizedCost],
      relevance: [data?.relevance_id || '', Validators.required],
      purchaseDoesNotUsePhase: [data?.purchase_does_not_use_phase || false],
      hotspotConducted: [data?.hotspot_conducted || false],
      potentialHotspot: [data?.potential_hotspot || false],
      actualHotspots: [data?.actual_hotspot || false],
      allHighIntensityHotspots: [data?.all_high_intensity_hotspot || false],
      allHotspotsHaveBeenAvoided: [data?.all_hotspot_have_been_avoided || false],
      allHotspotFromCardle: [data?.all_hotspot_from_cradle || false],
      companyContinuously: [data?.company_continuosly || false],
      purchaseFitness: [data?.purchase_fitness != null ? `${data?.purchase_fitness}%` : null],
      comments: [data?.comments || ''],
      contextDescription: [data?.context_description || ''],
      purchase_information_id: [data?.purchase_information_id || 0],
      categoryId: [data?.category_id || null],


    });
  }
  createFitnessInputBe23(data?: any): FormGroup {
    // console.log("be23"+data); 
    // const dateString =  data?.year ? data.year : '';
    // const normalizedMonetaryValue =
    //   data?.monetaryValue == 0 ||
    //     data?.monetaryValue == '0' ||
    //     data?.monetaryValue == null
    //     ? ''
    //     : data?.monetaryValue;

    const year = data?.year ? new Date(data.year, 0, 1) : '';
    const normalizedMonetaryValue =
      data?.monetary == 0 ||
        data?.monetary == '0' ||
        data?.monetary == null
        ? ''
        : data?.monetary;

    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [year, [Validators.required]],
      monetaryValue: [normalizedMonetaryValue],
      relevance: [data?.relevance_id || '', Validators.required],
      financialAssetDoes: [data?.financial_asset_does || false],
      hotspotAssessment: [data?.hotspot_assessmen || false],
      potentialHotspotsIdentified: [data?.potential_hotspots_identified || false],
      actualHotspots: [data?.actual_hotspots || false],
      allHighIntensityHotspot: [data?.all_high_intensity_hotspot || false],
      allHotspotsHaveBeen: [data?.all_hotspots_have_been || false],

      financialFitness: [data?.financial_fitness != null ? `${data?.financial_fitness}%` : null],
      comments: [data?.comments || ''],
      contextDescription: [data?.context_description || ''],
      finanical_id: [data?.finanical_id || 0],
      categoryId: [data?.category_id || null],
    });
  }

  createFinancialDateMap(dates: string, values: string) {
    const dateArr = dates?.split(',') || [];
    const valueArr = values?.split(',') || [];
    const map: Record<string, number> = {};

    dateArr.forEach((date, i) => {
      const trimmedDate = date?.trim();
      const numericValue = parseFloat(valueArr[i]) || 0;
      if (trimmedDate) {
        map[trimmedDate] = numericValue;
      }
    });

    return map;
  }


  private calculateReportingPeriodInDays(
    purchaseDate: string | Date | null,
    saleDate?: string | Date | null,
    year?: number
  ): number {
    if (!purchaseDate) return 0;

    const activeYear = year ?? new Date().getFullYear();
    const parseDate = (date: string | Date): Date => {
      if (date instanceof Date) return date;
      if (typeof date === 'string' && date.trim() !== '') {
        const normalized = date.trim().replace(/-/g, '/');
        const parts = normalized.split(/[\/\-]/);
        let d, m, y;
        if (parts[0].length === 4) {
          [y, m, d] = parts.map(Number);
        } else {
          [d, m, y] = parts.map(Number);
        }
        return new Date(y, m - 1, d);
      }
      return new Date();
    };

    const purchase = parseDate(purchaseDate);
    const startOfYear = new Date(activeYear, 0, 1);
    const endOfYear = new Date(activeYear, 11, 31);


    const startDate = purchase < startOfYear ? startOfYear : purchase;


    const endDate =
      saleDate && saleDate !== null && saleDate !== undefined && saleDate !== ''
        ? parseDate(saleDate)
        : endOfYear;


    if (endDate < startDate) return 0;


    const diffInMs = endDate.getTime() - startDate.getTime();
    let diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));


    if (!saleDate || saleDate === null || saleDate === undefined || saleDate === '') {
      diffInDays += 1;
    }

    return diffInDays;
  }









  createFitnessInputBe01(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      //  year: [data?.year || new Date().getFullYear()],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      renewableEnergyUsed: [data?.amount_of_renewable_energy_used || ''],
      totalEnergyUsed: [data?.total_amount_of_energy_used || ''],
      siteFitness: [data?.site_fitness != null ? `${data.site_fitness}%` : null],
      //siteFitness: [data?.site_fitness || ''],
      comments: [data?.comments || ''],

    });
  }
  createFitnessInputBe02(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      relevance: [data?.relevance_id || '', Validators.required],
      relevance1: [data?.Relevance_id_2 || '', Validators.required],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      fitWaterVolume: [data?.water_consumption_fit_sources ?? 0],
      unfitWaterVolume: [data?.water_consumption_unfit_sources ?? 0],
      commercialOffset: [data?.commercial_water_consumption_offset ?? 0],
      workerFitWater: [data?.water_consumed_by_workers_fit_sources ?? 0],
      workerUnfitWater: [data?.water_consumed_by_workers_unfit_sources ?? 0],
      commercialFit: [data?.commercial_water_consumption_fit_source ?? 0],
      commercialUnfit: [data?.commercial_water_consumption_unfit_source ?? 0],
      commercialTotal: [data?.total_commercial_water_consumption ?? 0],
      //  siteFitness: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],

      siteFitness: [data?.site_fitness != null ? `${data.site_fitness}%` : null],
      siteFitness1: [data?.site_fitness1 != null ? `${data.site_fitness1}%` : null],
      dischargeRelevance: [data?.fit_discharged_water || ''],
      fitDischarged: [data?.total_discharged_water ?? 0],
      totalDischarged: [0],
      contextDescription: [data?.context_description || ''],
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe05(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevanceGaseous: [data?.relevance_id_gaseous || '', Validators.required],
      gaseousReferenceYear: [data?.gaseous_reference_year || null],
      gaseousReportingYear: [data?.gaseous_reporting_year || null],
      gaseousSiteFitnessPercent: [data?.gaseous_site_fitness_percent != null
        ? Math.round(parseFloat(data.gaseous_site_fitness_percent)) + '%'
        : null],
      relevanceLiquid: [data?.relevance_id_liquid || '', Validators.required],
      liquidReferenceYear: [data?.liquid_reference_year || null],
      liquidReportingYear: [data?.liquid_reporting_year || null],
      liquidSiteFitnessPercent: [data?.liquid_site_fitness_percent != null
        ? Math.round(parseFloat(data.liquid_site_fitness_percent)) + '%'
        : null],
      relevanceSolid: [data?.relevance_id_solid || '', Validators.required],
      solidReferenceYear: [data?.solid_reference_year || null],
      solidReportingYear: [data?.solid_reporting_year || null],
      solidSiteFitnessPercent: [data?.solid_site_fitness_percent != null
        ? Math.round(parseFloat(data.solid_site_fitness_percent)) + '%'
        : null],
      liquidemissionyear: [''],
      Solidemissionyear: [''],
      Gaseousemissionyear: [''],
      contextDescription: [data?.context_description || ''],
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe06(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      ghgReferenceYear: [data?.ghg_reference_year || null],
      ghgReportingYear: [data?.ghg_reporting_year || null],
      ghgAdequatelyOffset: [data?.ghg_adequately_offset || null],
      //  siteFitness: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],

      siteFitnessPercent: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],
      NOGHGemissionsAreReleased: [data?.no_ghg_emission_id || ''],
      comments: [data?.comments || ''],
      GHGemissionsyear: [''],
    });
  }
  createFitnessInputBe07(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      site_assessed_waste_id: [data?.site_assessed_waste_id || ''],
      waste_reference_year: [data?.waste_reference_year || null],
      waste_reporting_year: [data?.waste_reporting_year || null],
      //  siteFitness: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],
      site_fitness_percent: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],
      comments: [data?.comments || ''],
      wastegeneratedyear: [''],
    });
  }
  createFitnessInputBe08(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      siteArea: [data?.site_area || null],
      localImpactIdentified: [data?.local_impact_identified || false],
      valueAreaIdentified: [data?.value_area_identified || false],
      valueAreaProtected: [data?.value_area_protected || false],
      noImpactOnPristineEcosystems: [data?.no_impact_on_pristine_ecosystems || false],
      landRightsUncontested: [data?.land_rights_uncontested || false],
      communityConsentObtained: [data?.community_consent_obtained || false],
      pastDamageNeutralized: [data?.past_damage_neutralized || false],
      siteFitness: [data?.site_fitness_percent != null ? `${data.site_fitness_percent}%` : null],
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe09(data?: any): FormGroup {
    return this.formBuilder.group({
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
      contextDescription: [data?.context_description || ''],
      community_consultation_prior_activities: [data?.community_consultation_prior_activities || false],
      // site_fitness_percentage: [data?.site_fitness_percentage || null],
      // site_fitness_percentage: [data?.site_fitness_percentage != null ? (data.site_fitness_percentage * 100).toFixed(2) + '%' : null],
      site_fitness_percentage: [
        data?.site_fitness_percentage != null
          ? Math.round(parseFloat(data.site_fitness_percentage)) + '%'
          : null
      ],


      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe21(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      companyis_mnc: [data?.companyis_mnc || false],
      not_relevant_for_nonprofit: [data?.not_relevant_for_nonprofit || false],
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
      comments: [data?.comments || '']
    });
  }

  createFitnessInputBe22(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      amount_contributed_toLobby: [data?.amount_contributed_toLobby || ''],
      lobbying_seek_to_influence: [data?.Lobbying_seek_to_influence || false],
      lobbying_supporting_individuals: [data?.Lobbying_supporting_individuals || false],
      lobbying_specific_positions: [data?.Lobbying_specific_positions || false],
      lobbying_all_departments: [data?.Lobbying_all_departments || false],

      contributions_directly_undertake: [data?.contributions_directly_undertake || false],
      contributions_diligence_before: [data?.contributions_diligence_before || false],
      contributions_recipient_engages: [data?.contributions_recipient_engages || false],
      contributions_due_diligence: [data?.contributions_due_diligence || false],
      contributions_regular_review: [data?.contributions_regular_review || false],
      contributions_clear_guidance: [data?.contributions_clear_guidance || false],

      disclosure_recipient_name: [data?.disclosure_recipient_name || false],
      disclosure_amount: [data?.disclosure_amount || false],
      disclosure_date_of_contribution: [data?.disclosure_date_of_contribution || false],
      disclosure_company_raised: [data?.disclosure_company_raised || false],
      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe10(data?: any): FormGroup {

    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      hazardControlsInPlace: [data?.hazard_controls_in_place == 1],
      riskAssessmentDone: [data?.risk_assessment_done == 1],
      riskTrainingProvided: [data?.risk_training_provided == 1],
      safetyPoliciesMonitored: [data?.safety_policies_monitored == 1],
      antiBullyingPolicy: [data?.anti_bullying_policy == 1],
      flexibleWorkConditions: [data?.flexible_work_conditions == 1],
      stressGuidanceAccess: [data?.stress_guidance_access == 1],
      healthIssueSupportPolicy: [data?.health_issue_support_policy == 1],
      smokeFreeWorkEnvironment: [data?.smoke_free_work_environment == 1],
      smokeFreeCommunalAreas: [data?.smoke_free_communal_areas == 1],
      healthyEatingAccess: [data?.healthy_eating_access == 1],
      workBreaksAllowed: [data?.work_breaks_allowed == 1],
      contextDescription: [data?.context_description || ''],
      contextDescription1: [data?.context_description1 || ''],
      flexibleBreaksForExercise: [data?.flexible_breaks_for_exercise == 1],
      siteFitness: [data?.site_fitness != null ? `${data.site_fitness}%` : null],
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe11(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      number_of_employees_living_wage: [data?.number_of_employees_living_wage ?? null],
      employee_fitness_percentage: [data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe12(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      no_child_labour: [data?.no_child_labour == 1],
      fair_employment_status: [data?.fair_employment_status == 1],
      freedom_of_association: [data?.freedom_of_association == 1],
      fair_working_hours: [data?.fair_working_hours == 1],
      overtime_compensation: [data?.overtime_compensation == 1],
      right_to_refuse_irregular_work: [data?.right_to_refuse_irregular_work == 1],
      reasonable_schedule_notice: [data?.reasonable_schedule_notice == 1],
      holiday_entitlement: [data?.holiday_entitlement == 1],
      weekly_rest_day: [data?.weekly_rest_day == 1],
      maternity_paternity_leave: [data?.maternity_paternity_leave == 1],
      employee_fitness_percentage: [data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe13(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      clear_policy_commitment: [data?.clear_policy_commitment === 1],
      senior_official_responsible: [data?.senior_official_responsible === 1],
      policy_communicated: [data?.policy_communicated === 1],
      policy_in_hr_practices: [data?.policy_in_hr_practices === 1],
      reporting_procedure_available: [data?.reporting_procedure_available === 1],
      actions_and_feedback_documented: [data?.actions_and_feedback_documented === 1],
      control_effectiveness_assessed: [data?.control_effectiveness_assessed === 1],
      controls_adjusted_if_needed: [data?.controls_adjusted_if_needed === 1],
      employee_fitness_percentage: [data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe14(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      design_involvement: [data?.design_involvement === 1],
      issue_scope_inclusive: [data?.issue_scope_inclusive === 1],
      timely_resolution: [data?.timely_resolution === 1],
      active_communication: [data?.active_communication === 1],
      confidentiality_protection: [data?.confidentiality_protection === 1],
      responsibility_assigned: [data?.responsibility_assigned === 1],
      independent_advice_access: [data?.independent_advice_access === 1],
      full_information_during_process: [data?.full_information_during_process === 1],
      consulted_on_changes: [data?.consulted_on_changes === 1],
      feedback_requested: [data?.feedback_requested === 1],
      performance_monitored: [data?.performance_monitored === 1],
      feedback_included_in_assessment: [data?.feedback_included_in_assessment === 1],
      improvements_implemented: [data?.improvements_implemented === 1],
      employee_fitness_percentage: [data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe20(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      relevance: [data?.relevance_id || '', Validators.required],
      fitnessnumber_of_employees: [data?.number_of_employees || null],
      hotspot_assessment: [data?.hotspot_assessment === 1],
      hotspot_Procedures: [data?.hotspot_Procedures === 1],
      ethics_inplace: [data?.ethics_inplace === 1],
      ethics_positions: [data?.ethics_positions === 1],
      internal_breaches: [data?.internal_breaches === 1],
      internal_issues: [data?.internal_issues === 1],
      internal_employees: [data?.internal_employees === 1],
      internal_processes: [data?.internal_processes === 1],

      employee_fitness_percentage: [
        data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null
      ],

      comments: [data?.comments || '']
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
        let fetchEditData$: Observable<any>;
        if (this.isEditMode) {
          fetchEditData$ = this.commonService.getData('be-listing/getProductDetails/' + this.company_id + '/' + this.routeId);
        } else {
          fetchEditData$ = of({ success: false });
        }
        fetchEditData$.subscribe((res: any) => {
          if (res.success) {
            this.editData2 = res.data.products;
          }
          // this.productsMasterList.forEach((products: any) => {
          //   this.sites.push(this.createProductGroup(products));
          // });
          this.productsMasterList.forEach((product: { product_id: any; year: any; product_typename: any; product_name: any; product_id_manual: any; revenue_cost: any; user_group: any; user_group_id: any }) => {
            const existingData = this.isEditMode == true
              ? this.editData2?.find((d: any) => d.product_id == product.product_id)
              : null;
            // console.log(existingData, "BE15 Data")
            const be15 = existingData?.be15_data ?? []; // take the first record if it exists
            const be16 = existingData?.be16_data ?? [];
            const be17 = existingData?.be17_data ?? [];
            const be18 = existingData?.be18_data ?? [];
            const be19 = existingData?.be19_data ?? [];
            // const be20 = existingData?.be020_data?.[0] ?? null;
            // const be21 = existingData?.be021_data?.[0] ?? null;
            // const be22 = existingData?.be022_data?.[0] ?? null;
            const fieldsArrayBe17 = [];
            if (be17?.length) {
              for (let i = 0; i < be17?.length; i++) {
                const be17Item = be17[i];
                // console.log(be17Item, 'be17Item')

                fieldsArrayBe17.push(this.createFitnessInputBe17(be17Item));

              }
            } else {
              fieldsArrayBe17.push(this.createFitnessInputBe17({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe17 = this.formBuilder.array(fieldsArrayBe17);
            this.be17Products.push(this.formBuilder.group({
              product_id: [product.product_id],
              productType: [product.product_typename],
              productName: [product.product_name],
              productId: [product.product_id_manual],
              revenueCost: [product.revenue_cost],
              userGroup: [product.user_group],
              userGroupId: [product.user_group_id],
              fitnessInputs: fitnessFormArrayBe17,
              BEID: [be17?.id || 0],
              productYearMap: [this.createProductYearMap(product.year, product.revenue_cost)],

            }));

            const fieldsArrayBe18 = [];
            if (be18?.length) {
              for (let i = 0; i < be18?.length; i++) {
                const be18Item = be18[i];
                // console.log(be18Item, 'be18Item')

                fieldsArrayBe18.push(this.createFitnessInputBe18(be18Item));

              }
            } else {
              fieldsArrayBe18.push(this.createFitnessInputBe18({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe18 = this.formBuilder.array(fieldsArrayBe18);
            this.be18Products.push(this.formBuilder.group({
              // productType: [product.product_type],
              product_id: [product.product_id],
              productName: [product.product_name],
              productId: [product.product_id_manual],
              revenueCost: [product.revenue_cost],
              fitnessInputs: fitnessFormArrayBe18,
              productYearMap: [this.createProductYearMap(product.year, product.revenue_cost)],
              userGroup: [product.user_group],
              userGroupId: [product.user_group_id],
              // userGroup: [product.user_group],
              // userGroupId: [product.user_group_id],
              // relevance: [be18?.relevance_id || '', Validators.required],
              // emitGHGs: [be18?.fitness_ghg || false],
              // lifetimeUsePhase: [be18?.fitness_emission],
              // unitSold: [be18?.number_unit_sold],
              // productFitness: [be18?.product_fitness_percentage],
              // comments: [be18?.comments || ''],
              BEID: [be18?.id || 0]
            }));

            const fieldsArrayBe15 = [];
            if (be15?.length) {
              for (let i = 0; i < be15?.length; i++) {
                const be15Item = be15[i];
                // console.log(be15Item, 'be15Item')

                fieldsArrayBe15.push(this.createFitnessInputBe15(be15Item));

              }
            } else {
              fieldsArrayBe15.push(this.createFitnessInputBe15({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe15 = this.formBuilder.array(fieldsArrayBe15);
            this.be15Products.push(this.formBuilder.group({
              product_id: [product.product_id],
              productName: [product.product_name],
              productId: [product.product_id_manual],
              revenueCost: [product.revenue_cost],
              userGroup: [product.user_group],
              productType: [product.product_typename],
              userGroupId: [product.user_group_id],
              fitnessInputs: fitnessFormArrayBe15,
              productYearMap: [this.createProductYearMap(product.year, product.revenue_cost)],
              // relevance: [be15?.relevance_id || '', Validators.required],
              // user_groups_communicationplans: [be15?.user_groups_identified || false],
              // communications_are_considered: [be15?.non_target_group_needs_considered || false],
              // communications_crucial_information: [be15?.communications_crucial_information || false],
              // communications_product_information: [be15?.communications_product_information || false],
              // purchase_information_needed: [be15?.purchase_physical_goods || false],
              // purchase_physical_goods: [be15?.purchase_physical_goods || false],
              // purchase_nature_andquantities: [be15?.purchase_nature_andquantities || false],
              // purchase_characteristics_ofproducts: [be15?.purchase_characteristics_ofproducts || false],
              // purchase_ambiguous_term: [be15?.purchase_ambiguous_term || false],
              // purchase_comparative: [be15?.purchase_comparative || false],
              // purchase_user_groups: [be15?.purchase_user_groups || false],
              // use_users_provided: [be15?.use_users_provided || false],
              // use_nutrition_information: [be15?.use_nutrition_information || false],
              // use_with_guidance: [be15?.use_with_guidance || false],
              // use_guidance_provided: [be15?.use_guidance_provided || false],
              // post_physical_good: [be15?.post_physical_good || false],
              // post_improper_disposal: [be15?.post_improper_disposal || false],
              // product_fitness_percentage: [be15?.product_fitness_percentage || 0],
              // // revenue: [], 
              // comments: [be15?.comments || ''],
              BEID: [be15?.id || 0]
            }));


            const fieldsArrayBe16 = [];
            if (be16?.length) {
              for (let i = 0; i < be16?.length; i++) {
                const be16Item = be16[i];
                // console.log(be16Item, 'be16Item')

                fieldsArrayBe16.push(this.createFitnessInputBe16(be16Item));

              }
            } else {
              fieldsArrayBe16.push(this.createFitnessInputBe16({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe16 = this.formBuilder.array(fieldsArrayBe16);
            this.be16Products.push(this.formBuilder.group({
              product_id: [product.product_id],
              productName: [product.product_name],
              productId: [product.product_id_manual],
              productType: [product.product_typename],
              revenueCost: [product.revenue_cost],
              userGroup: [product.user_group],
              userGroupId: [product.user_group_id],
              fitnessInputs: fitnessFormArrayBe16,
              productYearMap: [this.createProductYearMap(product.year, product.revenue_cost)],
              // relevance: [be16?.relevance_id || '', Validators.required],
              // legitimacy: [be16?.legitimacy || false],
              // positive_outcomes: [be16?.positive_outcomes || false],
              // accessibility: [be16?.accessibility || false],
              // reduce_uncertainty: [be16?.reduce_uncertainty || false],
              // fairness_concerns_investigated: [be16?.fairness_concerns_investigated || false],
              // fairness_policies_consult: [be16?.fairness_policies_consult || false],
              // transparency_throughout_investigation: [be16?.transparency_throughout_investigation || false],
              // transparency_process_investigating: [be16?.transparency_process_investigating || false],
              // transparency_valid_acknowledged: [be16?.transparency_valid_acknowledged || false],
              // transparency_alternatively_investigation: [be16?.transparency_alternatively_investigation || false],
              // engage_actively: [be16?.engage_actively || false],
              // improve_continuously_performance: [be16?.improve_continuously_performance || false],
              // improve_continuously_implement: [be16?.improve_continuously_implement || false],
              // // product_fitness_percentage: [be16?.product_fitness_percentage || null],
              // product_fitness_percentage: [be16?.product_fitness_percentage || 0],

              // // revenue: [],                          
              // comments: [be16?.comments || ''],
              BEID: [be16?.id || 0]
            }));
            const fieldsArrayBe19 = [];
            if (be19?.length) {
              for (let i = 0; i < be19?.length; i++) {
                const be19Item = be19[i];
                // console.log(be19Item, 'be19Item')

                fieldsArrayBe19.push(this.createFitnessInputBe19(be19Item));

              }
            } else {
              fieldsArrayBe19.push(this.createFitnessInputBe19({})); // Push an empty object if no data exists
            }
            const fitnessFormArrayBe19 = this.formBuilder.array(fieldsArrayBe19);
            this.be19Products.push(this.formBuilder.group({
              product_id: [product.product_id],
              productName: [product.product_name],
              productId: [product.product_id_manual],
              revenueCost: [product.revenue_cost],
              userGroup: [product.user_group],
              userGroupId: [product.user_group_id],
              productType: [product.product_typename],
              fitnessInputs: fitnessFormArrayBe19,
              productYearMap: [this.createProductYearMap(product.year, product.revenue_cost)],
              // revenue:[''], 
              // relevance: [be19?.relevance_id || '', Validators.required],
              // numberof_distinct: [be19?.numberof_distinct || null],
              // fitness1_repurposing: [be19?.fitness1_repurposing || null],
              // fitness1_sold: [be19?.fitness1_sold || null],
              // fitness2_repurposing: [be19?.fitness2_repurposing || null],
              // fitness2_sold: [be19?.fitness2_sold || null],
              // fitness3_repurposing: [be19?.fitness3_repurposing || null],
              // fitness3_sold: [be19?.fitness3_sold || null],
              // fitness4_repurposing: [be19?.fitness4_repurposing || null],
              // fitness4_sold: [be19?.fitness4_sold || null],
              // fitness5_repurposing: [be19?.fitness5_repurposing || null],
              // fitness5_sold: [be19?.fitness5_sold || null],
              // fitness6_repurposing: [be19?.fitness6_repurposing || null],
              // fitness6_sold: [be19?.fitness6_sold || null],
              // fitness7_repurposing: [be19?.fitness7_repurposing || null],
              // fitness7_sold: [be19?.fitness7_sold || null],
              // fitness8_repurposing: [be19?.fitness8_repurposing || null],
              // fitness8_sold: [be19?.fitness8_sold || null],
              // fitness9_repurposing: [be19?.fitness9_repurposing || null],
              // fitness9_sold: [be19?.fitness9_sold || null],
              // fitness10_repurposing: [be19?.fitness10_repurposing || null],
              // fitness10_sold: [be19?.fitness10_sold || null],
              // product_fitness_percentage: [be19?.product_fitness_percentage || null],

              // comments: [be19?.comments || ''],
              BEID: [be19?.id || 0]
            }));

          });
        });
      }
    });
  }

  createFitnessInputBe15(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      // year: [data?.year || new Date().getFullYear()],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
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
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe16(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      revenue: [data?.revenue || null],
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
      //siteFitness: [data?.site_fitness_percent !=null ? `${data.site_fitness_percent}%`:null],
      product_fitness_percentage: [data?.product_fitness_percentage != null ? `${data.product_fitness_percentage}%` : null],

      // revenue: [],
      comments: [data?.comments || ''],
    });
  }
  createFitnessInputBe17(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      // year: [data?.year || new Date().getFullYear()],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      revenue: [data?.revenue || null],
      relevance: [data?.relevance_id || '', Validators.required],
      GDMMusePhase: [data?.GDMMUsePhase ?? null],
      GDMMendOfLife: [data?.GDMMendOfLife ?? null],
      WDKMPusePhase: [data?.physical_weapon ?? null],
      CWUILHRusePhase: [data?.physical_consumable ?? null],
      EDVPusePhase: [data?.physical_environmentally_use ?? null],
      EDVendOfLife: [data?.physical_environmentally_end ?? null],
      GFUPEusePhase: [data?.GFUPEusePhase ?? null],
      GFUPEendOfLife: [data?.GFUPEendOfLife ?? null],
      GCSCusePhase: [data?.physical_substances_use ?? null],
      GCSCendOfLife: [data?.physical_substances_end ?? null],
      phycal_gd_is_an_intrmdt_gd: [data?.intermediate_physical ?? null],
      intrmdt_gd_asses_reprvv_user: [data?.intermediate_representative ?? null],
      RPUFGusePhase: [data?.intermediate_classified_use ?? null],
      RPUFGendOfLife: [data?.intermediate_classified_end ?? null],
      service_result_in_negative_impacts: [data?.services_negative ?? null],
      service_could_harm_ecosystems: [data?.services_harm ?? null],
      service_ngtv_impacts_physcl_mntl_wlbng: [data?.services_physical ?? null],
      service_reinforce_bhvr_undrm_ftns: [data?.services_behaviours ?? null],
      service_perpetuates_orx_rlc_infr_ngtv_impacts: [data?.services_infrastructure ?? null],
      productFitnessusePhase: [data?.product_fitness_usephase != null ? `${data.product_fitness_usephase}%` : null],
      productFitnessendOfLife: [data?.product_fitness_end != null ? `${data.product_fitness_end}%` : null],



      comments: [data?.comments || '']
    });
  }
  createFitnessInputBe18(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      // year: [data?.year || new Date().getFullYear()],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
      revenue: [data?.revenue || null],
      relevance: [data?.relevance_id || '', Validators.required],
      emitGHGs: [data?.fitness_ghg || false],
      lifetimeUsePhase: [data?.fitness_emission],
      unitSold: [data?.number_unit_sold],
      //[data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      productFitness: [data?.product_fitness_percentage != null ? `${data.product_fitness_percentage}%` : null],
      comments: [data?.comments || ''],
    });
  }

  createFitnessInputBe19(data?: any): FormGroup {
    return this.formBuilder.group({
      id: [data?.id || 0],
      revenue: [data?.revenue || null],
      year: [new Date(data?.year, 0, 1), [Validators.required]],
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
      //[data?.employee_fitness_percentage != null ? `${data.employee_fitness_percentage}%` : null],
      product_fitness_percentage: [data?.product_fitness_percentage != null ? `${data.product_fitness_percentage}%` : null],

      comments: [data?.comments || ''],
    });
  }




}
