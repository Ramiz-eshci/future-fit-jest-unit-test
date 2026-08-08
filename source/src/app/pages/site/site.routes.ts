import { Routes } from '@angular/router';

import { SiteComponent } from './site.component';
import { AddSiteComponent } from './add-site/add-site.component';
import { EditSiteComponent } from './edit-site/edit-site.component';

export const SiteRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SiteComponent,
      },
      {
        path: 'add',
        component: AddSiteComponent,
      },
      {
        path: 'edit/:id',
        component: EditSiteComponent,
      },
    ],
  },
];
