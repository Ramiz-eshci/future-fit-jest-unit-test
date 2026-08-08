import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,FormArray,
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
interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-be-goals',
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
  templateUrl: './add-be-goals.component.html',
  styleUrl: './add-be-goals.component.scss'
})
export class AddBeGoalsComponent {
  @ViewChild('select') select: MatSelect;
  breakEvenGoalForm: any;
  loading:boolean=false;
  title:any='Break Even Goal';
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.breakEvenGoalForm = this.formBuilder.group({
      GoalName: ['', [Validators.required]],
      GoalShortName: ['',[Validators.required]],
      GoalCode: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$') ]],
      FitnessCriteria: [''],
      Notes: [''],
      ProgressIndicators: this.formBuilder.array([this.createProgressIndicator()]),
      ContextIndicators: this.formBuilder.array([this.createContextIndicator()])
    });
    
  }
  createProgressIndicator(): FormGroup {
    return this.formBuilder.group({
      progress_indicator: ['', Validators.required],
      data_completeness: ['']
    });
  }
  createContextIndicator(): FormGroup {
    return this.formBuilder.group({
      context_indicator: ['', Validators.required],
      unit: ['', Validators.required]
    });
  }

   // ProgressIndicators helpers
   get progressIndicators(): FormArray {
    return this.breakEvenGoalForm.get('ProgressIndicators') as FormArray;
  }

  addProgressIndicator(): void {
    this.progressIndicators.push(this.createProgressIndicator());
  }

  removeProgressIndicator(index: number): void {
    if (this.progressIndicators.length > 1) {
      this.progressIndicators.removeAt(index);
    }
  }

  // ContextIndicators helpers
  get contextIndicators(): FormArray {
    return this.breakEvenGoalForm.get('ContextIndicators') as FormArray;
  }

  addContextIndicator(): void {
    this.contextIndicators.push(this.createContextIndicator());
  }

  removeContextIndicator(index: number): void {
    if (this.contextIndicators.length > 1) {
      this.contextIndicators.removeAt(index);
    }
  }

  onSubmit() {
    this.loading = true;
    this.breakEvenGoalForm.controls['GoalName'].markAsTouched()
    this.breakEvenGoalForm.controls['GoalCode'].markAsTouched()
    // console.log(this.breakEvenGoalForm, 'this.breakEvenGoalForm')
    if (this.breakEvenGoalForm.valid) {
      this.commonService.addData('break-even-goals/add/', this.breakEvenGoalForm.value).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/break-even-goals']);
          }, 2000);
        },
        error => {
          console.error('An error occurred:', error);
        }
      );


    }
    this.loading = false;
  }
}
