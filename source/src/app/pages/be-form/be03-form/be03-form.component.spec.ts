import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be03FormComponent } from './be03-form.component';

describe('Be03FormComponent', () => {
  let component: Be03FormComponent;
  let fixture: ComponentFixture<Be03FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be03FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be03FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
