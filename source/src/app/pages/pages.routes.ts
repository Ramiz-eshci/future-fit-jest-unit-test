import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { authGuard } from '../shared/auth.guard';
import { NewStarterComponent } from './starter/new-starter.component';
// import { DoctorComponent } from './doctor/doctor.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter' },
      ],
    },
  }
];
