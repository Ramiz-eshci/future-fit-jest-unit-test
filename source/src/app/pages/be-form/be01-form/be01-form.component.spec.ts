import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be01FormComponent } from './be01-form.component';

describe('Be01FormComponent', () => {
  let component: Be01FormComponent;
  let fixture: ComponentFixture<Be01FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be01FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be01FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
