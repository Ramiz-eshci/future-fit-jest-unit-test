import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-edit-role',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],

  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss'
})

export class EditRoleComponent {
  roleForm!: FormGroup;
  loading = false;
  title = 'Role';
  permissionData: any[] = [];
  expandedMenus: any = {};
  expandedChildren: any = {};
  selectedPermissions: any = [];
  originalPermissions: any[] = [];
  routeId: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar

  ) {

    // Form Initialize
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

    });

    this.routeId =
      this.route.snapshot.paramMap.get('id');
    this.getMenuTree();
    this.loadRole();
  }

  getMenuTree() {

    this.commonService
      .getData('role/getMenuTree')
      .subscribe({

        next: (response: any) => {

          if (response.status) {

            this.permissionData =
              response.data;

          }

        },

        error: (error) => {
          console.log(error);
        }

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

  isPermissionSelected(
    menuId: number
  ): boolean {

    return this.selectedPermissions.includes(menuId);

  }
  loadRole() {

    this.commonService
      .getData(
        'role/getById/' +
        this.routeId
      )

      .subscribe({

        next: (response: any) => {

          if (response.status) {

            const data =
              response.data;

            this.selectedPermissions =
              data.permissions || [];
            this.originalPermissions = [...this.selectedPermissions];
            this.roleForm.patchValue({

              RoleName:
                data.role_name,

              Description:
                data.description,

              AccessLevel:
                data.access_level,

              Status:
                data.status,

              permissions:
                data.permissions

            });

          }

        },

        error: (error) => {

          console.log(error);

        }

      });

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

      if (
        !this.selectedPermissions.includes(menuId)
      ) {

        this.selectedPermissions.push(menuId);

      }

    } else {

      this.selectedPermissions =
        this.selectedPermissions.filter(
          (x: any) => x !== menuId
        );

    }

    this.roleForm.patchValue({

      permissions:
        this.selectedPermissions

    });

  }

  onSubmit() {

    this.roleForm.markAllAsTouched();
    if (this.roleForm.invalid) {

      return;

    }
    if (
      this.selectedPermissions.length == 0
    ) {

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
    const permissionsChanged =

      JSON.stringify(
        this.originalPermissions.sort()
      )
      !==
      JSON.stringify(
        this.selectedPermissions.sort()
      );
    if (
      !this.roleForm.dirty &&
      !permissionsChanged
    ) {

      this.snackBar.open(
        'No changes made',
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

      RoleName:
        this.roleForm.value.RoleName,

      Description:
        this.roleForm.value.Description,

      AccessLevel:
        this.roleForm.value.AccessLevel,

      Status:
        this.roleForm.value.Status,

      permissions:
        this.selectedPermissions

    };

    this.loading = true;

    this.commonService
      .addData(

        'role/edit/' +
        this.routeId,

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