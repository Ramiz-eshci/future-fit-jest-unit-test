import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { ViewPtHistoryComponent } from './view-pt-history.component';

describe('ViewPtHistoryComponent', () => {
  let component: ViewPtHistoryComponent;
  let fixture: ComponentFixture<ViewPtHistoryComponent>;

  const historyData = [
    { reading_id: 1, created_on: '2024-01-01', status_name: 'Active', created_name: 'Admin' },
    { reading_id: 2, created_on: '2024-02-01', status_name: 'Pending', created_name: 'User' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPtHistoryComponent],

      providers: [
        provideNoopAnimations(),
        ...APP_TEST_PROVIDERS,
        { provide: MAT_DIALOG_DATA, useValue: historyData },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPtHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the dialog data', () => {
    expect(component.data).toBe(historyData);
  });

  it('should render one timeline item per history record', () => {
    const items = fixture.nativeElement.querySelectorAll('.timeline-item');
    expect(items.length).toBe(historyData.length);
  });

  it('should render the status name and author', () => {
    const firstItem = fixture.nativeElement.querySelector('.timeline-item');
    expect(firstItem.textContent).toContain('Active');
    expect(firstItem.textContent).toContain('Admin');
  });

  it('should close the dialog on close', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    const closeSpy = jest.spyOn(dialogRef, 'close');
    component.onClose();
    expect(closeSpy).toHaveBeenCalled();
  });
});
