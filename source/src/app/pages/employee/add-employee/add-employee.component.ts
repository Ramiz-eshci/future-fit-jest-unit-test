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
import { MatDatepicker } from '@angular/material/datepicker';
import { YearDateAdapter } from '../../site/add-site/add-site.component';

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
  selector: 'app-add-employee',
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
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class AddEmployeeComponent {
  companyArr: Company[] = [];
  sitesArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  employeeForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  lastChangedIndex: number | null = null;
  title: any = 'Employee';
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
      this.employeeForm = this.formBuilder.group({
        EmployeeGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        site: [''],
        CompanyID: ['', [Validators.required]],
        location: [''],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyData: this.formBuilder.array([this.createYearGroup()])
      });
    } else {
      this.employeeForm = this.formBuilder.group({
        EmployeeGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        site: [''],
        location: [''],
         // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyData: this.formBuilder.array([this.createYearGroup()])
      });
    }

    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
    this.commonService.getData(`site/sites/${this.CompanyID}`).subscribe((response) => {
      if (response.status === true) {
        this.sitesArr = response.data
      }
    });
  }
  get yearlyData(): FormArray {
    return this.employeeForm.get('yearlyData') as FormArray;
  }


  createYearGroup(): FormGroup {
    const group = this.formBuilder.group({
      Year: ['', [Validators.required]],
      NumberOfEmployees: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });

    group.get('Year')?.valueChanges.subscribe(() => {
      const index = this.yearlyData.controls.indexOf(group);
      this.lastChangedIndex = index;
    });

    return group;
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

    const group = this.yearlyData.at(currentIndex);
    const yearControl = group.get('Year');


    const isDuplicate = this.yearlyData.controls.some((ctrl, i) => {
      if (i == currentIndex) return false;
      const yearValue = ctrl.get('Year')?.value;
      return yearValue && yearValue.toString() == selectedYear.toString();
    });

    if (isDuplicate) {
      yearControl?.setValue(selectedYear.toString());
      yearControl?.setErrors({ duplicateYear: true });
      yearControl?.markAsTouched();
      datepicker.close();
      this.employeeForm.updateValueAndValidity({ emitEvent: true });
      return;
    }


    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors(null);
    yearControl?.markAsTouched();
    yearControl?.updateValueAndValidity();

    setTimeout(() => datepicker.close(), 50);
    this.employeeForm.updateValueAndValidity();
  }

  isDuplicateYear(currentIndex: number): boolean {
    const control = this.yearlyData.at(currentIndex).get('Year');
    return !!control?.errors?.['duplicateYear'];
  }
  addYearGroup(): void {
    this.yearlyData.push(this.createYearGroup());
  }

  removeYearGroup(index: number): void {
    this.yearlyData.removeAt(index);
  }

  getYearDate(value: any): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value, 0, 1);
  }


  chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>, controlName: string): void {
    let selectedYear: number;

    if (normalizedYear && typeof normalizedYear.year === 'function') {
      selectedYear = normalizedYear.year();
    } else if (typeof normalizedYear === 'number') {
      selectedYear = normalizedYear;
    } else if (normalizedYear instanceof Date) {
      selectedYear = normalizedYear.getFullYear();
    } else {
      console.error('Unexpected yearSelected event value:', normalizedYear);
      return;
    }


    const yearControl = this.employeeForm.get(controlName);
    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors(null);
    datepicker.close();
  }


  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    return parseFloat(value.toString().replace(/,/g, '')) || 0;
  }
  onNumberInput(event: any, formGroup: AbstractControl): void {
    const group = formGroup as FormGroup;
    let rawValue = event.target.value || '';

    rawValue = rawValue.replace(/,/g, '').replace(/[^0-9]/g, '');

    if (rawValue !== '') {
      const numberValue = Number(rawValue);
      group.get('NumberOfEmployees')?.setValue(numberValue, { emitEvent: false });
      event.target.value = this.formatNumberForDisplay(numberValue);
    } else {
      group.get('NumberOfEmployees')?.setValue('', { emitEvent: false });
    }
  }

  private formatNumberForDisplay(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');  
  }






  onSubmit() {
    this.loading = true;

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.loading = false;
      return;
    }

    const years = this.yearlyData.controls.map(x => x.value.Year).join(',');
    // const employees = this.yearlyData.controls.map(x => x.value.NumberOfEmployees).join(',');
    const employees = this.yearlyData.controls
      .map(x => this.parseNumber(x.value.NumberOfEmployees))
      .join(',');

    const payload = {
      ...this.employeeForm.value,
      Year: years,
      NumberOfEmployees: employees
    };

    console.log('Final Payload:', payload);

    this.commonService.addData('employee/add/', payload).subscribe(
      response => {
        this._snackBar.open(response.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/employee']);
        }, 2000);
      },
      error => {
        console.error('An error occurred:', error);
        this.loading = false;
      }
    );
  }



}
