import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  static getValidatorErrorMessage(code: string, validatorValue?: any) {
    let config: any = {
      'required': `This field is required`,
      'invalidNumber': 'Only number allowed',
      'invalidMatchPassword': 'Password does not matched',
      'confirmPasswordValidator': 'Password does not matched',
      'EitherOrReuired': 'Any One Email Required',
      'invalidCreditCard': 'Is invalid credit card number',
      // 'invalidEmailAddress': 'Invalid email address',
      'invalidEmailAddress': 'Please enter a valid email address',
      'invalidPassword': 'Password must be at least 6 to 10 characters long, and contain a numbers, uppercase, lowercase, special characters.',
      'twoDecimalAllowed': 'Allowed only two decimal.',
      'minlength': `Minimum ${validatorValue.requiredLength} digit allowed`,
      'maxlength': `Maximum ${validatorValue.requiredLength} digit allowed`,
      'invalidCharacter': `Only alphabets and spaces are allowed.`,
      'invalidVideoLink': `Please enter a valid YouTube or Google Drive link.`,

    };
    return config[code];
  }
  static emailValidator(control: AbstractControl) {
    // RFC 2822 compliant regex
    if (control.value) {
      if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
        return null;
      } else {
        return { 'invalidEmailAddress': true };
      }
    } else {
      return null;
    }
  }
  static numberOnlyValidator(control: AbstractControl) {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null; // empty is valid (use required validator if needed)
  }

  const regex = /^[0-9]+$/;

  return regex.test(control.value)
    ? null
    : { invalidNumber: true };
}
  static alphabetSpaceValidator(control: AbstractControl) {
    const regex = /^[A-Za-z\s]+$/;
    if (control.value && !regex.test(control.value)) {
      return { invalidCharacter: true };
    }
    return null;
  }
  static confirmPasswordValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['confirmPasswordValidator']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmPasswordValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  static invalidPassword(control: AbstractControl) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&"£^()])[A-Za-z\d@$!%*?&"£^()]{6,12}$/;
    
    if (control.value && !passwordRegex.test(control.value)) {
      return { 'invalidPassword': true };
    }
    return null;
  }
}
