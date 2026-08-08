import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be08FormComponent } from './be08-form.component';

describe('Be08FormComponent', () => {
  let component: Be08FormComponent;
  let fixture: ComponentFixture<Be08FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be08FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be08FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
