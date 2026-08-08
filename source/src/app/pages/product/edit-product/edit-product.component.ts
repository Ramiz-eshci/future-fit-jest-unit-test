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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import Swal from 'sweetalert2';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
interface Company {
  id: string;
  name: string;
}

interface product_type {
  id: string;
  name: string;
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class EditProductComponent {
  companyArr: Company[] = [];
  productTypeArr: product_type[] = [];
  sitesArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  productForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  lastChangedIndex: number | null = null;
  title: any = 'Product';
  routeId: string | null = null;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID
    this.routeId = this.route.snapshot.paramMap.get('id');
    if (this.RoleID == 1) {
      this.productForm = this.formBuilder.group({
        ProductName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        //  RevenueCost: ['', [Validators.required,Validators.pattern(/^[0-9]+$/) ]],
        CompanyID: ['', [Validators.required]],
        ProductType: ['', [Validators.required]],
        UserGroup: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        UserGroupID: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        ProductIDManual: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyRevenueData: this.formBuilder.array([])
        //  year:['']
      });
    } else {
      this.productForm = this.formBuilder.group({
        ProductName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        //  RevenueCost: ['', [Validators.required,Validators.pattern(/^[0-9]+$/) ]],
        // CompanyID: ['', [Validators.required]],
        ProductType: ['', [Validators.required]],
        UserGroup: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        UserGroupID: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        ProductIDManual: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyRevenueData: this.formBuilder.array([])
        // year:['']
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
    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    console.log(this.routeId, 'routerId');
    this.commonService.getData('product/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        this.productForm.controls['ProductName'].setValue(response.data[0].product_name)
        this.productForm.controls['ProductType'].setValue(response.data[0].product_type)
        this.productForm.controls['SiteID'].setValue(response.data[0].site_id)
        // this.productForm.controls['CompanyID'].setValue(response.data[0].company_id)

         if (this.RoleID == 1) {
          this.productForm.controls['CompanyID'].setValue(response.data[0].company_id)
        }
        // this.productForm.controls['RevenueCost'].setValue(response.data[0].revenue_cost)
        this.productForm.controls['UserGroup'].setValue(response.data[0].user_group)
        this.productForm.controls['UserGroupID'].setValue(response.data[0].user_group_id)
        this.productForm.controls['ProductIDManual'].setValue(response.data[0].product_id_manual)
        const years = response.data[0].year ? response.data[0].year.split(',') : [];
        const revenues = response.data[0].revenue_cost ? response.data[0].revenue_cost.split(',') : [];

        this.yearlyRevenueData.clear();
        for (let i = 0; i < years.length; i++) {
          // this.yearlyRevenueData.push(this.createYearGroup(years[i], revenues[i] || '', true));
           const formattedRevenue = this.formatNumberForDisplay(revenues[i] || '');
  this.yearlyRevenueData.push(this.createYearGroup(years[i], formattedRevenue, true));
        }
        //  this.productForm.controls['year'].setValue(response.data[0].year) 
      }

    }, (error) => {
      this._snackBar.open('Product Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/product']);
      }, 2000);
    });
  }
  get yearlyRevenueData(): FormArray {
    return this.productForm.get('yearlyRevenueData') as FormArray;
  }

   
  createYearGroup(year = '', revenue = '', isExisting = false): FormGroup {
    const group = this.formBuilder.group({
      Year: [year, [Validators.required]],
      RevenueCost: [revenue, [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
      isExisting: [isExisting]
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

  // Remove commas & non-numeric chars
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
  return num.toLocaleString('en-US'); // adds commas
}



  addYearGroup(): void {
    this.yearlyRevenueData.push(this.createYearGroup());
  }

 
  removeYearGroup(index: number): void {

    if (this.yearlyRevenueData.length == 1) {
      // alert('At least one record must remain.');
      return;
    }

    const yearGroup = this.yearlyRevenueData.at(index).value;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this data? Once deleted, it cannot be recovered.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {


        if (!yearGroup.isExisting) {
          this.yearlyRevenueData.removeAt(index);

          return;
        }


        this.yearlyRevenueData.removeAt(index);


        const updatedYears = this.yearlyRevenueData.controls.map(x => x.value.Year).join(',');
        // const updatedRevenues = this.yearlyRevenueData.controls.map(x => x.value.RevenueCost).join(',');
 const updatedRevenues = this.yearlyRevenueData.controls
        .map(x => x.value.RevenueCost?.toString().replace(/,/g, ''))
        .join(',');
        const payload = {
          ...this.productForm.value,
          Year: updatedYears,
          RevenueCost: updatedRevenues
        };


        this.commonService.addData('product/edit/' + this.routeId, payload).subscribe(
          (response: any) => {
            if (response.status) {
              Swal.fire('Deleted!', 'Record deleted successfully.', 'success');
            } else {
              Swal.fire('Error!', response.message || 'Failed to delete record.', 'error');
            }
          },
          (error) => {
            console.error('Error deleting record:', error);
            Swal.fire('Error!', 'Something went wrong while deleting record.', 'error');
          }
        );
      }
    });
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
    yearControl?.markAsDirty();
    yearControl?.updateValueAndValidity();


    setTimeout(() => datepicker.close(), 50);

    this.productForm.updateValueAndValidity();
  }


  onSubmit(): void {
    this.loading = true;
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      this.loading = false;
      return;
    }

    if (!this.productForm.dirty && this.yearlyRevenueData.pristine) {
      this._snackBar.open('No changes made.', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customSuccessClass']
      });
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/product']);
      }, 2000);
      this.loading = false;
      return;
    }

    //  Prepare Final Payload
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

    console.log('Edit Payload:', payload);

    //  API Call
    this.commonService.addData('product/edit/' + this.routeId, payload).subscribe(
      (response) => {
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
      (error) => {
        console.error('An error occurred:', error);
        this.loading = false;
      }
    );
  }


  
}
