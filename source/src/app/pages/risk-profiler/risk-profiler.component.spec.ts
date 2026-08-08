import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import Swal from 'sweetalert2';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { RiskProfilerComponent } from './risk-profiler.component';

describe('RiskProfilerComponent', () => {
  let component: RiskProfilerComponent;
  let fixture: ComponentFixture<RiskProfilerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskProfilerComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskProfilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the static table for a known type', () => {
    component.loadStaticTable('sector');
    expect(component.title).toBe('Sector');
    expect(component.displayedColumns).toEqual(['sector_name']);
    expect(component.totalData).toBe(4);
    expect(component.dataSource.data.length).toBe(4);
  });

  it('should update columns and data for the logic table', () => {
    component.loadStaticTable('logic');
    expect(component.title).toBe('Logic');
    expect(component.displayedColumns).toEqual(['goal', 'type', 'risk']);
    expect(component.dataSource.data).toHaveLength(5);
  });

  it('should warn when loading an unknown table type', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    component.loadStaticTable('unknown');
    expect(consoleSpy).toHaveBeenCalledWith('Invalid table type:', 'unknown');
    consoleSpy.mockRestore();
  });

  it('should apply a lower-cased trimmed filter to the data source', () => {
    component.dataSource.data = [{ company_name: 'ABC' }] as any;
    component.applyFilter({ target: { value: '  AbC ' } } as unknown as Event);
    expect(component.dataSource.filter).toBe('abc');
  });

  it('should show an info dialog when deleting in static mode', () => {
    const swalSpy = jest.spyOn(Swal, 'fire');
    component.deleteCompany(1);
    expect(swalSpy).toHaveBeenCalledWith('Static Mode', expect.any(String), 'info');
    swalSpy.mockRestore();
  });
});
