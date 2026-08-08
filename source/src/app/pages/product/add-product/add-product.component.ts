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
import { catchError, map, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
export const MY_DATE_FORMATS = {
  parse: { dateInput: 'YYYY' },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};
interface Company {
  id: string;
  name: string;
}
interface product_type {
  id: string;
  name: string;
}
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class AddProductComponent {
  companyArr: Company[] = [];
  productTypeArr: product_type[] = [];
  sitesArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  productForm: any;
  loading: boolean = false;
  title: any = 'Product';
  RoleID: any = 1;
  lastChangedIndex: number | null = null;
  CompanyID: any;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {

    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID

    if (this.RoleID == 1) {                                                                                                           
      this.productForm = this.formBuilder.group({                                         
        ProductName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        //  RevenueCost: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        CompanyID: ['', [Validators.required]],
        ProductType: ['', [Validators.required]],
        UserGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        UserGroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        ProductIDManual: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // SiteID: ['', [Validators.required]],
         SiteID: [''],
        yearlyRevenueData: this.formBuilder.array([this.createYearGroup()])
      });
    } else {
      this.productForm = this.formBuilder.group({
        ProductName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        //  RevenueCost: ['', [Validators.required, Validators.pattern(/^[0-9]+$/) ]],
        // CompanyID: ['', [Validators.required]],
        ProductType: ['', [Validators.required]],
        UserGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        UserGroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        ProductIDManual: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyRevenueData: this.formBuilder.array([this.createYearGroup()])
        //  year: [new Date().getFullYear()]
      });
    }
    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
    this.commonService.getData('list/producttype').subscribe((response) => {
      if (response.status === true) {
        this.productTypeArr = response.data
      }
    });
    this.commonService.getData(`site/sites/${this.CompanyID}`).subscribe((response) => {
      if (response.status === true) {
        this.sitesArr = response.data
      }
    });
  }


  get yearlyRevenueData(): FormArray {
    return this.productForm.get('yearlyRevenueData') as FormArray;
  }
 
  createYearGroup(): FormGroup {
    const group = this.formBuilder.group({
      Year: ['', [Validators.required]],
      RevenueCost: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]]
    });

    group.get('Year')?.valueChanges.subscribe(() => {
      const index = this.yearlyRevenueData.controls.indexOf(group);
      this.lastChangedIndex = index;
    });

    return group;
  }
  onNumberInput(event: any, formGroup: AbstractControl): void {
  const group = formGroup as FormGroup;
  let rawValue = event.target.value || '';

  // Remove commas and non-numeric characters
  rawValue = rawValue.replace(/,/g, '').replace(/[^0-9]/g, '');

  if (rawValue !== '') {
    const numberValue = Number(rawValue);
    group.get('RevenueCost')?.setValue(numberValue, { emitEvent: false });
    event.target.value = this.formatNumberForDisplay(numberValue);
  } else {
    group.get('RevenueCost')?.setValue('', { emitEvent: false });
  }
}

private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US'); // Adds commas e.g., 12,345
}


  selectYear(event: any, datepicker: any, currentIndex: number): void {
    let selectedYear: number;

    // Extract selected year
    if (event && typeof event.year === 'function') {
      selectedYear = event.year();
    } else if (event instanceof Date) {
      selectedYear = event.getFullYear();
    } else {
      selectedYear = event;
    }

    const group = this.yearlyRevenueData.at(currentIndex);
    const yearControl = group.get('Year');


    const isDuplicate = this.yearlyRevenueData.controls.some((ctrl, i) => {
      if (i == currentIndex) return false;
      const yearValue = ctrl.get('Year')?.value;
      return yearValue && yearValue.toString() == selectedYear.toString();
    });

    if (isDuplicate) {
      yearControl?.reset();
      yearControl?.setErrors({ duplicateYear: true });
      yearControl?.markAsTouched();
      datepicker.close();
      this.productForm.updateValueAndValidity({ emitEvent: true });
      return;
    }


    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors(null);
    yearControl?.markAsTouched();
    yearControl?.updateValueAndValidity();

    setTimeout(() => datepicker.close(), 50);
    this.productForm.updateValueAndValidity();
  }

  isDuplicateYear(currentIndex: number): boolean {
    const control = this.yearlyRevenueData.at(currentIndex).get('Year');
    return !!control?.errors?.['duplicateYear'];
  }


  addYearGroup(): void {
    this.yearlyRevenueData.push(this.createYearGroup());
  }

  removeYearGroup(index: number): void {
    this.yearlyRevenueData.removeAt(index);
  }


  onSubmit() {
    this.loading = true;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.loading = false;
      return;
    }

    // Convert FormArray to comma-separated values
    const years = this.yearlyRevenueData.controls.map(x => x.value.Year).join(',');
    // const revenueCosts = this.yearlyRevenueData.controls.map(x => x.value.RevenueCost).join(',');
const revenueCosts = this.yearlyRevenueData.controls
  .map(x => x.value.RevenueCost?.toString().replace(/,/g, ''))
  .join(',');

    const payload = {
      ...this.productForm.value,
      Year: years,
      RevenueCost: revenueCosts
    };

    console.log('Final Payload:', payload);

    this.commonService.addData('product/add/', payload).subscribe(
      response => {
        this._snackBar.open(response.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/product']);
        }, 2000);
      },
      error => {
        console.error('An error occurred:', error);
        this.loading = false;
      }
    );
  }

  
}
