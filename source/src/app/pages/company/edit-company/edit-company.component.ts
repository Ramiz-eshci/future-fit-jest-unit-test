import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
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
  selector: 'app-edit-company',
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
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss'
})
export class EditCompanyComponent {
  companyTypeArr: CompanyType[] = [];
  selectedCompanyType = '';
  loading: boolean = false;
  apiErrors: any = {};
  companyForm: any;
  title: any = 'Company';
  residualRiskList: ResidualRisk[] = [];
  routeId: string | null = null;

  @ViewChild('select') select: MatSelect;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.routeId = this.route.snapshot.paramMap.get('id');


    this.companyForm = this.formBuilder.group({
      CompanyName: ['', [Validators.required]],
      CompanyNumber: ['', [Validators.required ,Validators.pattern('^[0-9]{1,12}$')]],
      CompanyEmail: ['', [Validators.required, ValidationService.emailValidator]],
      // ExternalTreatScore: ['', [Validators.required]],
      CompanyAddress: ['', Validators.required],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      password: [''],
      confirmPassword: [''],
    }, {
      validators: ValidationService.confirmPasswordValidator('password', 'confirmPassword')
    });
    //Residual Risk List

    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    console.log(this.routeId, 'routerId');
    this.commonService.getData('company/get/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        this.companyForm.controls['CompanyName'].setValue(response.data[0].company_name)
        this.companyForm.controls['CompanyNumber'].setValue(response.data[0].contact_number)
        this.companyForm.controls['CompanyEmail'].setValue(response.data[0].company_email)
        this.companyForm.controls['CompanyAddress'].setValue(response.data[0].company_address)
        this.companyForm.controls['FirstName'].setValue(response.data[0].first_name)
        this.companyForm.controls['LastName'].setValue(response.data[0].last_name)
        // this.companyForm.controls['NRAScore'].setValue(response.data[0].nra_score)
        // this.companyForm.controls['ExternalTreatScore'].setValue(response.data[0].external_threat_score)
        this.selectedCompanyType = response.data[0].company_type_id;


        // if(response.data[0].riskOwners != ''){
        //   this.companyForm.controls['riskOwners'].setValue(response.data[0].riskOwners.split(",").map(Number))
        // }
      }
    }, (error) => {
      this._snackBar.open('Company Details Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/company']);
      }, 2000);
    });
    // Subscribe to changes in the password field
    this.companyForm.get('password')?.valueChanges.subscribe((password: any) => {
      const confirmPasswordControl = this.companyForm.get('confirmPassword');

      if (password) {
        this.companyForm.get('password')?.setValidators([Validators.required, ValidationService.invalidPassword]);
        confirmPasswordControl?.setValidators([Validators.required]);
      } else {
        this.companyForm.get('password')?.clearValidators();
        confirmPasswordControl?.clearValidators();
      }

      this.companyForm.get('password')?.updateValueAndValidity();
      confirmPasswordControl?.updateValueAndValidity();
    });
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
    console.log(this.companyForm, 'this.companyForm')
    if (this.companyForm.valid) {
      this.commonService.addData('company/edit/' + this.routeId, this.companyForm.value).subscribe(
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
