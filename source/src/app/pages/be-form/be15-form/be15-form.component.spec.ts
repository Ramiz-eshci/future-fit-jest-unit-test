import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be15FormComponent } from './be15-form.component';

describe('Be15FormComponent', () => {
  let component: Be15FormComponent;
  let fixture: ComponentFixture<Be15FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be15FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be15FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
