import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPermissions', () => {
    it('should return an empty array when nothing is stored', () => {
      expect(service.getPermissions()).toEqual([]);
    });

    it('should parse the stored JSON permissions', () => {
      const perms = [{ id: 1, key: 'VIEW' }];
      localStorage.setItem('permissions', JSON.stringify(perms));

      expect(service.getPermissions()).toEqual(perms);
    });

    it('should propagate a parse error for invalid JSON (behavioural)', () => {
      localStorage.setItem('permissions', 'not-valid-json');
      expect(() => service.getPermissions()).toThrow(SyntaxError);
    });

    it('should return a fresh copy for each call (no shared mutation)', () => {
      const perms = [{ id: 1 }, { id: 2 }];
      localStorage.setItem('permissions', JSON.stringify(perms));

      const first = service.getPermissions();
      const second = service.getPermissions();

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  describe('hasPermission', () => {
    it('should grant access when RoleID is 3', () => {
      localStorage.setItem('RoleID', '3');
      expect(service.hasPermission('anything', 'anything')).toBe(true);
    });

    it('should grant access when RoleID does not exist in storage', () => {
      const result = service.hasPermission('FIT', 'view');
      expect(result).toBe(true);
    });

    it('should grant access for any non-admin role (current behaviour)', () => {
      localStorage.setItem('RoleID', '5');
      expect(service.hasPermission('BRA', 'edit')).toBe(true);
    });
  });
});