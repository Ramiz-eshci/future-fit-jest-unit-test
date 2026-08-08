import { Routes } from '@angular/router';

import { EmployeeComponent } from './employee.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';

export const EmployeeRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EmployeeComponent,
      },
      {
        path: 'add',
        component: AddEmployeeComponent,
      },
      {
        path: 'edit/:id',
        component: EditEmployeeComponent,
      },
    ],
  },
];
