import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getValidatorErrorMessage', () => {
    it('should return a message for "required"', () => {
      expect(ValidationService.getValidatorErrorMessage('required', { requiredLength: 8 })).toBe('This field is required');
    });

    it('should return a message for "invalidNumber"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidNumber', { requiredLength: 8 })).toBe('Only number allowed');
    });

    it('should return a message for "invalidMatchPassword"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidMatchPassword', { requiredLength: 8 })).toBe('Password does not matched');
    });

    it('should return a message for "confirmPasswordValidator"', () => {
      expect(ValidationService.getValidatorErrorMessage('confirmPasswordValidator', { requiredLength: 8 })).toBe('Password does not matched');
    });

    it('should return a message for "EitherOrReuired"', () => {
      expect(ValidationService.getValidatorErrorMessage('EitherOrReuired', { requiredLength: 8 })).toBe('Any One Email Required');
    });

    it('should return a message for "invalidCreditCard"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidCreditCard', { requiredLength: 8 })).toBe('Is invalid credit card number');
    });

    it('should return a message for "invalidEmailAddress"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidEmailAddress', { requiredLength: 8 })).toBe('Please enter a valid email address');
    });

    it('should return a message for "invalidPassword"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidPassword', { requiredLength: 8 })).toBe(
        'Password must be at least 6 to 10 characters long, and contain a numbers, uppercase, lowercase, special characters.'
      );
    });

    it('should return a message for "twoDecimalAllowed"', () => {
      expect(ValidationService.getValidatorErrorMessage('twoDecimalAllowed', { requiredLength: 8 })).toBe('Allowed only two decimal.');
    });

    it('should interpolate requiredLength for minlength', () => {
      expect(ValidationService.getValidatorErrorMessage('minlength', { requiredLength: 8 })).toBe('Minimum 8 digit allowed');
    });

    it('should interpolate requiredLength for maxlength', () => {
      expect(ValidationService.getValidatorErrorMessage('maxlength', { requiredLength: 4 })).toBe('Maximum 4 digit allowed');
    });

    it('should return a message for "invalidCharacter"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidCharacter', { requiredLength: 8 })).toBe('Only alphabets and spaces are allowed.');
    });

    it('should return a message for "invalidVideoLink"', () => {
      expect(ValidationService.getValidatorErrorMessage('invalidVideoLink', { requiredLength: 8 })).toBe('Please enter a valid YouTube or Google Drive link.');
    });

    it('should return undefined for an unknown code', () => {
      expect(ValidationService.getValidatorErrorMessage('doesNotExist', { requiredLength: 8 })).toBeUndefined();
    });
  });

  describe('emailValidator', () => {
    it('should return null when control value is empty', () => {
      expect(ValidationService.emailValidator(new FormControl(''))).toBeNull();
      expect(ValidationService.emailValidator(new FormControl(null))).toBeNull();
    });

    it('should accept a valid email address', () => {
      expect(ValidationService.emailValidator(new FormControl('test@example.com'))).toBeNull();
    });

    it('should accept emails with sub-domains', () => {
      expect(ValidationService.emailValidator(new FormControl('a.b@mail.co.uk'))).toBeNull();
    });

    it('should reject an invalid email address', () => {
      const result = ValidationService.emailValidator(new FormControl('not-an-email'));
      expect(result).toEqual({ invalidEmailAddress: true });
    });

    it('should reject emails without a domain', () => {
      expect(ValidationService.emailValidator(new FormControl('test@'))).toEqual({ invalidEmailAddress: true });
    });
  });

  describe('numberOnlyValidator', () => {
    it('should accept empty values', () => {
      expect(ValidationService.numberOnlyValidator(new FormControl(''))).toBeNull();
      expect(ValidationService.numberOnlyValidator(new FormControl(null))).toBeNull();
      expect(ValidationService.numberOnlyValidator(new FormControl(undefined))).toBeNull();
    });

    it('should accept a numeric string', () => {
      expect(ValidationService.numberOnlyValidator(new FormControl('12345'))).toBeNull();
    });

    it('should reject strings with letters', () => {
      expect(ValidationService.numberOnlyValidator(new FormControl('12a34'))).toEqual({ invalidNumber: true });
    });

    it('should reject negative numbers', () => {
      expect(ValidationService.numberOnlyValidator(new FormControl('-12'))).toEqual({ invalidNumber: true });
    });

    it('should reject decimals', () => {
      expect(ValidationService.numberOnlyValidator(new FormControl('12.5'))).toEqual({ invalidNumber: true });
    });
  });

  describe('alphabetSpaceValidator', () => {
    it('should accept empty values', () => {
      expect(ValidationService.alphabetSpaceValidator(new FormControl(''))).toBeNull();
      expect(ValidationService.alphabetSpaceValidator(new FormControl(null))).toBeNull();
    });

    it('should accept alphabetic strings with spaces', () => {
      expect(ValidationService.alphabetSpaceValidator(new FormControl('John Smith'))).toBeNull();
    });

    it('should reject strings containing digits', () => {
      expect(ValidationService.alphabetSpaceValidator(new FormControl('John123'))).toEqual({ invalidCharacter: true });
    });

    it('should reject strings containing special characters', () => {
      expect(ValidationService.alphabetSpaceValidator(new FormControl('John@Smith'))).toEqual({ invalidCharacter: true });
    });
  });

  describe('confirmPasswordValidator', () => {
    it('should mark matching control valid when passwords match', () => {
      const group = new FormGroup({
        password: new FormControl('Secret@123'),
        confirm: new FormControl('Secret@123'),
      });

      const validator = ValidationService.confirmPasswordValidator('password', 'confirm');
      validator(group);

      expect(group.get('confirm')?.errors).toBeNull();
    });

    it('should set an error on the matching control when passwords differ', () => {
      const group = new FormGroup({
        password: new FormControl('Secret@123'),
        confirm: new FormControl('Different@123'),
      });

      const validator = ValidationService.confirmPasswordValidator('password', 'confirm');
      validator(group);

      expect(group.get('confirm')?.errors).toEqual({ confirmPasswordValidator: true });
    });

    it('should not overwrite an unrelated existing error', () => {
      const group = new FormGroup({
        password: new FormControl('Secret@123'),
        confirm: new FormControl('', [Validators.required]),
      });

      const validator = ValidationService.confirmPasswordValidator('password', 'confirm');
      validator(group);

      expect(group.get('confirm')?.errors?.['required']).toBe(true);
    });

    it('should clear the error once passwords match again', () => {
      const group = new FormGroup({
        password: new FormControl('Secret@123'),
        confirm: new FormControl('Diff@123'),
      });

      const validator = ValidationService.confirmPasswordValidator('password', 'confirm');
      validator(group);
      expect(group.get('confirm')?.errors).toEqual({ confirmPasswordValidator: true });

      group.get('confirm')?.setValue('Secret@123');
      validator(group);
      expect(group.get('confirm')?.errors).toBeNull();
    });
  });

  describe('invalidPassword', () => {
    it('should accept empty values', () => {
      expect(ValidationService.invalidPassword(new FormControl(''))).toBeNull();
      expect(ValidationService.invalidPassword(new FormControl(null))).toBeNull();
    });

    it('should accept a valid password', () => {
      expect(ValidationService.invalidPassword(new FormControl('Abcd123@'))).toBeNull();
    });

    it('should reject a password without uppercase', () => {
      expect(ValidationService.invalidPassword(new FormControl('abcd123@'))).toEqual({ invalidPassword: true });
    });

    it('should reject a password without a number', () => {
      expect(ValidationService.invalidPassword(new FormControl('Abcdefgh@'))).toEqual({ invalidPassword: true });
    });

    it('should reject a password without a special character', () => {
      expect(ValidationService.invalidPassword(new FormControl('Abcd1234'))).toEqual({ invalidPassword: true });
    });

    it('should reject a password shorter than 6 characters', () => {
      expect(ValidationService.invalidPassword(new FormControl('A1@b'))).toEqual({ invalidPassword: true });
    });
  });
});