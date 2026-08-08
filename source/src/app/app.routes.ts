import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './shared/auth.guard'; // Adjust the import path as necessary
import { ChangePasswordComponent } from './pages/authentication/change-password/change-password.component';
import { ProfileComponent } from './pages/authentication/profile/profile.component';
// import { CalculationPageComponent } from './pages/calculation-page/calculation-page.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
         data: { module: 'dashboard' },
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        data: { module: 'dashboard',roles:['1','2','3'] },
        canActivate: [authGuard],
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'company',
        canActivate: [authGuard],
        data: { module: 'company',roles:['1'] },
        loadChildren: () =>
          import('./pages/company/company.routes').then(
            (m) => m.CompanyRoutes
          ),
      },
      {
        path: 'site',
        canActivate: [authGuard],
        data: { module: 'site',roles:['1'] },
        loadChildren: () =>
          import('./pages/site/site.routes').then(
            (m) => m.SiteRoutes
          ),
      },
       {
        path: 'financial',
        canActivate: [authGuard],
        data: { module: 'financial',roles:['1'] },
        loadChildren: () =>
          import('./pages/financial-asset/financial-asset.routes').then(
            (m) => m.FinancialAssetRoutes
          ),
      },
      {
        path: 'purchase',
        canActivate: [authGuard],
        data: { module: 'purchase',roles:['1'] },
        loadChildren: () =>
          import('./pages/purchase/purchase_information.routes').then(
            (m) => m.PurchaseRoutes
          ),
      },
      {
        path: 'be04Category',
        canActivate: [authGuard],
        data: { module: 'be04Category',roles:['1'] },
        loadChildren: () =>
          import('./pages/be04-category/be04-category.routes').then(
            (m) => m.Be04CategoryRoutes
          ),
      },
       {
        path: 'users',
        canActivate: [authGuard],
        data: { module: 'users',roles:['1','2','3'] },
        loadChildren: () =>
          import('./pages/users/users.routes').then(
            (m) => m.UsersRoutes
          ),
      },
      {
        path: 'employee',
        canActivate: [authGuard],
        data: { module: 'employee',roles:['1'] },
        loadChildren: () =>
          import('./pages/employee/employee.routes').then(
            (m) => m.EmployeeRoutes
          ),
      },
      {
        path: 'break-even-goals',
        canActivate: [authGuard],
        data: { module: 'employee',roles:['1'] },
        loadChildren: () =>
          import('./pages/break-even-goals/break-even-goals.routes').then(
            (m) => m.BreakEvenGoalsRoutes
          ),
      },
      {
        path: 'reference-year',
        canActivate: [authGuard],
        data: { module: 'reference',roles:['1'] },
        loadChildren: () =>
          import('./pages/reference-year/reference-year.routes').then(
            (m) => m.RelevanceRoutes
          ),
      },
      {

        path: 'relevance',
        canActivate: [authGuard],
        data: { module: 'employee',roles:['1'] },
        loadChildren: () =>
          import('./pages/relevance/relevance.routes').then(
            (m) => m.RelevanceRoutes
          ),
      },
      {
        path: 'product',
        canActivate: [authGuard],
        data: { module: 'employee',roles:['1'] },
        loadChildren: () =>
          import('./pages/product/product.routes').then(
            (m) => m.ProductRoutes
          ),
        },
        {
        path: 'be-form',
        canActivate: [authGuard],
        data: { module: 'employee',roles:['1','2'] },
        loadChildren: () =>
          import('./pages/be-form/be-form.routes').then(
            (m) => m.BEFormRoutes

          ),
      },
      {
        path: 'risk-profiler',
        canActivate: [authGuard],
        data: { module: 'risk-profiler',roles:['1','2'] },
        loadChildren: () =>
          import('./pages/risk-profiler/risk-profiler.routes').then(
            (m) => m.RiskProfilerRoutes

          ),
      },
      
      {
        path: 'tutorial-videos',
        canActivate: [authGuard],
        data: { module: 'tutorial-videos',roles:['1','2'] },
        loadChildren: () =>
          import('./pages/tutorial-videos/tutorial-videos.routes').then(
            (m) => m.TutorialVideoRoutes

          ),
      },
      {
        path: 'role',
        canActivate: [authGuard],
        data: { module: 'role',roles:['1','2'] },
        loadChildren: () =>
          import('./pages/role/role.routes').then(
            (m) => m.RoleRoutes

          ),
      },
      
      
      
     
    
      // {
      //   path: 'detailed-bra',
      //   loadChildren: () =>
      //     import('./pages/detail-bra/bra.routes').then(
      //       (m) => m.BRARoutes
      //     ),
      // },
      
      {
        path: 'change-password',
        data: { module: 'change-password',roles:['1','2','3'] },
        canActivate: [authGuard],
        component: ChangePasswordComponent,
      },
      {
        path: 'update-profile',
        data: { module: 'update-profile',roles:['1','2','3'] },
        canActivate: [authGuard],
        component: ProfileComponent,
      },
      // {
      //   path: 'users',
      //   data: { module: 'users',roles:['1','2'] },
      //   canActivate: [authGuard],
      //   loadChildren: () =>
      //     import('./pages/users/users.routes').then(
      //       (m) => m.UsersRoutes
      //     ),
      // },
      
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
      
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
