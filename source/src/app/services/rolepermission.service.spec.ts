import { TestBed } from '@angular/core/testing';
import { RolepermissionService } from './rolepermission.service';

describe('RolepermissionService', () => {
  let service: RolepermissionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolepermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor / initial permissions', () => {
    it('should initialise permissions to [] when nothing stored', () => {
      expect(service.permissions).toEqual([]);
    });

    it('should initialise with the "undefined" string as empty', () => {
      localStorage.setItem('permissions', 'undefined');
      jest.resetModules();
      const fresh = new RolepermissionService();
      expect(fresh.permissions).toEqual([]);
    });

    it('should load stored permissions during construction', () => {
      const perms = [{ PermissionKey: 'view' }];
      localStorage.setItem('permissions', JSON.stringify(perms));

      const fresh = new RolepermissionService();
      expect(fresh.permissions).toEqual(perms);
    });
  });

  describe('setPermissions', () => {
    it('should replace the permission list', () => {
      const perms = [{ PermissionKey: 'ADD' }, { PermissionKey: 'EDIT' }];
      service.setPermissions(perms);
      expect(service.permissions).toEqual(perms);
    });

    it('should allow clearing permissions with an empty array', () => {
      service.setPermissions([{ PermissionKey: 'ADD' }]);
      service.setPermissions([]);
      expect(service.permissions).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    beforeEach(() => {
      service.setPermissions([
        { PermissionKey: 'VIEW' },
        { PermissionKey: 'Edit' },
        { PermissionKey: 'DELETE' },
      ]);
    });

    it('should return true when the permission exists (case-insensitive)', () => {
      expect(service.hasPermission('view')).toBe(true);
      expect(service.hasPermission('EDIT')).toBe(true);
      expect(service.hasPermission('edit')).toBe(true);
    });

    it('should return false when the permission does not exist', () => {
      expect(service.hasPermission('export')).toBe(false);
      expect(service.hasPermission('unknown')).toBe(false);
    });

    it('should return false when permissions are empty', () => {
      service.setPermissions([]);
      expect(service.hasPermission('VIEW')).toBe(false);
    });

    it('should be resilient to null PermissionKey values', () => {
      service.setPermissions([{ PermissionKey: null }, { PermissionKey: undefined }]);
      expect(service.hasPermission('view')).toBe(false);
    });

    it('should return false for an empty permission name request', () => {
      expect(service.hasPermission('')).toBe(false);
    });
  });
});