import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakEvenGoalsComponent } from './break-even-goals.component';

describe('BreakEvenGoalsComponent', () => {
  let component: BreakEvenGoalsComponent;
  let fixture: ComponentFixture<BreakEvenGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakEvenGoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakEvenGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
