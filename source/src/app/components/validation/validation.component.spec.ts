import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { ValidationComponent } from './validation.component';

describe('ValidationComponent', () => {
  let component: ValidationComponent;
  let fixture: ComponentFixture<ValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ValidationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('', [Validators.required]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('errorMessage getter', () => {
    it('should return false when the control has no errors', () => {
      component.control = new FormControl('valid value');
      fixture.detectChanges();

      expect(component.errorMessage).toBe(false);
    });

    it('should return false when the control has errors but is not touched', () => {
      component.control = new FormControl('', [Validators.required]);
      fixture.detectChanges();

      expect(component.errorMessage).toBe(false);
    });

    it('should return the validation message for a required error on a touched control', () => {
      component.control = new FormControl('', [Validators.required]);
      component.control.markAsTouched();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('This field is required');
    });

    it('should return the message for the first error on a touched control', () => {
      component.control = new FormControl('', [Validators.required, Validators.minLength(8)]);
      component.control.markAsTouched();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('This field is required');
    });

    it('should render the error message inside the <span>', () => {
      component.control = new FormControl('', [Validators.required]);
      component.control.markAsTouched();
      fixture.detectChanges();

      const span = fixture.nativeElement.querySelector('.text-danger');
      expect(span).toBeTruthy();
      expect(span.textContent).toBe('This field is required');
    });

    it('should not render the <span> when there is no error message', () => {
      component.control = new FormControl('valid');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.text-danger')).toBeNull();
    });
  });
});