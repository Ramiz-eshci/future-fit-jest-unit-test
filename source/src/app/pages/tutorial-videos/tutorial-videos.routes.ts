import { Routes } from '@angular/router';
import { TutorialVideosComponent } from './tutorial-videos.component';
import { AddTutorialVideosComponent } from './add-tutorial-videos/add-tutorial-videos.component';
import { EditTutorialVideosComponent } from './edit-tutorial-videos/edit-tutorial-videos.component';


export const TutorialVideoRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: TutorialVideosComponent,
            },
            {
                path: 'add',
                component: AddTutorialVideosComponent,
            },
             {
                 path: 'edit/:id',
                component: EditTutorialVideosComponent,
            },

        ],
    },
];
