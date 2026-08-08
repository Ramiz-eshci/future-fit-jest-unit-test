import { Provider } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { GlobalFlagService } from 'src/app/services/global-flag.service';
import { NavService } from 'src/app/services/nav.service';
import { MenuService } from 'src/app/services/menu.service';
import { SidebarService } from 'src/app/services/sidebar.service';
import { TourService } from 'src/app/services/tour.service';
import { PermissionService } from 'src/app/services/permission.service';
import { RolepermissionService } from 'src/app/services/rolepermission.service';

export const mockHttpClient = {
  get: jest.fn(() => of({})),
  post: jest.fn(() => of({})),
  put: jest.fn(() => of({})),
  delete: jest.fn(() => of({})),
  request: jest.fn(() => of({})),
};

export const mockSnackBar = {
  open: jest.fn(),
  openFromComponent: jest.fn(),
  dismiss: jest.fn(),
};

export const mockDialog = {
  open: jest.fn(() => ({ afterClosed: () => of(null) })),
  closeAll: jest.fn(),
  openDialogs: [],
};

export const mockDialogRef = {
  close: jest.fn(),
  updateSize: jest.fn(),
  updatePosition: jest.fn(),
  addPanelClass: jest.fn(),
  removePanelClass: jest.fn(),
};

export const mockActivatedRoute = {
  snapshot: {
    paramMap: { get: jest.fn(() => '1'), has: jest.fn(() => true) },
    queryParamMap: { get: jest.fn(() => '1') },
    params: {},
    data: {},
  },
  paramMap: of({ get: () => '1' }),
  queryParamMap: of({ get: () => '1' }),
  params: of({}),
  queryParams: of({}),
};

export const mockRouter = {
  navigate: jest.fn(() => Promise.resolve(true)),
  navigateByUrl: jest.fn(() => Promise.resolve(true)),
  createUrlTree: jest.fn(() => ({})),
  serializeUrl: jest.fn(() => '/'),
  parseUrl: jest.fn(() => ({})),
  isActive: jest.fn(() => false),
  events: of({}),
  url: '/',
};

export const mockCommonService = {
  getData: jest.fn(() => of({ status: true, data: [] })),
  postData: jest.fn(() => of({ status: true, data: [] })),
  addData: jest.fn(() => of({ status: true, data: [], message: 'OK' })),
  deleteData: jest.fn(() => of({ status: true, data: [], message: 'OK' })),
  getDatatable: jest.fn(() => of({ status: true, data: [], total_records: 0 })),
  getDatatableFilter: jest.fn(() => of({ status: true, data: [], total_records: 0 })),
  getDatatableFilterCompanyDetails: jest.fn(() => of({ status: true, data: [], total_records: 0 })),
  handleError: jest.fn(),
  handleErrorNew: jest.fn(),
};

export const mockUserService = {
  login: jest.fn(() => of({ status: true, data: {} })),
  change_password: jest.fn(() => of({ status: true, data: {}, message: 'OK' })),
  loadPermissions: jest.fn(() => of({})),
  logout: jest.fn(),
  saveTokens: jest.fn(),
};

export const mockErrorLogService = {
  handleSuccess: jest.fn(),
  handleWarning: jest.fn(),
  ChangeUpdate: jest.fn(),
};

export const mockGlobalFlagService = {
  setSubmitted: jest.fn(),
  isSubmitted: jest.fn(() => false),
};

export const mockNavService = {};
export const mockMenuService = {
  getMenus: jest.fn(() => of([])),
  setMenus: jest.fn(),
  getMenuIdByPath: jest.fn(() => 0),
  getPermissions: jest.fn(() => of([])),
};
export const mockSidebarService = {
  toggleSidebar: jest.fn(),
  closeSidebar: jest.fn(),
};
export const mockTourService = {
  triggerTour: jest.fn(),
};
export const mockPermissionService = {
  getPermissions: jest.fn(() => of([])),
  hasPermission: jest.fn(() => true),
};
export const mockRolePermissionService = {
  setPermissions: jest.fn(),
};

export const APP_TEST_PROVIDERS: Provider[] = [
  { provide: HttpClient, useValue: mockHttpClient },
  { provide: Router, useValue: mockRouter },
  { provide: ActivatedRoute, useValue: mockActivatedRoute },
  { provide: MatSnackBar, useValue: mockSnackBar },
  { provide: MatDialog, useValue: mockDialog },
  { provide: MatDialogRef, useValue: mockDialogRef },
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: CommonService, useValue: mockCommonService },
  { provide: UserService, useValue: mockUserService },
  { provide: ErrorLogService, useValue: mockErrorLogService },
  { provide: GlobalFlagService, useValue: mockGlobalFlagService },
  { provide: NavService, useValue: mockNavService },
  { provide: MenuService, useValue: mockMenuService },
  { provide: SidebarService, useValue: mockSidebarService },
  { provide: TourService, useValue: mockTourService },
  { provide: PermissionService, useValue: mockPermissionService },
  { provide: RolepermissionService, useValue: mockRolePermissionService },
];