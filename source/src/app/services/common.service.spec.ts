import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { CommonService } from './common.service';
import { ErrorLogService } from './error-log.service';
import { environment } from '../../environments/environment';
import { DataTable } from '../models/datatable';

describe('CommonService', () => {
  let service: CommonService;
  let httpTesting: HttpTestingController;
  let errorLogSpy: jest.Mocked<ErrorLogService>;
  let routerSpy: { navigate: jest.Mock };
  let snackBarSpy: { open: jest.Mock };

  const baseUrl = environment.apiHost;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: jest.fn() };
    snackBarSpy = { open: jest.fn() };
    errorLogSpy = { handleError: jest.fn() } as unknown as jest.Mocked<ErrorLogService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CommonService,
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ErrorLogService, useValue: errorLogSpy },
      ],
    });

    service = TestBed.inject(CommonService);
  });

  afterEach(() => {
    const http = TestBed.inject(HttpTestingController);
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeader', () => {
    it('should add no Authorization header when no token is stored', () => {
      const headers = service.getHeader();
      expect(headers.has('Authorization')).toBe(false);
    });

    it('should add a Bearer Authorization header when a token is stored', () => {
      localStorage.setItem('Token', 'abc123');
      const headers = service.getHeader();
      expect(headers.get('Authorization')).toBe('Bearer abc123');
    });

    it('should add Content-Type when isJson is true and logged in', () => {
      localStorage.setItem('Token', 'abc123');
      const headers = service.getHeader(true);
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should NOT add Content-Type when isJson is true but not logged in', () => {
      const headers = service.getHeader(true);
      expect(headers.get('Content-Type')).toBeNull();
    });

    it('should add Accept-Language when isLng is true and logged in', () => {
      localStorage.setItem('Token', 'abc123');
      const headers = service.getHeader(false, true);
      expect(headers.get('Accept-Language')).toBe('en-US,en;q=0.9,en-GB;q=0.8');
    });

    it('should add Content-Type when isContent is true and logged in', () => {
      localStorage.setItem('Token', 'abc123');
      const headers = service.getHeader(false, false, true);
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('getDatatable', () => {
    const fakeTable: DataTable = {
      data: [{ id: 1 }],
      page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
    };

    it('should GET with page and per_page query params and return data', () => {
      const http = TestBed.inject(HttpTestingController);

      service.getDatatable('users', 1, 10).subscribe((result) => {
        expect(result).toEqual(fakeTable);
      });

      const req = http.expectOne(`${baseUrl}users?page=1&per_page=10`);
      expect(req.request.method).toBe('GET');
      req.flush(fakeTable);
    });

    it('should return null and forward errors to handleError when request fails', () => {
      const http = TestBed.inject(HttpTestingController);

      let result: DataTable | null | undefined;
      service.getDatatable('users', 1, 10).subscribe((r) => (result = r));

      const req = http.expectOne(`${baseUrl}users?page=1&per_page=10`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
      expect(errorLogSpy.handleError).toHaveBeenCalled();
    });
  });

  describe('getDatatableFilter', () => {
    it('should append the filter query param', () => {
      const http = TestBed.inject(HttpTestingController);

      service.getDatatableFilter('users', 2, 20, 'john').subscribe((result) => {
        expect(result).toBeNull(); // flush comes below; subscription already resolved
      });

      const req = http.expectOne(`${baseUrl}users?page=2&per_page=20&filter=john`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], page: 2, per_page: 20, total: 0, total_pages: 0 });
    });

    it('should return null on error', () => {
      const http = TestBed.inject(HttpTestingController);

      let emitted: DataTable | null | undefined;
      service.getDatatableFilter('users', 1, 10, 'a').subscribe((r) => (emitted = r));

      http.expectOne(`${baseUrl}users?page=1&per_page=10&filter=a`).flush('oops', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      expect(emitted).toBeNull();
    });
  });

  describe('getDatatableFilterCompanyDetails', () => {
    it('should append filter and company_id query params', () => {
      const http = TestBed.inject(HttpTestingController);

      service.getDatatableFilterCompanyDetails('users', 1, 10, 'smith', 'c42').subscribe();

      const req = http.expectOne(`${baseUrl}users?page=1&per_page=10&filter=smith&company_id=c42`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], page: 1, per_page: 10, total: 0, total_pages: 0 });
    });
  });

  describe('addData', () => {
    it('should POST data to the created URL with Authorization header', () => {
      const http = TestBed.inject(HttpTestingController);
      localStorage.setItem('Token', 'tok');

      const payload = { name: 'Widget' };
      service.addData('products', payload).subscribe((resp) => {
        expect(resp.status).toBe(true);
      });

      const req = http.expectOne(`${baseUrl}products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
      req.flush({ status: true, message: 'created' });
    });

    it('should re-throw errors after handling them', () => {
      const http = TestBed.inject(HttpTestingController);
      const onError = jest.fn();

      service.addData('products', {}).subscribe({
        error: (err) => onError(err),
      });

      http.expectOne(`${baseUrl}products`).flush(
        { errors: { name: 'invalid' } },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('handleErrorNew (400 unauthorized)', () => {
    it('should clear localStorage and set loggedIn=false on unauthorized', () => {
      localStorage.setItem('Token', 'x');
      localStorage.setItem('loggedIn', 'true');

      const error = {
        status: 400,
        error: { error: 'unauthorized', error_description: 'Session expired' },
      };

      const swalSpy = jest.spyOn(Swal, 'fire').mockResolvedValue({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value: true,
        dismiss: undefined,
      } as never);

      service.handleErrorNew(error);

      expect(localStorage.getItem('loggedIn')).toBe('false');
      expect(swalSpy).toHaveBeenCalled();

      // Resolve the Swal promise and allow the .then callback to run
      return Promise.resolve().then(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/authentication/login']);
        swalSpy.mockRestore();
      });
    });

    it('should show a snackBar with formatted site validation errors', () => {
      const error = {
        status: 422,
        error: {
          errors: {
            'sites.0.amount_of_renewable_energy_used': { message: 'too long' },
          },
        },
      };

      service.handleErrorNew(error);

      expect(snackBarSpy.open).toHaveBeenCalled();
      const firstArg = snackBarSpy.open.mock.calls[0][0];
      expect(firstArg).toContain('Site 1');
    });

    it('should delegate to errorLogService for other errors', () => {
      const error = { status: 500, error: { message: 'boom' } };
      service.handleError(error);

      expect(errorLogSpy.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('getData', () => {
    it('should perform a GET request', () => {
      const http = TestBed.inject(HttpTestingController);

      service.getData('users').subscribe((resp) => {
        expect(resp.status).toBe(true);
      });

      const req = http.expectOne(`${baseUrl}users`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: true, data: [] });
    });
  });

  describe('postData', () => {
    it('should POST a body', () => {
      const http = TestBed.inject(HttpTestingController);

      service.postData('search', { q: 'x' }).subscribe((resp) => {
        expect(resp.status).toBe(true);
      });

      const req = http.expectOne(`${baseUrl}search`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ q: 'x' });
      req.flush({ status: true });
    });
  });

  describe('getDropdownData', () => {
    it('should GET and return typed data', () => {
      const http = TestBed.inject(HttpTestingController);

      service.getDropdownData<string[]>('roles').subscribe((resp) => {
        expect(resp).toEqual(['admin', 'user']);
      });

      const req = http.expectOne(`${baseUrl}roles`);
      expect(req.request.method).toBe('GET');
      req.flush(['admin', 'user']);
    });
  });

  describe('deleteData', () => {
    it('should perform a DELETE request', () => {
      const http = TestBed.inject(HttpTestingController);

      service.deleteData('products/1').subscribe((resp) => {
        expect(resp).toEqual({ deleted: true });
      });

      const req = http.expectOne(`${baseUrl}products/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ deleted: true });
    });
  });
});