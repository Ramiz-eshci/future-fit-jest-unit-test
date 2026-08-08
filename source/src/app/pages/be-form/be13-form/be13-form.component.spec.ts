import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be13FormComponent } from './be13-form.component';

describe('Be13FormComponent', () => {
  let component: Be13FormComponent;
  let fixture: ComponentFixture<Be13FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be13FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be13FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
