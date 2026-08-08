import { Routes } from '@angular/router';

import { ProductComponent } from './product.component';
import { AddProductComponent } from './add-product/add-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';

export const ProductRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProductComponent,
      },
      {
        path: 'add',
        component: AddProductComponent,
      },
      {
        path: 'edit/:id',
        component: EditProductComponent,
      },
    ],
  },
];
