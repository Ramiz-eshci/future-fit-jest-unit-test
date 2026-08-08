import { Routes } from '@angular/router';

import { Be04CategoryComponent } from './be04-category.component';
import { AddBe04CategoryComponent } from './add-be04-category/add-be04-category.component';
import { EditBe04CategoryComponent } from './edit-be04-category/edit-be04-category.component';

export const Be04CategoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: Be04CategoryComponent,
      },
      {
        path: 'add',
        component: AddBe04CategoryComponent,
      },
      {
        path: 'edit/:id',
        component: EditBe04CategoryComponent,
      },
    ],
  },
];
