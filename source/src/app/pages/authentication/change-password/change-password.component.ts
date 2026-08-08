import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule,  CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  changePasswordForm: any;
  title: any = 'Change Password';
  loading: boolean = false;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
   
    this.changePasswordForm = this.formBuilder.group({
      OldPassword: ['', [Validators.required]],
      NewPassword: ['', [Validators.required, ValidationService.invalidPassword]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: ValidationService.confirmPasswordValidator('NewPassword', 'confirmPassword')
    });
  }

  onSubmit(){
    this.loading=true;
    this.changePasswordForm.controls['OldPassword'].markAsTouched()
    this.changePasswordForm.controls['NewPassword'].markAsTouched()
    console.log(JSON.stringify(this.changePasswordForm.value), 'this.changePasswordForm')
    if (this.changePasswordForm.valid) {
      this.userService.change_password(this.changePasswordForm.value)
     
    }
    this.loading=false;
  }
}
