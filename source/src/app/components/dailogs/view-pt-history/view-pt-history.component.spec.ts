import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPtHistoryComponent } from './view-pt-history.component';

describe('ViewPtHistoryComponent', () => {
  let component: ViewPtHistoryComponent;
  let fixture: ComponentFixture<ViewPtHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPtHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPtHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
