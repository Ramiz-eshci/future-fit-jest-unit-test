import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be05FormComponent } from './be05-form.component';

describe('Be05FormComponent', () => {
  let component: Be05FormComponent;
  let fixture: ComponentFixture<Be05FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be05FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be05FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
