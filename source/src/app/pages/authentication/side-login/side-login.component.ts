import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './side-login.component.html',
  styleUrl: './side-login.component.scss'
})
export class AppSideLoginComponent {
  loginForm: any;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,) {
    this.loginForm = this.formBuilder.group({
      Email: ['', [Validators.required, ValidationService.emailValidator]],
      Password: ['', Validators.required],
    });
  }

  onSubmit() {
    // console.log(this.form.value);
    // this.router.navigate(['/']);
    this.loginForm.controls['Email'].markAsTouched()
    this.loginForm.controls['Password'].markAsTouched()
    let isValidLogin = true;
    if (this.loginForm.valid) {
      // if(this.loginForm.controls['Email'].value != 'admin@riskassessment.com'){
      //   localStorage.setItem('loggedIn', 'false');
      //   Swal.fire({
      //     title: 'unauthorized',
      //     text: 'Invalid Email',
      //     icon: 'warning',
      //     showCancelButton: false,
      //     confirmButtonText: 'Ok',
      //     cancelButtonText: 'No, let me think',
      //   }).then((result) => {
      //     if (result.value) {
      //       console.log('The dialog was closed');
      //     } else if (result.dismiss === Swal.DismissReason.cancel) {
      //       Swal.fire('Cancelled', 'Product still in our database.)', 'error');
      //     }
      //   });
      //   isValidLogin = false;
      // }
      // if(this.loginForm.controls['Password'].value != 'Risk@12345'){
      //   localStorage.setItem('loggedIn', 'false');
      //   Swal.fire({
      //     title: 'unauthorized',
      //     text: 'Password Incorrect',
      //     icon: 'warning',
      //     showCancelButton: false,
      //     confirmButtonText: 'Ok',
      //     cancelButtonText: 'No, let me think',
      //   }).then((result) => {
      //     if (result.value) {
      //       console.log('The dialog was closed');
      //     } else if (result.dismiss === Swal.DismissReason.cancel) {
      //       Swal.fire('Cancelled', 'Product still in our database.)', 'error');
      //     }
      //   });
      //   isValidLogin = false;
      // }

      // if(isValidLogin){
      //   localStorage.setItem('loggedIn', 'true');
      //   localStorage.setItem('UserId','1')
      //   localStorage.setItem('UserName','Risk Admin')
      //   localStorage.setItem('Email','admin@riskassessment.com')
      //   this.router.navigate(['/']);
      // }
      const formData = new FormData();
      formData.append('Email', this.loginForm.controls['Email'].value);
      formData.append('Password', this.loginForm.controls['Password'].value);
      this.userService.login(formData)
    }
  }
}
