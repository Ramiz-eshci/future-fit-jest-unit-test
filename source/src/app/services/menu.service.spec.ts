import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MenuService } from './menu.service';
import { CommonService } from './common.service';
import { UserService } from './user.service';

describe('MenuService', () => {
  let service: MenuService;
  let commonServiceSpy: jest.Mocked<Pick<CommonService, 'getData'>> & CommonService;
  let userServiceSpy: { RoleID: number | string };

  const fakeMenus = [
    { MenuId: 1, ParentId: 0, IsOption: false, PagePath: '/dashboard' },
    { MenuId: 2, ParentId: 1, IsOption: true, PagePath: '/reports' },
    { MenuId: 3, ParentId: 1, IsOption: true, PagePath: '/settings' },
    { MenuId: 4, ParentId: 9, IsOption: false, PagePath: '/profile' },
  ];

  beforeEach(() => {
    commonServiceSpy = {
      getData: jest.fn().mockReturnValue(of({ status: true, data: fakeMenus })),
    } as unknown as typeof commonServiceSpy;

    userServiceSpy = { RoleID: 5 };

    TestBed.configureTestingModule({
      providers: [
        MenuService,
        { provide: HttpClient, useValue: {} },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    });

    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialise menuList to an empty array', () => {
    expect(service.menuList).toEqual([]);
  });

  it('should read RoleID from userService during construction', () => {
    expect(service.RoleID).toBe(5);
  });

  describe('getMenus', () => {
    it('should request the role permissions using the user RoleID', (done) => {
      service.getMenus().subscribe(() => {
        expect(commonServiceSpy.getData).toHaveBeenCalledWith('list/getRolePermissions/5');
        done();
      });
    });

    it('should store the menu list when response status is true', (done) => {
      service.getMenus().subscribe(() => {
        expect(service.menuList).toEqual(fakeMenus);
        done();
      });
    });

    it('should NOT store the menu list when response status is false', (done) => {
      commonServiceSpy.getData.mockReturnValue(of({ status: false, data: fakeMenus }) as never);

      service.getMenus().subscribe(() => {
        expect(service.menuList).toEqual([]);
        done();
      });
    });
  });

  describe('setMenus', () => {
    it('should replace the menu list', () => {
      const newMenus = [{ MenuId: 99 }];
      service.setMenus(newMenus);
      expect(service.menuList).toEqual(newMenus);
    });
  });

  describe('getMenuIdByPath', () => {
    beforeEach(() => {
      service.setMenus(fakeMenus);
    });

    it('should return the MenuId when path matches after stripping a leading slash', () => {
      expect(service.getMenuIdByPath('dashboard')).toBe(1);
      expect(service.getMenuIdByPath('reports')).toBe(2);
    });

    it('should also match when the stored path has no leading slash', () => {
      service.setMenus([{ MenuId: 7, PagePath: 'no-slash' }]);
      expect(service.getMenuIdByPath('no-slash')).toBe(7);
    });

    it('should return 0 when no menu matches', () => {
      expect(service.getMenuIdByPath('does-not-exist')).toBe(0);
    });

    it('should return 0 when a menu entry has no PagePath', () => {
      service.setMenus([{ MenuId: 7 }]);
      expect(service.getMenuIdByPath('whatever')).toBe(0);
    });
  });

  describe('getPermissions', () => {
    beforeEach(() => {
      service.setMenus(fakeMenus);
    });

    it('should return children of the given menu id that are options', () => {
      const permissions = service.getPermissions(1);

      expect(permissions).toHaveLength(2);
      expect(permissions).toContainEqual({ MenuId: 2, ParentId: 1, IsOption: true, PagePath: '/reports' });
    });

    it('should exclude non-option children', () => {
      expect(service.getPermissions(9)).toHaveLength(0);
    });

    it('should return an empty array when no children exist', () => {
      expect(service.getPermissions(999)).toEqual([]);
    });
  });
});
