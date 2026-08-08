import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'validation-messages',
  template: `<span *ngIf="errorMessage" class="text-danger">{{errorMessage}}</span>`
})
export class ValidationComponent {
  @Input() control: FormControl;
  constructor() { }

  get errorMessage() {
    for (let propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }

    return false;
  }
}
