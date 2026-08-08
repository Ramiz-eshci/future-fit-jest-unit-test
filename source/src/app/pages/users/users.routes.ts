import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { EditUsersComponent } from './edit-users/edit-users.component';


export const UsersRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: UsersComponent,
            },
            {
                path: 'add',
                component: AddUsersComponent,
            },
             {
                 path: 'edit/:id',
                component: EditUsersComponent,
            },

        ],
    },
];
