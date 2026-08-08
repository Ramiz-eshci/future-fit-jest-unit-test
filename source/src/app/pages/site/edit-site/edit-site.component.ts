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
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
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
  selector: 'app-edit-site',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './edit-site.component.html',
  styleUrl: './edit-site.component.scss',
  providers: [
    { provide: DateAdapter, useClass: YearDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_YEAR_ONLY_FORMATS }
  ]
})
export class EditSiteComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  siteForm: any;
  loading: boolean = false;
  title: any = 'Site';
  routeId: string | null = null;
  RoleID: any = 1;
  CompanyID: any;
  yearsList: number[] = [];
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
      this.siteForm = this.formBuilder.group({
        SiteName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        SiteID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        CompanyID: ['', [Validators.required]],
        Location: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GaseousReferenceyear: ['', [Validators.required]],
        GaseousRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        LiquidReferenceyear: ['', [Validators.required]],
        LiquidRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        SolidReferenceyear: ['', [Validators.required]],
        SolidRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        GHGemissionsReferenceYear: ['', [Validators.required]],
        GHGEmissionsRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        WasteGeneratedReferenceYear: ['', [Validators.required]],
        WasteGeneratedRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]]
        // year:['']
      });
    } else {
      this.siteForm = this.formBuilder.group({
        SiteName: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        SiteID: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // CompanyID: ['', [Validators.required]],
        Location: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        GaseousReferenceyear: ['', [Validators.required]],
        GaseousRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        LiquidReferenceyear: ['', [Validators.required]],
        LiquidRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        SolidReferenceyear: ['', [Validators.required]],
        SolidRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        GHGemissionsReferenceYear: ['', [Validators.required]],
        GHGEmissionsRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]],
        WasteGeneratedReferenceYear: ['', [Validators.required]],
        WasteGeneratedRefYearValue: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]]

        // year:['']
      });
    }
    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    console.log(this.routeId, 'routerId');
    this.commonService.getData('site/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
         const data = response.data[0];
        this.siteForm.controls['SiteName'].setValue(response.data[0].site_name)
        this.siteForm.controls['SiteID'].setValue(response.data[0].site_id_manual)
        if (this.RoleID == 1) {
          this.siteForm.controls['CompanyID'].setValue(response.data[0].company_id)
        }
        this.siteForm.controls['Location'].setValue(response.data[0].location)

         const gaseousYear = Number(data.be05gaseous_ref_year);
      this.siteForm.controls['GaseousReferenceyear'].setValue(gaseousYear);
      this.siteForm.controls['GaseousRefYearValue'].setValue(this.formatNumberForDisplay(data.be05gaseous_ref_year_value));

      const liquidYear = Number(data.be05liquid_ref_year);
      this.siteForm.controls['LiquidReferenceyear'].setValue(liquidYear);
      this.siteForm.controls['LiquidRefYearValue'].setValue(this.formatNumberForDisplay(data.be05liquid_ref_year_value));

      const solidYear = Number(data.be05solid_reference_year);
      this.siteForm.controls['SolidReferenceyear'].setValue(solidYear);
      this.siteForm.controls['SolidRefYearValue'].setValue(this.formatNumberForDisplay(data.be05solid_ref_year_value));

      const ghgEmissionsYear = Number(data.be06ghgemmison_ref_year);
      this.siteForm.controls['GHGemissionsReferenceYear'].setValue(ghgEmissionsYear);
      this.siteForm.controls['GHGEmissionsRefYearValue'].setValue(this.formatNumberForDisplay(data.be06ghgemmison_ref_year_value));

      const wasteGeneratedYear = Number(data.be07waste_ref_year);
      this.siteForm.controls['WasteGeneratedReferenceYear'].setValue(wasteGeneratedYear);
      this.siteForm.controls['WasteGeneratedRefYearValue'].setValue(this.formatNumberForDisplay(data.be07waste_ref_year_value));

        // const gaseousYear = Number(response.data[0].be05gaseous_ref_year);
        // this.siteForm.controls['GaseousReferenceyear'].setValue(gaseousYear);
        // this.siteForm.controls['GaseousRefYearValue'].setValue(response.data[0].be05gaseous_ref_year_value)
        // const liquidYear = Number(response.data[0].be05liquid_ref_year);
        // this.siteForm.controls['LiquidReferenceyear'].setValue(liquidYear);
        // this.siteForm.controls['LiquidRefYearValue'].setValue(response.data[0].be05liquid_ref_year_value)
        // const solidYear = Number(response.data[0].be05solid_reference_year);
        // this.siteForm.controls['SolidReferenceyear'].setValue(solidYear);
        // this.siteForm.controls['SolidRefYearValue'].setValue(response.data[0].be05solid_ref_year_value)
        // const ghgEmissionsYear = Number(response.data[0].be06ghgemmison_ref_year);
        // this.siteForm.controls['GHGemissionsReferenceYear'].setValue(ghgEmissionsYear);
        // this.siteForm.controls['GHGEmissionsRefYearValue'].setValue(response.data[0].be06ghgemmison_ref_year_value)
        // const wasteGeneratedYear = Number(response.data[0].be07waste_ref_year);
        // this.siteForm.controls['WasteGeneratedReferenceYear'].setValue(wasteGeneratedYear);
        // this.siteForm.controls['WasteGeneratedRefYearValue'].setValue(response.data[0].be07waste_ref_year_value)
      }
    }, (error) => {
      this._snackBar.open('Site Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/site']);
      }, 2000);
    });
  }

  ngOnInit(): void {
    this.generateYears();
  }
  generateYears() {
    const currentYear = new Date().getFullYear();
    this.yearsList = [];
    for (let i = 0; i < 30; i++) {
      this.yearsList.push(currentYear - i);
    }
  }
  
  
  chosenYearHandler(normalizedYear: Date, datepicker: MatDatepicker<any>, controlName: string) {
  const year = normalizedYear.getFullYear();
  const control = this.siteForm.get(controlName);
  control?.setValue(year);
  control?.markAsDirty();  
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
  private parseNumber(value: any): number {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, ''));
}


private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}



  onSubmit() {
    this.loading = true;
    this.siteForm.controls['SiteName'].markAsTouched()
    this.siteForm.controls['SiteID'].markAsTouched()
    // this.siteForm.controls['CompanyID'].markAsTouched()
    this.siteForm.controls['Location'].markAsTouched()
    this.siteForm.controls['GaseousReferenceyear'].markAsTouched()
    this.siteForm.controls['GaseousRefYearValue'].markAsTouched()
    this.siteForm.controls['LiquidReferenceyear'].markAsTouched()
    this.siteForm.controls['LiquidRefYearValue'].markAsTouched()
    this.siteForm.controls['SolidReferenceyear'].markAsTouched()
    this.siteForm.controls['SolidRefYearValue'].markAsTouched()
    this.siteForm.controls['GHGemissionsReferenceYear'].markAsTouched()
    this.siteForm.controls['GHGEmissionsRefYearValue'].markAsTouched()
    this.siteForm.controls['WasteGeneratedReferenceYear'].markAsTouched()
     this.siteForm.controls['WasteGeneratedRefYearValue'].markAsTouched()
    console.log(this.siteForm, 'this.siteForm')
    if (this.siteForm.valid) {
      if (!this.siteForm.dirty) {
        this._snackBar.open('No changes made.', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/site']);
        }, 2000);
        this.loading = false;
        return;
      }
        const formValue = { ...this.siteForm.value };

    formValue.GaseousRefYearValue = this.parseNumber(formValue.GaseousRefYearValue);
    formValue.LiquidRefYearValue = this.parseNumber(formValue.LiquidRefYearValue);
    formValue.SolidRefYearValue = this.parseNumber(formValue.SolidRefYearValue);
    formValue.GHGEmissionsRefYearValue = this.parseNumber(formValue.GHGEmissionsRefYearValue);
    formValue.WasteGeneratedRefYearValue = this.parseNumber(formValue.WasteGeneratedRefYearValue);
        this.commonService.addData('site/edit/' + this.routeId, formValue ).subscribe(
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


      
      this.loading = false;
    }
  }
}


 
