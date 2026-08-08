import { Routes } from '@angular/router';

import { BreakEvenGoalsComponent } from './break-even-goals.component';
import { AddBeGoalsComponent } from './add-be-goals/add-be-goals.component';
import { EditBeGoalsComponent } from './edit-be-goals/edit-be-goals.component';

export const BreakEvenGoalsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BreakEvenGoalsComponent,
      },
      {
        path: 'add',
        component: AddBeGoalsComponent,
      },
      {
        path: 'edit/:id',
        component: EditBeGoalsComponent,
      },
    ],
  },
];
