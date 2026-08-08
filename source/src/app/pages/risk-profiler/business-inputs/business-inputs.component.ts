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
  
  templateUrl: './business-inputs.component.html',
  styleUrl: './business-inputs.component.scss'
})
export class BusinessInputsComponent {

  selectedVideo: any = null;
 questions: Question[] = [
    {
      id: 1,
      text: 'Our business uses fossil fuels as a primary source of energy',
      risk: 'High',
      activityAnswer: null,
      companyAnswer: null
    },
    {
      id: 2,
      text: 'Our business’s core activities are water-intensive',
      risk: 'High',
      activityAnswer: null,
      companyAnswer: null
    },
    {
      id: 3,
      text: 'Our business uses water as a core product input',
      risk: 'High',
      activityAnswer: null,
      companyAnswer: null
    },
    {
      id: 4,
      text: 'Our business uses water for personal consumption and sanitation only',
      risk: 'Low',
      activityAnswer: null,
      companyAnswer: null
    }
  ];

  selectActivity(q: Question, value: 'Yes' | 'No' | 'NA') {
    q.activityAnswer = value;
  }

  selectCompany(q: Question, value: 'Yes' | 'No' | 'Not answered') {
    q.companyAnswer = value;
  }
  RoleID: any = 1;
  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    
  ) {
    this.RoleID = this.userService.RoleID
     if (this.RoleID != 1) {
       this.router.navigate(['/']);
     }
   
  }
 
}
