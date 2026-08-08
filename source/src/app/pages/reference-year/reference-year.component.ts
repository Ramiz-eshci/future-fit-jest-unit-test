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
import { MaterialModule } from 'src/app/material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RolepermissionService } from 'src/app/services/rolepermission.service';

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

interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-reference-year',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // en-GB gives DD/MM/YYYY by default
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './reference-year.component.html',
  styleUrl: './reference-year.component.scss'
})
export class ReferenceYearComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  refForm: any;
  loading: boolean = false;
  title: any = 'Site';
  routeId: string | null = null;
  RoleID: any = 1;
  CompanyID: any;
    canEdit = false;
  canAdd = false;
  canDelete = false;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private permissionService: RolepermissionService
  ) {
    this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID

    // this.routeId = this.route.snapshot.paramMap.get('id');
    this.refForm = this.formBuilder.group({
      RefYear: ['', [Validators.required]],
      RefYearValue: ['', [Validators.required]],
    });

    this.commonService.getData('reference-year/getById/').subscribe((response) => {
      // console.log('response p =>', response.status);
      if (response.status === true) {
        // this.refForm.controls['RefYear'].setValue(response.data[0].ref_year)
        this.refForm.controls['RefYear'].setValue(new Date(response.data[0].ref_year, 0, 1))
        this.refForm.controls['RefYearValue'].setValue(response.data[0].ref_year_value)
      }
    }, (error) => {
      this._snackBar.open('Data Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/reference-year']);
      }, 2000);
    });
  }
  // This is the key function
  setYear(event: any, datepicker: any) {
    let selectedYear: number;

    // Check if it's a Moment object
    if (event && typeof event.year === 'function') {
      selectedYear = event.year();
    } else if (typeof event === 'number') {
      selectedYear = event;
    } else if (event instanceof Date) {
      selectedYear = event.getFullYear();
    } else {
      console.error('Unexpected yearSelected event value:', event);
      return;
    }

    // const selectedDate = new Date(selectedYear, 0, 1); // Jan 1 of selected year
    const selectedDate = new Date(selectedYear, 0, 1); // Jan 1, YYYY, 00:00 local time
    selectedDate.setHours(12, 0, 0); // Force 12 PM to avoid UTC shift
    this.refForm.get('RefYear')?.setValue(selectedDate);
    datepicker.close();
  }
   

  onSubmit() {
    this.loading = true;
    this.refForm.controls['RefYear'].markAsTouched()
    this.refForm.controls['RefYearValue'].markAsTouched()
    // this.refForm.controls['CompanyID'].markAsTouched()

    console.log(this.refForm, 'this.refForm')
    if (this.refForm.valid) {
      // if (!this.refForm.dirty) {
      //   this._snackBar.open('No changes made.', '', {
      //     duration: 2000,
      //     verticalPosition: 'top',
      //     horizontalPosition: 'end',
      //     panelClass: ['customSuccessClass']
      //   });
      //   setTimeout(() => {
      //     this.loading = false;
      //     this.router.navigate(['/reference-year']);
      //   }, 2000);
      //   this.loading = false;
      //   return;
      // } else {
      this.commonService.addData('reference-year/edit/', this.refForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/reference-year']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );



      this.loading = false;
    }
  }
}
