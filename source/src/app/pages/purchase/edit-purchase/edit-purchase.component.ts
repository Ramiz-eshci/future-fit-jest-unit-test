import { Component } from '@angular/core';


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
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
@Component({
  selector: 'app-edit-purchase',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
    providers: [
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
  templateUrl: './edit-purchase.component.html',
  styleUrl: './edit-purchase.component.scss'
})
export class EditPurchaseComponent {
  RoleID: any;
  CompanyID: any;
  routeId: any;
  title = 'Purchase';
  companyArr: any[] = [];
  loading = false;
  lastChangedIndex: number | null = null;

  purchaseTypes: string[] = [
    'Product input',
    'Outsourced core function',
    'Ancillary spend'
  ];

  purchaseForm: any;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID;
    this.CompanyID = this.userService.CompanyID;
    this.routeId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getPurchaseById();

    if (this.RoleID == 1) {
      this.purchaseForm = this.fb.group({
        purchase: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        purchase_id: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
       // cost: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        purchase_type: ['', [Validators.required]],
        product_input: [''],
        company_id: ['', [Validators.required]],
         yearlyCostData: this.formBuilder.array([])
      });
    } else {
      this.purchaseForm = this.fb.group({
        purchase: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        purchase_id: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
       // cost: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        purchase_type: ['', [Validators.required]],
        product_input: [''],
        company_id: [this.CompanyID],
         yearlyCostData: this.formBuilder.array([])
      });
    }


    if (this.RoleID == 1) {
      this.commonService.getData('list/company').subscribe((res) => {
        if (res.status) {
          this.companyArr = res.data;
        }
      });
    }
  }
  get yearlyCostData(): FormArray {
    return this.purchaseForm.get('yearlyCostData') as FormArray;
  }

   
  createYearCostGroup(year = '', cost = '', isExisting = false): FormGroup {
  const group = this.formBuilder.group({
    year: [year, [Validators.required, Validators.pattern(/^\d{4}$/)]],
    cost: [cost, [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
    isExisting: [isExisting]
  });

   
  group.get('year')?.valueChanges.subscribe(() => {
    const index = this.yearlyCostData.controls.indexOf(group);
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
    // Update form control value without firing change events
    group.get('cost')?.setValue(numberValue, { emitEvent: false });
    // Display formatted value (with commas)
    event.target.value = this.formatNumberForDisplay(numberValue);
  } else {
    group.get('cost')?.setValue('', { emitEvent: false });
  }
}

private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

private parseNumber(value: any): number {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, ''));
}




  addYearCostGroup(): void {
    this.yearlyCostData.push(this.createYearCostGroup());
  }

  
  removeYearCostGroup(index: number): void {
  const yearGroup = this.yearlyCostData.at(index).value;

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
        this.yearlyCostData.removeAt(index);
        
        return;
      }

 
      this.yearlyCostData.removeAt(index);

      const years = this.yearlyCostData.controls.map(x => x.value.year).join(',');
      // const costs = this.yearlyCostData.controls.map(x => x.value.cost).join(',');
       const costs = this.yearlyCostData.controls
  .map(x => this.parseNumber(x.value.cost))
  .join(',');

      const payload = {
        ...this.purchaseForm.value,
        year: years,
        cost: costs
      };

      this.commonService.addData('purchase/edit/' + this.routeId, payload).subscribe(
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

 
  getPurchaseById() {
    this.commonService.getData('purchase/getById/' + this.routeId).subscribe(
      (response) => {
        if (response.status === true) {
          const data = response.data[0];
          this.purchaseForm.controls['purchase'].setValue(data.purchase);
          this.purchaseForm.controls['purchase_id'].setValue(data.purchase_id);
          this.purchaseForm.controls['purchase_type'].setValue(data.purchase_type);
          this.purchaseForm.controls['product_input'].setValue(data.product_input);

          if (this.RoleID == 1) {
            this.purchaseForm.controls['company_id'].setValue(data.company_id);
          }

          const years = data.year ? data.year.split(',') : [];
          const costs = data.cost ? data.cost.split(',') : [];

          this.yearlyCostData.clear();
          for (let i = 0; i < years.length; i++) {
            //  this.yearlyCostData.push(this.createYearCostGroup(years[i], costs[i] || '',true));
             const formattedCost = this.formatNumberForDisplay(costs[i] || '');
  this.yearlyCostData.push(this.createYearCostGroup(years[i], formattedCost, true));
          }
        } else {
          this._snackBar.open('Purchase Not Found', '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customClass']
          });
          setTimeout(() => this.router.navigate(['/purchase']), 2000);
        }
      },
      (error) => {
        console.error('Error loading purchase:', error);
        this._snackBar.open('Error fetching data', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });
      }
    );
  }
   isDuplicateYear(currentIndex: number): boolean {
  const control = this.yearlyCostData.at(currentIndex).get('year');
  return !!control?.errors?.['duplicateYear'];
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

  const group = this.yearlyCostData.at(currentIndex);
  const yearControl = group.get('year');

   
  const isDuplicate = this.yearlyCostData.controls.some((ctrl, i) => {
    if (i === currentIndex) return false;
    const yearValue = ctrl.get('year')?.value;
    return yearValue && yearValue.toString() === selectedYear.toString();
  });

  if (isDuplicate) {
     
    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors({ duplicateYear: true });
    yearControl?.markAsTouched();
    datepicker.close();
    this.purchaseForm.updateValueAndValidity({ emitEvent: true });
    return;
  }

   
  yearControl?.setValue(selectedYear.toString());
  yearControl?.setErrors(null);
    yearControl?.markAsTouched();
    yearControl?.markAsDirty();
  yearControl?.updateValueAndValidity();

 
  setTimeout(() => datepicker.close(), 50);

  this.purchaseForm.updateValueAndValidity();
}



  onSubmit() {
    this.loading = true;

    // Mark fields as touched
    this.purchaseForm.controls['purchase'].markAsTouched();
    this.purchaseForm.controls['purchase_id'].markAsTouched();
    this.purchaseForm.controls['purchase_type'].markAsTouched();
    this.purchaseForm.controls['product_input'].markAsTouched();

    this.yearlyCostData.controls.forEach((control) => (control as FormGroup).markAllAsTouched());

    if (this.purchaseForm.invalid) {
      this.loading = false;
      return;
    }

    // Check if form unchanged
    if (!this.purchaseForm.dirty && this.yearlyCostData.pristine) {
      this._snackBar.open('No changes made.', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customSuccessClass']
      });
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/purchase']);
      }, 2000);
      return;
    }

    // Prepare payload
    const years = this.yearlyCostData.controls.map(x => x.value.year).join(',');
    // const costs = this.yearlyCostData.controls.map(x => x.value.cost).join(',');
const costs = this.yearlyCostData.controls
  .map(x => this.parseNumber(x.value.cost))
  .join(',');

    const payload = {
      ...this.purchaseForm.value,
      year: years,
      cost: costs
    };

    console.log('Edit Payload:', payload);

    this.commonService.addData('purchase/edit/' + this.routeId, payload).subscribe(
      (response) => {
        this._snackBar.open(response.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/purchase']);
        }, 2000);
      },
      (error) => {
        console.error('Error occurred:', error);
        this.loading = false;
      }

    );
  } 
   


   

}
