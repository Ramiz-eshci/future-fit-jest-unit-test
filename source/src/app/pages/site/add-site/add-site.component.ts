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
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';

 
 export const MY_YEAR_ONLY_FORMATS = {
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
export class YearDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    return date.getFullYear().toString(); // Show only year
  }
}

@Component({
  selector: 'app-add-site',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatNativeDateModule
    
  ],
  templateUrl: './add-site.component.html',
  styleUrl: './add-site.component.scss',
 providers: [
  { provide: DateAdapter, useClass: YearDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MY_YEAR_ONLY_FORMATS }
]

})
 



  
export class AddSiteComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  siteForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  title: any = 'Site';
  yearsList: number[] = [];
  startAt = new Date(); 
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID
    // this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID
    if (this.RoleID == 1) {
      this.siteForm = this.formBuilder.group({
        SiteName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        SiteID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        CompanyID: ['', [Validators.required]],
        Location: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
          GaseousReferenceyear:['', [Validators.required]],
        GaseousRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        LiquidReferenceyear:['', [Validators.required]],
        LiquidRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        SolidReferenceyear:['', [Validators.required]],
        SolidRefYearValue: ['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        GHGemissionsReferenceYear: ['', [Validators.required]],
        GHGEmissionsRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        WasteGeneratedReferenceYear: ['', [Validators.required]],
        WasteGeneratedRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]]
        

      });
    } else {
      this.siteForm = this.formBuilder.group({
        SiteName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        SiteID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        Location: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GaseousReferenceyear:['', [Validators.required]],
        GaseousRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        LiquidReferenceyear:['', [Validators.required]],
        LiquidRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        SolidReferenceyear:['', [Validators.required]],
        SolidRefYearValue: ['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        GHGemissionsReferenceYear: ['', [Validators.required]],
        GHGEmissionsRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]],
        WasteGeneratedReferenceYear: ['', [Validators.required]],
        WasteGeneratedRefYearValue:['', [Validators.required , Validators.pattern(/^[0-9,]+$/)]]
        

      });
    }
    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
  }

  ngOnInit(): void {
  this.generateYears();
}
  generateYears() {
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 30; i++) {
    this.yearsList.push(currentYear - i);
  }
  }
 
  chosenYearHandler(normalizedYear: Date, datepicker: MatDatepicker<any>, controlName: string) {
  const year = normalizedYear.getFullYear();
  this.siteForm.get(controlName)?.setValue(year);
  datepicker.close();
}

getYearDate(year: number): Date | null {
  return year ? new Date(year, 0, 1) : null;
  }
  onNumberInput(event: any, controlName: string): void {
  let rawValue = event.target.value || '';
  rawValue = rawValue.replace(/,/g, '').replace(/[^0-9]/g, '');

  if (rawValue !== '') {
    const numberValue = Number(rawValue);
    this.siteForm.get(controlName)?.setValue(numberValue, { emitEvent: false });
    event.target.value = this.formatNumberForDisplay(numberValue);
  } else {
    this.siteForm.get(controlName)?.setValue('', { emitEvent: false });
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


  onSubmit() {
    this.loading = true;
    this.siteForm.controls['SiteName'].markAsTouched()
    this.siteForm.controls['SiteID'].markAsTouched()
    // this.siteForm.controls['CompanyID'].markAsTouched()
    this.siteForm.controls['Location'].markAsTouched()
    console.log(this.siteForm, 'this.siteForm')
    if (this.siteForm.valid) {
      const formValue = { ...this.siteForm.value };

     
    formValue.GaseousRefYearValue = this.parseNumber(formValue.GaseousRefYearValue);
    formValue.LiquidRefYearValue = this.parseNumber(formValue.LiquidRefYearValue);
    formValue.SolidRefYearValue = this.parseNumber(formValue.SolidRefYearValue);
    formValue.GHGEmissionsRefYearValue = this.parseNumber(formValue.GHGEmissionsRefYearValue);
    formValue.WasteGeneratedRefYearValue = this.parseNumber(formValue.WasteGeneratedRefYearValue);
      this.commonService.addData('site/add/', formValue).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/site']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }

}

 
