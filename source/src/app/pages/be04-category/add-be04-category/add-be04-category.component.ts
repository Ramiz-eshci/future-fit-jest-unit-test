 
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
  selector: 'app-add-be04-category',
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
  templateUrl: './add-be04-category.component.html',
  styleUrl: './add-be04-category.component.scss'
})
export class AddBe04CategoryComponent {
 @ViewChild('select') select: MatSelect;
  categoryForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  title: any = 'Category';

  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID;
    this.CompanyID = this.userService.CompanyID;
 
    this.categoryForm = this.formBuilder.group({
      category_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]]
    });
  }

  onSubmit() {
    this.loading = true;

    this.categoryForm.controls['category_name'].markAsTouched();

    if (this.categoryForm.valid) {
      this.commonService.addData('be04-category/add', this.categoryForm.value).subscribe(
        (response) => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/be04Category']);  
          }, 2000);
        },
        (error) => {
          console.error('An error occurred:', error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }
}