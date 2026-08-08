import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be10FormComponent } from './be10-form.component';

describe('Be10FormComponent', () => {
  let component: Be10FormComponent;
  let fixture: ComponentFixture<Be10FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be10FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be10FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
