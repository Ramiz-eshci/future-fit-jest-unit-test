import { Routes } from '@angular/router';
import { RoleComponent } from './role.component';
import { AddRoleComponent } from './add-role/add-role.component';
import { EditRoleComponent } from './edit-role/edit-role.component';


export const RoleRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RoleComponent,
      },
      {
        path: 'add',
        component: AddRoleComponent,
      },
      {
        path: 'edit/:id',
        component: EditRoleComponent,
      },
    ],
  },
];
