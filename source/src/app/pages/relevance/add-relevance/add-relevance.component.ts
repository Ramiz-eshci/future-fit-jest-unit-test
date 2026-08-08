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

@Component({
  selector: 'app-add-relevance',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './add-relevance.component.html',
  styleUrl: './add-relevance.component.scss'
})
export class AddRelevanceComponent {
  
  selectedCompanyType = '';
  loading: boolean = false;
  apiErrors: any = {};
  relevanceForm: any;
  title: any = 'Relevance';
  riskBGColor: any = '';
  riskFontColor: any = '';
  @ViewChild('select') select: MatSelect;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {

    this.relevanceForm = this.formBuilder.group({
      relevance_name: ['', [Validators.required]],
     
      // riskOwners: ['', [Validators.required]]
    });
    //Residual Risk List

  }
  ngOnInit() {

  }
  onSubmit() {
    this.loading = true;
    console.log(this.relevanceForm, 'this.relevanceForm')
    this.relevanceForm.controls['relevance_name'].markAsTouched()
   
    console.log(this.relevanceForm, 'this.relevanceForm')
    if (this.relevanceForm.valid) {
      // this.companyForm.controls['riskOwners'].setValue(this.riskOwners)
      this.commonService.addData('relevance/add/', this.relevanceForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/relevance']);
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
