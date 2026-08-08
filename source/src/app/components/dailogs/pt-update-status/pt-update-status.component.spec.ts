import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PtUpdateStatusComponent } from './pt-update-status.component';
import { CommonService } from 'src/app/services/common.service';

describe('PtUpdateStatusComponent', () => {
  let component: PtUpdateStatusComponent;
  let fixture: ComponentFixture<PtUpdateStatusComponent>;
  let dialogRefSpy: { close: jest.Mock };
  let commonServiceSpy: { getData: jest.Mock };

  const dialogData = {
    status_id: '5',
    next_reading_date_form: '2024-12-01',
  };

  beforeEach(async () => {
    dialogRefSpy = { close: jest.fn() };
    commonServiceSpy = {
      getData: jest.fn().mockReturnValue(
        of({
          status: true,
          data: [
            { status_id: '4', status_name: 'Active' },
            { status_id: '5', status_name: 'Pending' },
          ],
        })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [PtUpdateStatusComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: CommonService, useValue: commonServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PtUpdateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise selectedStatus from the dialog data', () => {
    expect(component.selectedStatus).toBe(5);
  });

  it('should load status options on construction', () => {
    expect(commonServiceSpy.getData).toHaveBeenCalledWith('status');
    expect(component.status).toHaveLength(2);
  });

  it('should keep status empty when the response status is false', () => {
    commonServiceSpy.getData.mockReturnValue(of({ status: false, data: [] }));
    component = new PtUpdateStatusComponent(
      null as unknown as never,
      dialogRefSpy as never,
      dialogData,
      commonServiceSpy as never
    );
    expect(component.status).toEqual([]);
  });

  describe('form', () => {
    it('should build a form with status_id and next_pt_reading_date controls', () => {
      component.ngOnInit();
      expect(component.form.contains('status_id')).toBe(true);
      expect(component.form.contains('next_pt_reading_date')).toBe(true);
    });

    it('should mark status_id as required', () => {
      component.ngOnInit();
      const control = component.form.get('status_id');
      control?.setValue(null);
      expect(control?.valid).toBe(false);
      expect(control?.errors?.['required']).toBe(true);
    });

    it('should pre-fill next_pt_reading_date from dialog data', () => {
      component.ngOnInit();
      expect(component.form.get('next_pt_reading_date')?.value).toBe('2024-12-01');
    });
  });

  describe('onSubmit', () => {
    it('should close the dialog with the form value when valid', () => {
      component.ngOnInit();
      component.selectedStatus = 7;
      component.form.get('status_id')?.setValue(1);

      component.onSubmit();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(component.form.value);
    });

    it('should sync the form value with selectedStatus before closing', () => {
      component.ngOnInit();
      component.form.get('status_id')?.setValue(2);
      component.selectedStatus = 9;

      component.onSubmit();

      const formValue = component.form.value;
      expect(formValue.status_id).toBe(9);
    });

    it('should not close the dialog when the form is invalid', () => {
      component.ngOnInit();
      component.form.get('status_id')?.setValue(null);
      component.form.updateValueAndValidity();

      component.onSubmit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should close the dialog without a value', () => {
      component.onClose();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });
});