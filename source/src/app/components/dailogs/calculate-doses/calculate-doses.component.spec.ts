import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateDosesComponent } from './calculate-doses.component';

describe('CalculateDosesComponent', () => {
  let component: CalculateDosesComponent;
  let fixture: ComponentFixture<CalculateDosesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateDosesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateDosesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
