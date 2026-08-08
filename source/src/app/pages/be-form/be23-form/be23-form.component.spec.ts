import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be23FormComponent } from './be23-form.component';

describe('Be23FormComponent', () => {
  let component: Be23FormComponent;
  let fixture: ComponentFixture<Be23FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be23FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be23FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
