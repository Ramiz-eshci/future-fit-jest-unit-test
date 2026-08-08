import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be06FormComponent } from './be06-form.component';

describe('Be06FormComponent', () => {
  let component: Be06FormComponent;
  let fixture: ComponentFixture<Be06FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be06FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be06FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
