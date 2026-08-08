import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be11FormComponent } from './be11-form.component';

describe('Be11FormComponent', () => {
  let component: Be11FormComponent;
  let fixture: ComponentFixture<Be11FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be11FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be11FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
