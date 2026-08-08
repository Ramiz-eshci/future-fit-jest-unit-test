import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule }
  from '@angular/material/expansion';

import { MatCheckboxModule }
  from '@angular/material/checkbox';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule, MatExpansionModule,
    MatCheckboxModule
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss'
})
export class AddRoleComponent {

  roleForm!: FormGroup;
  loading = false;
  title = 'Role';
  permissionData: any[] = [];
  expandedMenus: any = {};
  expandedChildren: any = {};
  selectedPermissions: any = [];


  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {

    this.roleForm = this.fb.group({

      RoleName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9 ]+$/)
        ]
      ],

      Description: [''],
      AccessLevel: [
        '',
        Validators.required
      ],
      Status: [1],
      permissions: [[]]

    })
    this.getMenuTree();

  }
  toggleMenu(menuId: number) {

    this.expandedMenus[menuId] =
      !this.expandedMenus[menuId];

  }
  toggleChildMenu(menuId: number) {

    this.expandedChildren[menuId] =
      !this.expandedChildren[menuId];

  }
  togglePermission(
    menuId: number,
    checked: boolean
  ) {

    if (checked) {
      if (!this.selectedPermissions.includes(menuId)) {
        this.selectedPermissions.push(menuId);
      }
    } else {

      this.selectedPermissions =
        this.selectedPermissions.filter(
          (x: any) => x != menuId
        );

    }

    this.roleForm.patchValue({
      permissions: this.selectedPermissions
    });

  }
 toggleParentPermission(
  parent: any,
  checked: boolean
) {

  this.togglePermission(   
    parent.MenuId,
    checked
  );

  parent.children?.forEach(
    (child: any) => {

      this.togglePermission(
        child.MenuId,
        checked
      );

      child.actions?.forEach(
        (action: any) => {

          this.togglePermission(
            action.MenuId,
            checked
          );

        }
      );
    }
  );
}

  getMenuTree() {

    this.commonService
      .getData('role/getMenuTree')
      .subscribe({

        next: (response: any) => {

          if (response.status) {

            this.permissionData = response.data;
            console.log(
              this.permissionData,
              'permissionData'
            );

          }
        },

        error: (error) => {
          console.log(error);

        }

      });

  }



  onSubmit() {

    this.roleForm.markAllAsTouched();
    if (this.roleForm.invalid) {
      return;
    }
    if (this.selectedPermissions.length == 0) {

      this.snackBar.open(
        'Please select at least one permission',
        '',
        {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customClass']
        }
      );

      return;

    }
    const payload = {

      RoleName: this.roleForm.value.RoleName,
      Description: this.roleForm.value.Description,
      Status: this.roleForm.value.Status,
      permissions: this.selectedPermissions,
      AccessLevel: this.roleForm.value.AccessLevel
    };

    console.log(payload, 'payload');
    this.loading = true;
    this.commonService
      .addData(
        'role/add',
        payload
      )
      .subscribe({

        next: (response: any) => {

          this.snackBar.open(
            response.message,
            '',
            {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
              panelClass: ['customSuccessClass']
            }
          );

          this.loading = false;

          this.router.navigate(
            ['/role']
          );

        },

        error: (error) => {

          this.loading = false;

          console.log(error);

        }

      });

  }

}