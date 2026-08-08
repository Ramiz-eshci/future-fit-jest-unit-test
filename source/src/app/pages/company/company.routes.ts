import { Routes } from '@angular/router';

import { CompanyComponent } from './company.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { EditCompanyComponent } from './edit-company/edit-company.component';
// import { CompanyDetailsComponent } from '../company-details/company-details.component';

export const CompanyRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CompanyComponent,
      },
      {
        path: 'add',
        component: AddCompanyComponent,
      },
      {
        path: 'edit/:id',
        component: EditCompanyComponent,
      },
      // {
      //   path: 'details/:id',
      //   component: CompanyDetailsComponent,
      // },
      // {
      //   path: 'details',
      //   component: CompanyDetailsComponent,
      // },
    ],
  },
];
