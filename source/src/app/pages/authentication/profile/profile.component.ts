import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    DatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  profileForm: any;
  title: any = 'Update Your Profile';
  loading: boolean = false;
  selectedFile: any = '';
  errorMessage: any = '';
  profileImageChanged: boolean = false;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {

    this.profileForm = this.formBuilder.group({
      // user_id: [localStorage.getItem('UserId'), [Validators.required]],
      // firstName: ['', Validators.required],
      // lastName: ['', Validators.required],
      firstName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
      lastName: ['', [Validators.required, ValidationService.alphabetSpaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(12)]],
      Logo: ['']
    });

    let requestData = {
      "Id": localStorage.getItem('UserId')
    }

    this.commonService.getData('auth/profile').subscribe((response) => {
      console.log('response p =>', response.data[0].first_name);
      if (response.status === true) {
        this.profileForm = this.formBuilder.group({
          // user_id: [localStorage.getItem('UserId'), [Validators.required]],
          firstName: [response.data[0].first_name, [Validators.required, ValidationService.alphabetSpaceValidator]],
          lastName: [response.data[0].last_name, [Validators.required, ValidationService.alphabetSpaceValidator]],
          // email: [response.data[0].email, [Validators.required, Validators.email]],
          email: [response.data[0].email, [Validators.required, Validators.email]],
          phoneNumber: [response.data[0].phone_number, [Validators.required, Validators.pattern('^[0-9]*$')]],
          Logo: [response.data[0].logo]
        });
        console.log('this.profileForm =>', this.profileForm);
      }

    });
  }

  // get formControls() {
  //   return this.profileForm.controls;
  // }

  onSubmit() {
    this.loading = true;
    this.profileForm.controls['firstName'].markAsTouched()
    this.profileForm.controls['lastName'].markAsTouched()
    this.profileForm.controls['email'].markAsTouched()
    this.profileForm.controls['phoneNumber'].markAsTouched()
    if (this.profileForm.valid) {
      if (!this.profileForm.dirty && !this.profileImageChanged) {
        this._snackBar.open('No changes were made.', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        }, 2000);
        this.loading = false;
        return;
      }  
       const formData = new FormData();
    formData.append('firstName', this.profileForm.get('firstName')?.value);
    formData.append('lastName', this.profileForm.get('lastName')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value);

    if (this.selectedFile) {
      formData.append('Logo', this.selectedFile);  
    }
       
        this.commonService.addData('auth/update-profile',formData).subscribe((response: any) => {
          this.loading = false;
          if (response.status === true) {
             localStorage.setItem('profile_pic', response.data[0].profile_pic)
            this._snackBar.open(response.message, '', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/dashboard']);
          } else {
            this._snackBar.open(response.message, '', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }

        }, error => {
          this.loading = false;
        });

      
    }
  }
  onFileSelected(event: any) {
   
    const file: File = event.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'png' && fileType !== 'jpg' && fileType !== 'jpeg' && fileType !== 'gif') {
        this.errorMessage = 'Only image files (.png, .jpg, .jpeg, .gif) are allowed!';
        this.selectedFile = null;
        return;
      }
      this.profileImageChanged = true;
      this.selectedFile = file;
      this.errorMessage = ''; // Clear error
      // this.excelForm.patchValue({ excel: file });
      this.profileForm.controls['Logo'].setValue(file)
      
   
       
      
    }
  }
}
