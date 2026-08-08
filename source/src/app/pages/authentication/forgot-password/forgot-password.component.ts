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

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: any;
  submittedData: any[] = []; // To store submitted rows
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,) {
    this.forgotPasswordForm = this.formBuilder.group({
      Email: ['', [Validators.required, ValidationService.emailValidator]],
    });
  }

  onSubmit() {
    this.forgotPasswordForm.controls['Email'].markAsTouched()
    if (this.forgotPasswordForm.valid) {
      this.userService.forgot_password(this.forgotPasswordForm.value)
    }
  }
}
