import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule, MatSelect, MatOption } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-users',
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
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.scss'
})
export class AddUsersComponent {
  @ViewChild('allSelected') allSelected!: MatOption;
  companyArr: Company[] = [];
  beFormList: any[] = [];
  roleArr: any[] = [];
  @ViewChild('select') select: MatSelect;
  userForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  title: any = 'Users';
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
      this.userForm = this.formBuilder.group({
        FirstName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        LastName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        Email: ['', [Validators.required, ValidationService.emailValidator]],
        phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)]],
        CompanyID: ['', [Validators.required]],
        password: ['', [Validators.required]],
        be_forms: [[]],
        RoleId: ['', Validators.required],
        confirmPassword: ['', [Validators.required]],
      },
        {
          validators: ValidationService.confirmPasswordValidator('password', 'confirmPassword')
        });
    } else {
      this.userForm = this.formBuilder.group({
        FirstName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        LastName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        Email: ['', [Validators.required, ValidationService.emailValidator]],
        phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)]],
        CompanyID: [''],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
        be_forms: [[]],
        RoleId: ['', Validators.required],
      },
        {
          validators: ValidationService.confirmPasswordValidator('password', 'confirmPassword')
        });
    }
    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
    this.commonService.getData('break-even-goals/get').subscribe((response) => {
      if (response.status === true) {
        this.beFormList = response.data
      }
    });
    this.commonService.getData('users/getrolelist').subscribe((response) => {
      if (response.status) {
        this.roleArr = response.data;
      }

    });
  }

 toggleAllSelection() {

  if (this.isAllSelected()) {

    this.userForm.patchValue({
      be_forms: []
    });

    this.allSelected.deselect();

  } else {

    const allIds =
      this.beFormList.map(
        (x: any) => x.id
      );

    this.userForm.patchValue({
      be_forms: allIds
    });

    this.allSelected.select();

  }

}
 optionClick() {

  const selected =
    this.userForm.value.be_forms || [];

  if (
    selected.length ===
    this.beFormList.length
  ) {

    this.allSelected.select();

  } else {

    this.allSelected.deselect();

  }

}
 getSelectedBEFormNames() {

  const selectedIds =
    this.userForm.value.be_forms || [];

  const selectedNames =
    this.beFormList
      .filter((x: any) =>
        selectedIds.includes(x.id)
      )
      .map((x: any) => x.name);

  return selectedNames.join(', ');

}
isAllSelected(): boolean {

  const selected =
    this.userForm.value.be_forms || [];

  return (
    selected.length ===
    this.beFormList.length
  );

}

  onSubmit() {
    this.loading = true;
    if (this.userForm.controls['CompanyID']) {
      this.userForm.controls['CompanyID'].markAsTouched();
    }
    this.userForm.controls['FirstName'].markAsTouched()
    this.userForm.controls['LastName'].markAsTouched()
    this.userForm.controls['Email'].markAsTouched()
    this.userForm.controls['phone_number'].markAsTouched()
    this.userForm.controls['password'].markAsTouched()
    this.userForm.controls['RoleId'].markAsTouched()
    //  
    console.log(this.userForm, 'this.userForm')
    if (this.userForm.valid) {
       const payload = {
      ...this.userForm.value,
      be_forms: (this.userForm.value.be_forms || []).filter(
        (x: any) => x != 'SELECT_ALL'
      )
    };
      this.commonService.addData('users/add/', payload).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/users']);
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
