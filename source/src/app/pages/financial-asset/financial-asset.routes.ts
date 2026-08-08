import { Routes } from '@angular/router';

import { FinancialAssetComponent } from './financial-asset.component';
import { AddFinancialAssetComponent } from './add-financial-asset/add-financial-asset.component';
import { EditFinancialAssetComponent } from './edit-financial-asset/edit-financial-asset.component';

export const FinancialAssetRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: FinancialAssetComponent,
      },
      {
        path: 'add',
        component: AddFinancialAssetComponent,
      },
      {
        path: 'edit/:id',
        component: EditFinancialAssetComponent,
      },
    ],
  },
];
