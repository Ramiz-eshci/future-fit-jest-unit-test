import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be12FormComponent } from './be12-form.component';

describe('Be12FormComponent', () => {
  let component: Be12FormComponent;
  let fixture: ComponentFixture<Be12FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be12FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be12FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
