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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
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
export class YearDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    return date.getFullYear().toString(); // Show only year
  }
}
@Component({
  selector: 'app-edit-employee',
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
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss'
})
export class EditEmployeeComponent {
  companyArr: Company[] = [];
  sitesArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  employeeForm: any;
  loading: boolean = false;
  title: any = 'Employee';
  RoleID: any = 1;
  lastChangedIndex: number | null = null;

  CompanyID: any;
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
      this.employeeForm = this.formBuilder.group({
        EmployeeGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // NumberOfEmployees: ['', [Validators.required ,Validators.pattern(/^[0-9]+$/) ]],
        site: [''],
        CompanyID: ['', [Validators.required]],
        location: [''],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyData: this.formBuilder.array([])
        // Year: ['', [Validators.required]],
      });
    } else {
      this.employeeForm = this.formBuilder.group({
        EmployeeGroup: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GroupID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        //  NumberOfEmployees: ['', [Validators.required ,Validators.pattern(/^[0-9]+$/) ]],
        site: [''],
        // CompanyID: ['', [Validators.required]],
        location: [''],
        // SiteID: ['', [Validators.required]],
        SiteID: [''],
        yearlyData: this.formBuilder.array([])
        //Year: ['', [Validators.required]], 
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

    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    console.log(this.routeId, 'routerId');
    this.commonService.getData('employee/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        this.employeeForm.controls['EmployeeGroup'].setValue(response.data[0].employee_group)
        this.employeeForm.controls['GroupID'].setValue(response.data[0].group_id)
        //  this.employeeForm.controls['NumberOfEmployees'].setValue(response.data[0].number_of_employees)
        this.employeeForm.controls['site'].setValue(response.data[0].site)
        this.employeeForm.controls['SiteID'].setValue(response.data[0].site_id)
        if (this.RoleID == 1) {
          this.employeeForm.controls['CompanyID'].setValue(response.data[0].company_id)
        }
        this.employeeForm.controls['location'].setValue(response.data[0].location)
        const years = response.data[0].year ? response.data[0].year.split(',') : [];
        const employees = response.data[0].number_of_employees ? response.data[0].number_of_employees.split(',') : [];
        this.yearlyData.clear();
        for (let i = 0; i < years.length; i++) {
          // this.yearlyData.push(this.createYearGroup(years[i], employees[i] || '', true));
           const formattedValue = this.formatNumberForDisplay(employees[i] || '');
  this.yearlyData.push(this.createYearGroup(years[i], formattedValue, true));
        }




      }
    }, (error) => {
      this._snackBar.open('Employee Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/employee']);
      }, 2000);
    });
  }
  get yearlyData(): FormArray {
    return this.employeeForm.get('yearlyData') as FormArray;
  }
  selectYear(event: any, datepicker: any, currentIndex: number): void {
    let selectedYear: number;


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
    yearControl?.markAsDirty();
    yearControl?.updateValueAndValidity();


    setTimeout(() => datepicker.close(), 50);
    this.employeeForm.updateValueAndValidity();
  }

  isDuplicateYear(currentIndex: number): boolean {
    const control = this.yearlyData.at(currentIndex).get('Year');
    return !!control?.errors?.['duplicateYear'];
  }



 
  createYearGroup(year = '', employees = '', isExisting = false): FormGroup {
    const group = this.formBuilder.group({
      Year: [year, [Validators.required]],
      NumberOfEmployees: [employees, [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
      isExisting: [isExisting]
    });

    group.get('Year')?.valueChanges.subscribe(() => {
      const index = this.yearlyData.controls.indexOf(group);
      this.lastChangedIndex = index;
    });

    return group;
  }


  addYearGroup(): void {
    this.yearlyData.push(this.createYearGroup());
  }
 
  removeYearGroup(index: number): void {
    const yearGroup = this.yearlyData.at(index).value;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the data Once deleted, it cannot be recovered.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!yearGroup.isExisting) {
          this.yearlyData.removeAt(index);

          return;
        }

        this.yearlyData.removeAt(index);


        const years = this.yearlyData.controls.map(x => x.value.Year).join(',');
        // const employees = this.yearlyData.controls.map(x => x.value.NumberOfEmployees).join(',');
const employees = this.yearlyData.controls
  .map(x => x.value.NumberOfEmployees?.toString().replace(/,/g, ''))
  .join(',');

        const payload = {
          ...this.employeeForm.value,
          Year: years,
          NumberOfEmployees: employees
        };

        console.log('Updated Payload after deleting year:', payload);


        this.commonService.addData('employee/edit/' + this.routeId, payload).subscribe(
          (response: any) => {
            if (response.status) {
              Swal.fire(
                'Deleted!',
                `Year ${yearGroup.Year} removed successfully.`,
                'success'
              );
            } else {
              Swal.fire(
                'Error!',
                response.message || 'Failed to delete year.',
                'error'
              );
            }
          },
          (error) => {
            console.error('Error deleting year:', error);
            Swal.fire(
              'Error!',
              'Something went wrong while deleting year.',
              'error'
            );
          }
        );
      }
    });
  }


  getYearDate(value: any): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value, 0, 1);
  }
  chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>, controlName: string): void {
    let selectedYear: number;

    if (normalizedYear && typeof normalizedYear.year == 'function') {
      selectedYear = normalizedYear.year();
    } else if (typeof normalizedYear === 'number') {
      selectedYear = normalizedYear;
    } else if (normalizedYear instanceof Date) {
      selectedYear = normalizedYear.getFullYear();
    } else {
      console.error('Unexpected yearSelected event value:', normalizedYear);
      return;
    }

    this.employeeForm.get(controlName)?.setValue(new Date(selectedYear, 0, 1));
    this.employeeForm.get(controlName)?.setErrors(null);
    this.employeeForm.markAsDirty();
    datepicker.close();
  }
  onNumberInput(event: any, formGroup: AbstractControl): void {
  const group = formGroup as FormGroup;
  let rawValue = event.target.value || '';

  //  Remove commas and non-digit characters
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
  return num.toLocaleString('en-US'); // e.g. 12,000
}


  onSubmit() {
    this.loading = true;


    this.employeeForm.controls['EmployeeGroup'].markAsTouched();
    this.employeeForm.controls['GroupID'].markAsTouched();
    this.employeeForm.controls['site'].markAsTouched();
    this.employeeForm.controls['location'].markAsTouched();
    if (this.RoleID == 1) {
      this.employeeForm.controls['CompanyID'].markAsTouched();
    }
    this.employeeForm.controls['SiteID'].markAsTouched();

    this.yearlyData.controls.forEach((control) => {
      const group = control as FormGroup;
      group.markAllAsTouched();
    });



    if (this.employeeForm.invalid) {
      this.loading = false;
      return;
    }


    if (!this.employeeForm.dirty && this.yearlyData.pristine) {
      this._snackBar.open('No changes made.', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customSuccessClass']
      });
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/employee']);
      }, 2000);
      this.loading = false;
      return;
    }


    const years = this.yearlyData.controls.map(x => x.value.Year).join(',');
    // const employees = this.yearlyData.controls.map(x => x.value.NumberOfEmployees).join(',');
    const employees = this.yearlyData.controls
  .map(x => {
    const val = x.value.NumberOfEmployees;
    if (val === null || val === undefined) return '';
    return String(val).replace(/,/g, '').trim();  
  })
  .join(',');
    const formValue = {
      ...this.employeeForm.value,
      Year: years,
      NumberOfEmployees: employees
    };

    console.log('Edit Payload:', formValue);


    this.commonService.addData('employee/edit/' + this.routeId, formValue).subscribe(
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
