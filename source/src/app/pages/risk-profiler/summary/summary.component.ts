import { Component, ViewChild } from '@angular/core';

import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder, FormArray,
  AbstractControl
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { catchError, map, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

interface Question {
  id: number;
  text: string;
  risk: 'High' | 'Low';
  activityAnswer: 'Yes' | 'No' | 'NA' | null;
  companyAnswer: 'Yes' | 'No' | 'Not answered' | null;
}
@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
  
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
sections = [
    {
      title: 'Energy',
      items: [
        { code: 'BE01', label: 'Energy Use', activity: 'Moderate', company: 'High' }
      ]
    },
    {
      title: 'Water',
      items: [
        { code: 'BE02', label: 'Water Use', activity: 'High', company: 'Not answered' }
      ]
    },
    {
      title: 'Natural resources',
      items: [
        { code: 'BE03', label: 'Natural Resource Management', activity: 'High', company: 'Not answered' }
      ]
    },
    {
      title: 'Waste',
      items: [
        { code: 'BE07', label: 'Operational Waste', activity: 'High', company: 'Not answered' },
        { code: 'BE19', label: 'Product Repurposing', activity: 'Low', company: 'Not answered' }
      ]
    },
    {
      title: 'Pollution',
      items: [
        { code: 'BE05', label: 'Non-GHG Emissions', activity: 'High', company: 'High' },
        { code: 'BE06', label: 'GHG Emissions', activity: 'Moderate', company: 'High' },
        { code: 'BE17', label: 'Product Characteristics', activity: 'Low', company: 'Not answered' },
        { code: 'BE18', label: 'Product GHG Emissions', activity: 'Unlikely', company: 'Not answered' }
      ]
    },
    {
      title: 'Drivers',
      items: [
        { code: 'BE04', label: 'Procurement', activity: 'Moderate', company: 'Not answered' },
        { code: 'BE20', label: 'Business Ethics', activity: 'Low', company: 'Not answered' },
        { code: 'BE21', label: 'Tax', activity: 'Moderate', company: 'Not answered' },
        { code: 'BE22', label: 'Advocacy and Lobbying', activity: 'High', company: 'Not answered' },
        { code: 'BE23', label: 'Financial Assets', activity: 'Low', company: 'Not answered' }
      ]
    },
    {
      title: 'People',
      items: [
        { code: 'BE09', label: 'Community Engagement', activity: 'High', company: 'Not answered' },
        { code: 'BE10', label: 'Employee Health', activity: 'High', company: 'Not answered' },
        { code: 'BE11', label: 'Living Wage', activity: 'High', company: 'Not answered' },
        { code: 'BE12', label: 'Employment Terms', activity: 'High', company: 'Not answered' },
        { code: 'BE13', label: 'Employee Discrimination', activity: 'High', company: 'Not answered' },
        { code: 'BE14', label: 'Employee Engagement', activity: 'Moderate', company: 'Not answered' },
        { code: 'BE15', label: 'Product Communications', activity: 'Low', company: 'Not answered' },
        { code: 'BE16', label: 'Customer Engagement', activity: 'Low', company: 'Not answered' }
      ]
    },
    {
      title: 'Physical presence',
      items: [
        { code: 'BE08', label: 'Physical Presence', activity: 'High', company: 'Not answered' }
      ]
    }
  ];
  RoleID: any = 1;
  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
   
    this.RoleID = this.userService.RoleID
     if (this.RoleID != 1) {
       this.router.navigate(['/']);
     }
  }
 
}
