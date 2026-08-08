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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import Swal from 'sweetalert2';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Moment } from 'moment';
export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
interface Company {
  id: string;
  name: string;
}
@Component({
  selector: 'app-edit-financial-asset',
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
  templateUrl: './edit-financial-asset.component.html',
  styleUrl: './edit-financial-asset.component.scss'
})
export class EditFinancialAssetComponent {
  RoleID: any;
  CompanyID: any;
  routeId: any;
  title = 'Financial Asset';
  companyArr: any[] = [];
  loading = false;
  lastChangedIndex: number | null = null;
  financialAssetForm: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID;
    this.CompanyID = this.userService.CompanyID;
    this.routeId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getFinancialAssetById();

    if (this.RoleID == 1) {
      this.financialAssetForm = this.fb.group({
        financial_asset: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        financial_asset_id: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // monetary_value: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        // reporting_period: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        company_id: ['', [Validators.required]],
        monetaryYearData: this.fb.array([]),
        purchase_date: ['', Validators.required],
        sale_date: [''],
      });
    } else {
      this.financialAssetForm = this.fb.group({
        financial_asset: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        financial_asset_id: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // monetary_value: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        // reporting_period: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        company_id: [this.CompanyID],
        monetaryYearData: this.fb.array([]),
        purchase_date: ['', Validators.required],
        sale_date: [''],
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



  get monetaryYearData(): FormArray {
    return this.financialAssetForm.get('monetaryYearData') as FormArray;
  }

  createMonetaryYearGroup(year: string | Date | null = '', monetary_value = '', isExisting = false): FormGroup {
    const group = this.fb.group({
      year: [year, Validators.required],
      monetary_value: [monetary_value, [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
      isExisting: [isExisting]
    });

    group.get('year')?.valueChanges.subscribe(() => {
      const index = this.monetaryYearData.controls.indexOf(group);
      this.lastChangedIndex = index;
    });

    return group;
  }


  addMonetaryYearGroup(): void {
    this.monetaryYearData.push(this.createMonetaryYearGroup());
  }

  removeMonetaryYearGroup(index: number): void {
    const yearGroup = this.monetaryYearData.at(index).value;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this entry? Once deleted, it cannot be recovered.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {

        if (!yearGroup.isExisting) {
          this.monetaryYearData.removeAt(index);
          return;
        }


        this.monetaryYearData.removeAt(index);


        const years = this.monetaryYearData.controls
          .map(x => this.extractYearValue(x.value.year))
          .join(',');
        // const values = this.monetaryYearData.controls
        //   .map(x => x.value.monetary_value)
        //   .join(',');
        const values = this.monetaryYearData.controls
  .map(x => x.value.monetary_value?.toString().replace(/,/g, ''))
  .join(',');



        const payload = {
          ...this.financialAssetForm.value,
          year: years,
          monetary_value: values,
          purchase_date: this.formatDateToDMY(this.financialAssetForm.value.purchase_date),
          sale_date: this.financialAssetForm.value.sale_date
            ? this.formatDateToDMY(this.financialAssetForm.value.sale_date)
            : null
        };


        this.commonService.addData('financial-assets/edit/' + this.routeId, payload).subscribe(
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


  getFinancialAssetById() {
    this.commonService.getData('financial-assets/getById/' + this.routeId).subscribe(
      (response) => {
        if (response.status == true && response.data.length > 0) {
          const data = response.data[0];

          this.financialAssetForm.patchValue({
            financial_asset: data.financial_asset,
            financial_asset_id: data.financial_asset_id,
            purchase_date: this.parseDate(data.purchase_date),
            sale_date: data.sale_date ? this.parseDate(data.sale_date) : '',
            company_id: this.RoleID == 1 ? data.company_id : this.CompanyID
          });

          
          const years = data.year ? data.year.split(',') : [];
const values = data.monetary_value ? data.monetary_value.split(',') : [];

this.monetaryYearData.clear();

for (let i = 0; i < years.length; i++) {
  const yearValue = years[i].trim();

  //  If it's just a year like "2025", use as string (no Date conversion)
  const formattedYear = /^\d{4}$/.test(yearValue)
    ? yearValue
    : this.parseDate(yearValue);

  // this.monetaryYearData.push(
  //   this.createMonetaryYearGroup(formattedYear, values[i] || '', true)
  // );
  const formattedValue = this.formatNumberForDisplay(values[i] || '');
this.monetaryYearData.push(
  this.createMonetaryYearGroup(formattedYear, formattedValue, true)
);

}

        } else {
          this._snackBar.open('Financial Asset Not Found', '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end'
          });
          setTimeout(() => this.router.navigate(['/financial']), 2000);
        }
      },
      (error) => {
        console.error('Error loading financial asset:', error);
        this._snackBar.open('Error fetching data', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });
      }
    );
  }
 
  selectDate(event: any, datepicker: any, currentIndex: number): void {
  if (!event) return;

  
  const selectedDate = event instanceof Date ? event : new Date(event);
  if (isNaN(selectedDate.getTime())) return;  

  const formattedDate = this.formatDateToDMY(selectedDate) || '';
  const group = this.monetaryYearData.at(currentIndex);
  const dateControl = group.get('year');

  
  const isDuplicate = this.monetaryYearData.controls.some((ctrl, i) => {
    if (i == currentIndex) return false;
    const val = ctrl.get('year')?.value;
    if (!val) return false;

    let existing = '';

    if (val instanceof Date) {
      existing = this.formatDateToDMY(val) || '';
    } else if (typeof val == 'string' && val.includes('/')) {
      existing = val;
    } else {
      existing = this.formatDateToDMY(new Date(val)) || '';
    }

    return existing == formattedDate;
  });

   
  if (isDuplicate) {
    dateControl?.setValue(selectedDate);  
    dateControl?.setErrors({ duplicateDate: true });
    dateControl?.markAsTouched();
    this.financialAssetForm.updateValueAndValidity({ emitEvent: true });
    datepicker.close();
    return;
  }

   
  dateControl?.setValue(selectedDate);
  dateControl?.setErrors(null);
  dateControl?.markAsTouched();
  dateControl?.markAsDirty();
  dateControl?.updateValueAndValidity();

  setTimeout(() => datepicker.close(), 50);
  this.financialAssetForm.updateValueAndValidity();
}

  private formatDateToDMY(date: any): string | null {
    if (!date) return null;
    const d = date._isAMomentObject ? date.toDate() : new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }




  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  getYearDisplay(index: number): string {
  const control = this.monetaryYearData.at(index).get('year');
  const value = control?.value;
  return value ? value.toString() : '';
}
openYearPicker(picker: MatDatepicker<Moment>) {
  picker.open();
}




  onSubmit() {
    this.loading = true;


    this.financialAssetForm.controls['financial_asset'].markAsTouched();
    this.financialAssetForm.controls['financial_asset_id'].markAsTouched();
    this.financialAssetForm.controls['purchase_date'].markAsTouched();
    this.financialAssetForm.controls['sale_date'].markAsTouched();
      

    this.monetaryYearData.controls.forEach((control) => (control as FormGroup).markAllAsTouched());

    if (this.financialAssetForm.invalid) {
      this.loading = false;
      return;
    }


    if (!this.financialAssetForm.dirty && this.monetaryYearData.pristine) {
      this._snackBar.open('No changes made.', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customSuccessClass']
      });
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/financial']);
      }, 2000);
      return;
    }


    const years = this.monetaryYearData.controls
      .map(x => this.extractYearValue(x.value.year))
      .join(',');

    // const values = this.monetaryYearData.controls
    //   .map(x => x.value.monetary_value)
    //   .join(',');
    const values = this.monetaryYearData.controls
  .map(x => x.value.monetary_value?.toString().replace(/,/g, ''))
  .join(',');


    const payload = {
      ...this.financialAssetForm.value,
      year: years,
      monetary_value: values,
      purchase_date: this.formatDateToDMY(this.financialAssetForm.value.purchase_date),
      sale_date: this.financialAssetForm.value.sale_date
        ? this.formatDateToDMY(this.financialAssetForm.value.sale_date)
        : null
    };

    console.log('Edit Payload:', payload);

    this.commonService.addData('financial-assets/edit/' + this.routeId, payload).subscribe(
      (response) => {
        this._snackBar.open(response.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/financial']);
        }, 2000);
      },
      (error) => {
        console.error('Error occurred:', error);
        this.loading = false;
      }
    );
  }
   
  chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>, currentIndex: number): void {
  const selectedYear = normalizedYear.year(); // e.g. 2034
  const group = this.monetaryYearData.at(currentIndex);
  const yearControl = group.get('year');

   
  const isDuplicate = this.monetaryYearData.controls.some((ctrl, i) => {
    if (i == currentIndex) return false;
    const existingYear = ctrl.get('year')?.value;
    if (!existingYear) return false;

    
    return existingYear.toString() == selectedYear.toString();
  });

  if (isDuplicate) {
     
    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors({ duplicateDate: true });
    yearControl?.markAsTouched();
    this.financialAssetForm.updateValueAndValidity({ emitEvent: true });
    datepicker.close();
    return;
  }

   
  yearControl?.setValue(selectedYear.toString());
  yearControl?.setErrors(null);
  yearControl?.markAsTouched();
   yearControl?.markAsDirty();
    yearControl?.updateValueAndValidity();
     this.monetaryYearData.markAsDirty();

  datepicker.close();
}

  private extractYearValue(dateValue: any): string {
  if (!dateValue) return '';

  // Case 1: Moment object
  if (dateValue._isAMomentObject) {
    return dateValue.year().toString();
  }

   
  if (dateValue instanceof Date) {
    return dateValue.getFullYear().toString();
  }

   
  const match = dateValue.toString().match(/\d{4}/);
  return match ? match[0] : '';
  }
  onNumberInput(event: any, formGroup: AbstractControl): void {
  const group = formGroup as FormGroup;
  let rawValue = event.target.value || '';

  // Remove commas and any non-numeric chars
  rawValue = rawValue.replace(/,/g, '').replace(/[^0-9]/g, '');

  if (rawValue !== '') {
    const numberValue = Number(rawValue);
    group.get('monetary_value')?.setValue(numberValue, { emitEvent: false });
    event.target.value = this.formatNumberForDisplay(numberValue);
  } else {
    group.get('monetary_value')?.setValue('', { emitEvent: false });
  }
}

private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US'); // e.g. 1,000 or 12,345
}





 

}
