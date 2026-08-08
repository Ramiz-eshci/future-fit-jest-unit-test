import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be02FormComponent } from './be02-form.component';

describe('Be02FormComponent', () => {
  let component: Be02FormComponent;
  let fixture: ComponentFixture<Be02FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be02FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be02FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
