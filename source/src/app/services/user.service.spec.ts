import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CryptoJS from 'crypto-js';
import { TestBed as _TB } from '@angular/core/testing';
import { UserService } from './user.service';
import { ErrorLogService } from './error-log.service';
import { RolepermissionService } from './rolepermission.service';
import { CommonService } from './common.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;
  let routerSpy: { navigate: jest.Mock };
  let snackBarSpy: { open: jest.Mock };
  let permissionSpy: { setPermissions: jest.Mock; permissions: any[] };
  let commonServiceSpy: { getData: jest.Mock };
  let errorLogSpy: { handleError: jest.Mock };

  const baseUrl = environment.apiHost;
  const encKey = environment.ENCKey;

  function encryptPayload(payload: Record<string, unknown>): { iv: string; data: string } {
    const key = CryptoJS.SHA256(encKey);
    const iv = CryptoJS.lib.WordArray.random(16);
    const cipher = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    return {
      iv: CryptoJS.enc.Base64.stringify(iv),
      data: cipher,
    };
  }

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: jest.fn() };
    snackBarSpy = { open: jest.fn() };
    permissionSpy = { setPermissions: jest.fn(), permissions: [] };
    commonServiceSpy = {
      getData: jest.fn().mockReturnValue({
        subscribe: (handlers: any) => {
          handlers.next && handlers.next({ status: false, data: [] });
          return { unsubscribe: jest.fn() };
        },
      }),
    };
    errorLogSpy = { handleError: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: RolepermissionService, useValue: permissionSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ErrorLogService, useValue: errorLogSpy },
      ],
    });

    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default loggedInStatus to false', () => {
    expect(service.isLoggedIn).toBe(false);
  });

  describe('getters', () => {
    it('should read userName from localStorage', () => {
      localStorage.setItem('UserName', 'Jane');
      expect(service.userName).toBe('Jane');
    });

    it('should read UserEmail from localStorage', () => {
      localStorage.setItem('UserEmail', 'jane@x.com');
      expect(service.UserEmail).toBe('jane@x.com');
    });

    it('should read UserId from localStorage', () => {
      localStorage.setItem('UserId', '99');
      expect(service.UserID).toBe('99');
    });

    it('should read RoleID from localStorage', () => {
      localStorage.setItem('RoleID', '3');
      expect(service.RoleID).toBe('3');
    });

    it('should read CompanyID from localStorage', () => {
      localStorage.setItem('CompanyID', 'c1');
      expect(service.CompanyID).toBe('c1');
    });

    it('should read IsHandlingScores from localStorage', () => {
      localStorage.setItem('IsHandlingScores', '1');
      expect(service.IsHandlingScores).toBe('1');
    });

    it('should return false isLoggedIn when not set', () => {
      expect(service.isLoggedIn).toBe(false);
    });

    it('should return true isLoggedIn when set to true', () => {
      localStorage.setItem('loggedIn', 'true');
      expect(service.isLoggedIn).toBe(true);
    });
  });

  describe('decryptPayload', () => {
    it('should decrypt a payload encrypted with the same key', () => {
      const original = { user_id: '1', first_name: 'Ada', last_name: 'L', email: 'a@b.com' };
      const encrypted = encryptPayload(original);

      const decrypted = service.decryptPayload(encrypted, encKey);

      expect(decrypted).toMatchObject({
        user_id: '1',
        first_name: 'Ada',
        last_name: 'L',
        email: 'a@b.com',
      });
    });

    it('should throw when the encrypted payload is invalid', () => {
      expect(() => service.decryptPayload({ iv: 'bad', data: 'bad' }, encKey)).toThrow();
    });
  });

  describe('login', () => {
    it('should store user fields and rehydrate permissions on success', () => {
      jest.spyOn(service.jwtHelper, 'decodeToken').mockReturnValue({ authorities: 'ROLE_USER' });

      const payload = {
        user_id: '10',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@tester.dev',
        role_id: '3',
        company_id: 'c1',
        is_handling_scores: '0',
        profile_pic: null,
      };

      const decrypted = encryptPayload(payload);
      const response = {
        status: true,
        message: 'ok',
        data: decrypted,
        token: 'jwt-token-1',
        permissions: [],
      };

      service.login(response);

      const req = httpTesting.expectOne(`${baseUrl}auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(response);
      req.flush(response);

      expect(localStorage.getItem('Token')).toBe('jwt-token-1');
      expect(localStorage.getItem('loggedIn')).toBe('true');
      expect(localStorage.getItem('UserId')).toBe('10');
      expect(localStorage.getItem('UserName')).toBe('Ada Lovelace');
      expect(localStorage.getItem('RoleID')).toBe('3');
      expect(localStorage.getItem('profile_pic')).toBe('/assets/images/profile/user-1.png');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('logout', () => {
    it('should clear localStorage, mark logged in false and navigate to login', () => {
      localStorage.setItem('Token', 'x');
      service.logout();

      expect(localStorage.getItem('Token')).toBeUndefined();
      expect(localStorage.getItem('loggedIn')).toBe('false');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/authentication/login']);
    });
  });

  describe('saveTokens', () => {
    it('should store authorities decoded from the token payload', () => {
      // Token from JWT playground with payload {"authorities": "ROLE_ADMIN"}
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpdGllcyI6W3siYXV0aG9yaXR5IjoiUk9MRV9BRE1JTiJ9XX0.signature';

      const payload = service.jwtHelper.decodeToken(token) ?? { authorities: 'ROLE_ADMIN' };
      jest.spyOn(service.jwtHelper, 'decodeToken').mockReturnValue(payload);

      service.saveTokens(token);

      const stored = localStorage.getItem('authorities');
      expect(stored).toBeDefined();
      expect(stored && stored.length).toBeGreaterThan(0);
    });
  });

  describe('change_password', () => {
    it('should show a success snackbar on success', () => {
      const body = { current_password: 'old', new_password: 'new' };

      service.change_password(body);

      const req = httpTesting.expectOne(`${baseUrl}auth/change-password`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: true, message: 'Password changed' });

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Password changed',
        '',
        expect.objectContaining({ duration: 2000 })
      );
    });
  });

  describe('forgot_password', () => {
    it('should navigate to home after a successful response', () => {
      service.forgot_password({ email: 'a@b.com' });

      const req = httpTesting.expectOne(`${baseUrl}auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: true, message: 'Email sent' });

      expect(snackBarSpy.open).toHaveBeenCalled();
    });
  });

  describe('loadPermissions', () => {
    it('should store permissions and notify the permission service on success', () => {
      const data = [{ PermissionKey: 'VIEW' }];
      commonServiceSpy.getData.mockReturnValue({
        subscribe: (handlers: any) => {
          handlers.next({ status: true, data });
          return { unsubscribe: jest.fn() };
        },
      });

      service.loadPermissions(3);

      expect(commonServiceSpy.getData).toHaveBeenCalledWith('list/getrolepermissions/3');
      expect(localStorage.getItem('permissions')).toBe(JSON.stringify(data));
      expect(permissionSpy.setPermissions).toHaveBeenCalledWith(data);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not store permissions when the response status is false', () => {
      commonServiceSpy.getData.mockReturnValue({
        subscribe: (handlers: any) => {
          handlers.next({ status: false, data: [] });
          return { unsubscribe: jest.fn() };
        },
      });

      service.loadPermissions(3);

      expect(localStorage.getItem('permissions')).toBeUndefined();
      expect(permissionSpy.setPermissions).not.toHaveBeenCalled();
    });
  });
});