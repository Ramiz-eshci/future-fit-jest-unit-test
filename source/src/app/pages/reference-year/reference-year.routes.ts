import { Routes } from '@angular/router';

import { ReferenceYearComponent } from './reference-year.component';

export const RelevanceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ReferenceYearComponent,
      },
      {
        path: 'add',
        component: ReferenceYearComponent,
      },
      {
        path: 'edit',
        component: ReferenceYearComponent,
      },
    ],
  },
];
