import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ErrorLogService } from './error-log.service';

describe('ErrorLogService', () => {
  let service: ErrorLogService;
  let routerSpy: { navigate: jest.Mock };
  let snackBarSpy: { open: jest.Mock };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: jest.fn() };
    snackBarSpy = { open: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ErrorLogService,
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(ErrorLogService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default message timeout config of 3000', () => {
    expect(service.messageConfig).toEqual({ timeOut: 3000 });
  });

  describe('ChangeUpdate / invokeEvent', () => {
    it('should emit the passed value on invokeEvent', (done) => {
      service.invokeEvent.subscribe((value) => {
        expect(value).toBe('Login');
        done();
      });
      service.ChangeUpdate('Login');
    });
  });

  describe('handleError', () => {
    it('should clear storage and navigate to login when a 401 unauthorized HttpErrorResponse is received', async () => {
      localStorage.setItem('Token', 'x');
      localStorage.setItem('loggedIn', 'true');

      const swalSpy = jest.spyOn(Swal, 'fire').mockResolvedValue({
        isConfirmed: true,
        value: true,
      } as never);

      const err = new HttpErrorResponse({
        status: 401,
        error: { error: 'unauthorized', message: 'token expired' },
      });

      service.handleError(err);

      // Let the Swal promise's .then callback complete
      await Promise.resolve();
      await Promise.resolve();

      expect(localStorage.getItem('loggedIn')).toBe('false');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/authentication/login']);
      swalSpy.mockRestore();
    });

    it('should show a snackbar with joined validation messages when error.errors is a non-empty array', () => {
      const err = new HttpErrorResponse({
        status: 400,
        error: {
          errors: [{ message: 'First problem' }, { message: 'Second problem' }],
        },
      });

      service.handleError(err);

      expect(snackBarSpy.open).toHaveBeenCalled();
      const firstArg = snackBarSpy.open.mock.calls[0][0];
      expect(firstArg).toBe('First problem\nSecond problem');
    });

    it('should show a snackbar with the singular error message', () => {
      const err = new HttpErrorResponse({
        status: 400,
        error: { message: 'Single failure' },
      });

      service.handleError(err);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Single failure',
        '',
        expect.objectContaining({ duration: 2000 })
      );
    });

    it('should not throw for non-HTTP Error instances', () => {
      expect(() => service.handleError(new Error('generic failure'))).not.toThrow();
    });

    it('should not throw for undefined input', () => {
      expect(() => service.handleError(undefined)).not.toThrow();
    });
  });

  describe('handleSuccess / handleWarning', () => {
    it('should be callable without throwing', () => {
      expect(() => service.handleSuccess('Saved')).not.toThrow();
      expect(() => service.handleWarning('Careful')).not.toThrow();
    });
  });
});