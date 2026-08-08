import { Component } from '@angular/core';

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
@Component({
  selector: 'app-edit-be04-category',
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
  templateUrl: './edit-be04-category.component.html',
  styleUrl: './edit-be04-category.component.scss'
})
export class EditBe04CategoryComponent {
  categoryForm: any;
  loading: boolean = false;
  routeId: any;
  title: string = 'Category';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private _snackBar: MatSnackBar
  ) {
    this.routeId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.initForm();
    this.getCategoryById();
  }


  initForm() {
    this.categoryForm = this.fb.group({
      category_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]]
    });
  }


  getCategoryById() {
    this.commonService.getData(`be04-category/getById/${this.routeId}`).subscribe((res: any) => {
      if (res.status) {

        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        this.categoryForm.patchValue({
          category_name: data.category_name
        });
      }
    });
  }
  onSubmit() {
    this.loading = true;
    this.categoryForm.controls['category_name'].markAsTouched();

    if (this.categoryForm.valid) {
      if (!this.categoryForm.dirty) {

        this._snackBar.open('No changes made.', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/be04Category']);
        }, 2000);
        this.loading = false;
        return;
      }

      this.commonService.addData(`be04-category/edit/${this.routeId}`, this.categoryForm.value).subscribe(
        (res: any) => {
          this._snackBar.open(res.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });

          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/be04Category']);
          }, 2000);
        },
        (error) => {
          console.error('Error updating category:', error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }



  // onSubmit() {
  //   this.loading = true;
  //   this.categoryForm.controls['category_name'].markAsTouched();

  //   if (this.categoryForm.valid) {
  //     this.commonService.addData(`be04-category/edit/${this.routeId}`, this.categoryForm.value).subscribe(
  //       (res: any) => {
  //         this._snackBar.open(res.message, '', {
  //           duration: 2000,
  //           verticalPosition: 'top',
  //           horizontalPosition: 'end',
  //           panelClass: ['customSuccessClass']
  //         });

  //         setTimeout(() => {
  //           this.loading = false;
  //           this.router.navigate(['/be04Category']);
  //         }, 2000);
  //       },
  //       (error) => {
  //         console.error('Error updating category:', error);
  //         this.loading = false;
  //       }
  //     );
  //   } else {
  //     this.loading = false;
  //   }
  // }
}