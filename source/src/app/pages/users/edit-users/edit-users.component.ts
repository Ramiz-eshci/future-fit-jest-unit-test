import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-edit-users',
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
  templateUrl: './edit-users.component.html',
  styleUrl: './edit-users.component.scss'
})
export class EditUsersComponent {
  @ViewChild('allSelected')
  allSelected!: MatOption;
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  userForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  beFormList: any[] = [];
  selectedGoals: number[] = [];
  roleArr: any[] = [];
  CompanyID: any;
  title: any = 'Users';
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
    if (this.RoleID == 1) {
      this.userForm = this.formBuilder.group({
        FirstName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        LastName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        Email: ['', [Validators.required, ValidationService.emailValidator]],
        phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)]],
        CompanyID: ['', [Validators.required]],
        RoleId: ['', [Validators.required]],
        be_forms: [[]],
      });
    } else {
      this.userForm = this.formBuilder.group({
        FirstName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        LastName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
        Email: ['', [Validators.required, ValidationService.emailValidator]],
        phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)]],
        CompanyID: [''],
        RoleId: ['', [Validators.required]],
        be_forms: [[]],

      });
    }
    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data
      }
    });
    this.commonService.getData('break-even-goals/get').subscribe((response) => {
      if (response.status === true) {
        this.beFormList = response.data;
      }
    });
    this.commonService.getData('users/getrolelist').subscribe((response) => {
      if (response.status === true) {
        this.roleArr = response.data;
      }
    });


    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    //   ;
    console.log(this.routeId, 'routerId');
    this.commonService.getData('users/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        const user = response.data[0];
        this.userForm.controls['FirstName'].setValue(response.data[0].first_name)
        this.userForm.controls['LastName'].setValue(response.data[0].last_name)
        this.userForm.controls['RoleId'].setValue(response.data[0].role_id)
        if (this.RoleID == 1) {
          this.userForm.controls['CompanyID'].setValue(response.data[0].company_id)
        }
        this.userForm.controls['Email'].setValue(response.data[0].email)
        this.userForm.controls['phone_number'].setValue(response.data[0].phone_number)
        if (response.data[0].goal_ids && Array.isArray(response.data[0].goal_ids)) {
          this.userForm.controls['be_forms'].setValue(response.data[0].goal_ids);
        }
        if (response.data[0].goal_ids.length == this.beFormList.length) {
          setTimeout(() => {
            this.allSelected?.select();
          });

        }
      }
    }, (error) => {
      this._snackBar.open('Users Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/users']);
      }, 2000);
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
  isAllSelected(): boolean {

    const selected =
      this.userForm.value.be_forms || [];

    return (
      selected.length ===
      this.beFormList.length
    );

  }
  getSelectedBEFormNames() {

    const selectedIds =
      (this.userForm.value.be_forms || [])
        .filter(
          (x: any) => x !== 'SELECT_ALL'
        );

    const selectedNames =
      this.beFormList
        .filter((x: any) =>
          selectedIds.includes(x.id)
        )
        .map((x: any) => x.name);

    return selectedNames.join(', ');

  }

  onSubmit() {
    this.loading = true;



    this.userForm.controls['FirstName'].markAsTouched()
    this.userForm.controls['LastName'].markAsTouched()
    this.userForm.controls['Email'].markAsTouched()
    this.userForm.controls['phone_number'].markAsTouched()
    this.userForm.controls['RoleId'].markAsTouched()

    if (this.userForm.valid) {
      const payload = {
        ...this.userForm.value,
        be_forms: (
          this.userForm.value.be_forms || []
        ).filter(
          (x: any) => x != 'SELECT_ALL'
        )
      };
      if (!this.userForm.dirty) {
        this._snackBar.open('No changes made.', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/users']);
        }, 2000);
        this.loading = false;
        return;
      }
      this.commonService.addData('users/edit/' + this.routeId, payload).subscribe(
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
