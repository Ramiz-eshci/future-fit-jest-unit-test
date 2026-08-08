import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,FormArray,
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

interface ResidualRisk {
  id: string;
  name: string;
  score_start_range: number;
  score_end_range: number;
  color_code: string;
}

interface CompanyType {
  id: string;
  name: string;
}
interface Role {
  id: string;
  name: string;
}
@Component({
  selector: 'app-add-company',
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
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent {
  companyTypeArr: CompanyType[] = [];
  selectedCompanyType = '';
  loading: boolean = false;
  apiErrors: any = {};
  companyForm: any;
  title: any = 'Company';
  riskBGColor: any = '';
  riskFontColor: any = '';
  residualRiskList: ResidualRisk[] = [];
  @ViewChild('select') select: MatSelect;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
   
    this.companyForm = this.formBuilder.group({
      CompanyName: ['', [Validators.required]],
      CompanyNumber: ['', [Validators.required ,Validators.pattern('^[0-9]{1,12}$')]],
      CompanyEmail: ['', [Validators.required, ValidationService.emailValidator]],
      CompanyAddress: ['', Validators.required],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      password: ['', [Validators.required, ValidationService.invalidPassword]],
      confirmPassword: ['', [Validators.required]],  
      // riskOwners: ['', [Validators.required]]
    }, {
      validators: ValidationService.confirmPasswordValidator('password', 'confirmPassword')
    });
    //Residual Risk List
    
  }
  ngOnInit() {
 
  }
  onSubmit() {
    this.loading = true;
    console.log(this.companyForm, 'this.companyForm')
    this.companyForm.controls['CompanyName'].markAsTouched()
    this.companyForm.controls['CompanyNumber'].markAsTouched()
    this.companyForm.controls['CompanyEmail'].markAsTouched()
    // this.companyForm.controls['NRAScore'].markAsTouched()

    this.companyForm.controls['CompanyAddress'].markAsTouched()
    // this.companyForm.controls['ExternalTreatScore'].markAsTouched()
    this.companyForm.controls['FirstName'].markAsTouched()
    this.companyForm.controls['LastName'].markAsTouched()
    // this.companyForm.controls['riskOwners'].markAsTouched()
    console.log(this.companyForm, 'this.companyForm')
    if (this.companyForm.valid) {
      // this.companyForm.controls['riskOwners'].setValue(this.riskOwners)
      this.commonService.addData('company/add/', this.companyForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/company']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }

  public handleError(error: any) {
    console.log(error, 'error 123')
  }
  onlyAlphaAndSpace() {

  }
}
