import { Routes } from '@angular/router';

import { PurchaseComponent } from './purchase.component';
import { AddPurchaseComponent } from './add-purchase/add-purchase.component';
import { EditPurchaseComponent } from './edit-purchase/edit-purchase.component';

export const PurchaseRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PurchaseComponent,
      },
      {
        path: 'add',
        component: AddPurchaseComponent,
      },
      {
        path: 'edit/:id',
        component: EditPurchaseComponent,
      },
    ],
  },
];
