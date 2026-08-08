import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be14FormComponent } from './be14-form.component';

describe('Be14FormComponent', () => {
  let component: Be14FormComponent;
  let fixture: ComponentFixture<Be14FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be14FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be14FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
