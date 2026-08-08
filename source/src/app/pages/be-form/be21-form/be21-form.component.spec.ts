import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be21FormComponent } from './be21-form.component';

describe('Be21FormComponent', () => {
  let component: Be21FormComponent;
  let fixture: ComponentFixture<Be21FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be21FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be21FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
