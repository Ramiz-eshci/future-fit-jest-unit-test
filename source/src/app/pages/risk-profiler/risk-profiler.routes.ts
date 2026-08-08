import { Routes } from '@angular/router';

import { RiskProfilerComponent } from './risk-profiler.component';
import { VideoLibraryComponent } from './video-library/video-library.component';
import { BusinessInputsComponent } from './business-inputs/business-inputs.component';
import { SummaryComponent } from './summary/summary.component';
// import { CompanyDetailsComponent } from '../company-details/company-details.component';

export const RiskProfilerRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RiskProfilerComponent,
      },
      
      {
        path: 'type/:type',
        component: RiskProfilerComponent,
      },
       {
        path: 'help',
        component: VideoLibraryComponent,
      },
       {
        path: 'business-inputs',
        component: BusinessInputsComponent,
      },
       {
        path: 'summary',
        component: SummaryComponent,
      },
    
    ],
  },
];
