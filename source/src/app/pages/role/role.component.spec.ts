import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { RoleComponent } from './role.component';

describe('RoleComponent', () => {
  let component: RoleComponent;
  let fixture: ComponentFixture<RoleComponent>;

  beforeEach(async () => {
    mockCommonService.getDatatableFilter.mockReturnValue(
      of({ status: true, data: [{ role_id: 1, role_name: 'Admin', description: 'x', access_level: 1, is_active: true }], total: 1 }) as any
    );

    await TestBed.configureTestingModule({
      imports: [RoleComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleComponent);
    component = fixture.componentInstance;
    component.totalData = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load role data into the data source', () => {
    expect(component.RoleData.length).toBe(1);
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should apply a filter and reload the table', () => {
    const loadSpy = jest.spyOn(component, 'loadTableData');
    component.applyFilter({ target: { value: 'Admin' } } as any);
    expect(component.filterValue).toBe('admin');
    expect(component.paginator.pageIndex).toBe(0);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should expose the page sizes', () => {
    expect(component.pageSizes).toEqual([5, 10, 25]);
  });
});