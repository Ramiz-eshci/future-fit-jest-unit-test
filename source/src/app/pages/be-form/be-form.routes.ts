import { Routes } from '@angular/router';

import { BeFormComponent } from './be-form.component';
import { AddBeFormComponent } from './add-be-form/add-be-form.component';
import { AddBeNewComponent } from './add-be-new/add-be-new.component';
import { CanDeactivateGuard } from 'src/app/shared/can-deactivate.guard';
import { GlobalUnsavedGuard } from 'src/app/shared/global-unsaved.gaurd';

export const BEFormRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BeFormComponent,
      },
      {
        path: 'add',
        component: AddBeNewComponent,
        canDeactivate: [GlobalUnsavedGuard],
      },
        {
        path: 'add/:begoal',
        component: AddBeNewComponent,
        canDeactivate: [GlobalUnsavedGuard],
      },
      {
        path: 'edit/:editFitId',
        component: AddBeNewComponent,
        canDeactivate: [GlobalUnsavedGuard],
      }
    ],
  },
];
