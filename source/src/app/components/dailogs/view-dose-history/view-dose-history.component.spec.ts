import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDoseHistoryComponent } from './view-dose-history.component';

describe('ViewDoseHistoryComponent', () => {
  let component: ViewDoseHistoryComponent;
  let fixture: ComponentFixture<ViewDoseHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDoseHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDoseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
