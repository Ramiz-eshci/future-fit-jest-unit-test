import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { RolepermissionService } from 'src/app/services/rolepermission.service';
import { APP_TEST_PROVIDERS, mockCommonService, mockRolePermissionService } from 'src/app/testing/test-helpers';

import { TutorialVideosComponent } from './tutorial-videos.component';

describe('TutorialVideosComponent', () => {
  let component: TutorialVideosComponent;
  let fixture: ComponentFixture<TutorialVideosComponent>;

  const permissionService = { ...mockRolePermissionService, hasPermission: jest.fn(() => true) };

  beforeEach(async () => {
    mockCommonService.getDatatableFilter.mockClear();
    mockCommonService.getDatatableFilter.mockReturnValue(
      of({
        status: true,
        data: [{ id: 1, title: 'Intro', video_url: 'url', order_by: 1 }],
        total_records: 1,
      }) as any
    );

    await TestBed.configureTestingModule({
      imports: [TutorialVideosComponent],

      providers: [
        provideNoopAnimations(),
        ...APP_TEST_PROVIDERS,
        { provide: CommonService, useValue: mockCommonService },
        { provide: RolepermissionService, useValue: permissionService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the tutorial video columns', () => {
    expect(component.displayedColumns).toEqual(['title', 'video_url', 'order_by']);
  });

  it('should load the table data through the datatable endpoint', () => {
    expect(mockCommonService.getDatatableFilter).toHaveBeenCalledWith(
      'tutorial-videos/getDatatable',
      expect.any(Number),
      expect.any(Number),
      ''
    );
  });

  it('should populate the data source from the datatable response', () => {
    expect(component.dataSource.data).toHaveLength(1);
  });

  it('should apply a trimmed lower-cased filter and reload the table', () => {
    component.applyFilter({ target: { value: '  water ' } } as unknown as Event);
    expect(component.filterValue).toBe('water');
    expect(mockCommonService.getDatatableFilter).toHaveBeenLastCalledWith(
      'tutorial-videos/getDatatable',
      1,
      expect.any(Number),
      'water'
    );
  });

  it('should load permissions on init', () => {
    expect(permissionService.hasPermission).toHaveBeenCalledWith('Tutorial Videos_Add');
    expect(permissionService.hasPermission).toHaveBeenCalledWith('Tutorial Videos_Edit');
    expect(permissionService.hasPermission).toHaveBeenCalledWith('Tutorial Videos_Delete');
  });
});