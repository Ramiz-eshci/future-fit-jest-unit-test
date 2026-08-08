import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { ViewDoseHistoryComponent } from './view-dose-history.component';

describe('ViewDoseHistoryComponent', () => {
  let component: ViewDoseHistoryComponent;
  let fixture: ComponentFixture<ViewDoseHistoryComponent>;

  const historyData = [
    { dose_change: '+10', date_prescribed: '2024-01-01', comments: 'ok', created_on: '2024-01-02' },
    { dose_change: '-5', date_prescribed: '2024-02-01', comments: 'reduced', created_on: '2024-02-02' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDoseHistoryComponent],

      providers: [
        provideNoopAnimations(),
        ...APP_TEST_PROVIDERS,
        { provide: MAT_DIALOG_DATA, useValue: historyData },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDoseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the dialog data', () => {
    expect(component.data).toBe(historyData);
  });

  it('should render one row per history record', () => {
    const rows = fixture.nativeElement.querySelectorAll('table tr');
    expect(rows.length).toBe(historyData.length + 1);
  });

  it('should render the dose change value', () => {
    const firstBodyRow = fixture.nativeElement.querySelector('table tr:nth-child(2)');
    expect(firstBodyRow.textContent).toContain('+10');
  });

  it('should close the dialog on close', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    const closeSpy = jest.spyOn(dialogRef, 'close');
    component.onClose();
    expect(closeSpy).toHaveBeenCalled();
  });
});
