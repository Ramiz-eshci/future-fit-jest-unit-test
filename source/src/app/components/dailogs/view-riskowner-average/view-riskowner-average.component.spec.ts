import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRiskownerAverageComponent } from './view-riskowner-average.component';

describe('ViewRiskownerAverageComponent', () => {
  let component: ViewRiskownerAverageComponent;
  let fixture: ComponentFixture<ViewRiskownerAverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRiskownerAverageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRiskownerAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
