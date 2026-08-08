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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import * as moment from 'moment';
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
  selector: 'app-add-financial-asset',
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
  templateUrl: './add-financial-asset.component.html',
  styleUrl: './add-financial-asset.component.scss'
})
export class AddFinancialAssetComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
    // @ViewChild('yearPicker') yearPicker!: MatDatepicker<Moment>;
  financialAssetForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  title: any = 'Financial Asset';
  lastChangedIndex: number | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private adapter: DateAdapter<any>
  ) {
    this.RoleID = this.userService.RoleID;
    this.CompanyID = this.userService.CompanyID;


    if (this.RoleID == 1) {
      this.financialAssetForm = this.formBuilder.group({
        financial_asset: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        financial_asset_id: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // monetary_value: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        // reporting_period: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        company_id: ['', [Validators.required]],
        monetaryYearData: this.formBuilder.array([this.createMonetaryYearGroup()]),
        purchase_date: ['', Validators.required],
         sale_date: [''],

      });
    } else {
      this.financialAssetForm = this.formBuilder.group({
        financial_asset: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        financial_asset_id: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // monetary_value: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        // reporting_period: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        company_id: [this.CompanyID],
        monetaryYearData: this.formBuilder.array([this.createMonetaryYearGroup()]),
        purchase_date: ['', Validators.required],
        sale_date: [''],

      });
    }


    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data;
      }
    });
  }
  get monetaryYearData(): FormArray {
    return this.financialAssetForm.get('monetaryYearData') as FormArray;
  }

  createMonetaryYearGroup(): FormGroup {
    const group = this.formBuilder.group({
      year: ['', Validators.required],
      monetary_value: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });

    group.get('year')?.valueChanges.subscribe(() => {
      const index = this.monetaryYearData.controls.indexOf(group);
      this.lastChangedIndex = index;
    });

    return group;
  }
  getYearDisplay(index: number): string {
  const control = this.monetaryYearData.at(index).get('year');
  const value = control?.value;
  return value ? value.toString() : '';
}


  selectDate(event: any, datepicker: any, currentIndex: number): void {
    if (!event) return;


    const selectedDate = event.toDate();
    const formattedDate = selectedDate.toLocaleDateString('en-GB');

    const group = this.monetaryYearData.at(currentIndex);
    const yearControl = group.get('year');


    const isDuplicate = this.monetaryYearData.controls.some((ctrl, i) => {
      if (i == currentIndex) return false;
      const value = ctrl.get('year')?.value;
      if (!value) return false;

      const existingDate =
        value._isAMomentObject
          ? value.toDate().toLocaleDateString('en-GB')
          : new Date(value).toLocaleDateString('en-GB');

      return existingDate == formattedDate;
    });

    if (isDuplicate) {
      yearControl?.setValue(event);
      yearControl?.setErrors({ duplicateDate: true });
      yearControl?.markAsTouched();
      datepicker.close();
      this.financialAssetForm.updateValueAndValidity({ emitEvent: true });
      return;
    }


    yearControl?.setValue(event);
    yearControl?.setErrors(null);
    yearControl?.markAsTouched();
    yearControl?.updateValueAndValidity();
    setTimeout(() => datepicker.close(), 50);
  }
  openYearPicker(picker: MatDatepicker<Moment>) {
    picker.open();
  }
 

 

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>, currentIndex: number): void {
  const selectedYear = normalizedYear.year(); // e.g. 2034
  const group = this.monetaryYearData.at(currentIndex);
  const yearControl = group.get('year');

  //  Check duplicate year
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
  yearControl?.updateValueAndValidity();

  datepicker.close();
}





  removeMonetaryYearGroup(index: number): void {
    if (this.monetaryYearData.length > 1) {
      this.monetaryYearData.removeAt(index);
    }
  }

  openDatePicker(picker: any): void {
    picker.open();
  }
 


  addMonetaryYearGroup(): void {
    this.monetaryYearData.push(this.createMonetaryYearGroup());
  }
  onSubmit() {
    this.loading = true;
    this.financialAssetForm.markAllAsTouched();

    if (this.financialAssetForm.invalid) {
      this.loading = false;
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

    console.log(' Final Payload:', payload);


    this.commonService.addData('financial-assets/add/', payload).subscribe(
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
        console.error('An error occurred:', error);
        this.loading = false;
      }
    );
  }

private extractYearValue(dateValue: any): string {
  if (!dateValue) return '';

  // Case 1: If it's a Moment object
  if (dateValue._isAMomentObject) {
    return dateValue.year().toString();
  }

   
  if (dateValue instanceof Date) {
    return dateValue.getFullYear().toString();
  }

   
  const match = dateValue.toString().match(/\d{4}/);
  return match ? match[0] : '';
}
  private formatDateToDMY(date: any): string | null {
    if (!date) return null;
    const d = date._isAMomentObject ? date.toDate() : new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  onNumberInput(event: any, formGroup: AbstractControl): void {
  const group = formGroup as FormGroup;
  let rawValue = event.target.value || '';

  // Remove commas and non-numeric characters
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
  return num.toLocaleString('en-US');
}


 
}

