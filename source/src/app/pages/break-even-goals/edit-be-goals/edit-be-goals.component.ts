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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-edit-be-goals',
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
  templateUrl: './edit-be-goals.component.html',
  styleUrl: './edit-be-goals.component.scss'
})
export class EditBeGoalsComponent {
  @ViewChild('select') select: MatSelect;
  breakEvenGoalForm: any;
  loading: boolean = false;
  title: any = 'Break Even Goal';
  routeId: string | null = null;
  RoleID: any = 1;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.RoleID = this.userService.RoleID
    this.routeId = this.route.snapshot.paramMap.get('id');
    this.breakEvenGoalForm = this.formBuilder.group({
      GoalName: ['', [Validators.required]],
      GoalShortName: ['', [Validators.required]],
      GoalCode: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      FitnessCriteria: [''],
      Notes: [''],
      ProgressIndicators: this.formBuilder.array([this.createProgressIndicator({})]),
      ContextIndicators: this.formBuilder.array([this.createContextIndicator({})])
    });

    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    // console.log(this.routeId, 'routerId');
    this.commonService.getData('break-even-goals/getById/' + this.routeId).subscribe((response) => {
      // console.log('response p =>', response.status);
      if (response.status === true) {
        this.breakEvenGoalForm.controls['GoalName'].setValue(response.data[0].goal_name)
        this.breakEvenGoalForm.controls['GoalShortName'].setValue(response.data[0].goal_short_name)
        this.breakEvenGoalForm.controls['GoalCode'].setValue(response.data[0].goal_code)
        this.breakEvenGoalForm.controls['FitnessCriteria'].setValue(response.data[0].fitness_criteria)
        this.breakEvenGoalForm.controls['Notes'].setValue(response.data[0].notes)
        var ProgressIndicators = response.data[0].ProgressIndicators
        if (ProgressIndicators.length > 0) {
          const progressArray = this.breakEvenGoalForm.get('ProgressIndicators') as FormArray;
          progressArray.clear(); // optional: clears default/old entries
          for (let element of ProgressIndicators) {
            progressArray.push(this.createProgressIndicator(element));
          }
        }
        var ContextIndicators = response.data[0].ContextIndicators
        if (ContextIndicators.length > 0) {
          const contextArray = this.breakEvenGoalForm.get('ContextIndicators') as FormArray;
          contextArray.clear(); // optional: clears default/old entries
          for (let element of ContextIndicators) {
            contextArray.push(this.createContextIndicator(element));
          }
        }
      }
    }, (error) => {
      this._snackBar.open('Employee Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/break-even-goals']);
      }, 2000);
    });

  }
  createProgressIndicator(value: any): FormGroup {
    console.log(value, '---- 109 ---- Value')
    return this.formBuilder.group({
      progress_indicator_id: [value.progress_indicator_id || ''],
      progress_indicator: [value.progress_indicator || '', Validators.required],
      data_completeness: [value.data_completeness || '']
    });
  }
  createContextIndicator(value: any): FormGroup {
    return this.formBuilder.group({
      context_indicator_id: [value.context_indicator_id || ''],
      context_indicator: [value.context_indicator || '', Validators.required],
      unit: [value.unit || '', Validators.required]
    });
  }

  // ProgressIndicators helpers
  get progressIndicators(): FormArray {
    return this.breakEvenGoalForm.get('ProgressIndicators') as FormArray;
  }

  addProgressIndicator(): void {
    this.progressIndicators.push(this.createProgressIndicator({}));
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
    this.contextIndicators.push(this.createContextIndicator({}));
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
    console.log(this.breakEvenGoalForm, 'this.breakEvenGoalForm')
    if (this.breakEvenGoalForm.valid) {
      this.commonService.addData('break-even-goals/edit/' + this.routeId, this.breakEvenGoalForm.value).subscribe(
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
