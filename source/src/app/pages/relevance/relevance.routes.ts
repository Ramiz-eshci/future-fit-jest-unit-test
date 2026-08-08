import { Routes } from '@angular/router';

import { RelevanceComponent } from './relevance.component';
import { AddRelevanceComponent } from './add-relevance/add-relevance.component';
import { EditRelevanceComponent } from './edit-relevance/edit-relevance.component';

export const RelevanceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RelevanceComponent,
      },
      {
        path: 'add',
        component: AddRelevanceComponent,
      },
      {
        path: 'edit/:id',
        component: EditRelevanceComponent,
      },
    ],
  },
];
