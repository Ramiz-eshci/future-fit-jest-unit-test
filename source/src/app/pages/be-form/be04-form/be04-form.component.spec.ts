import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be04FormComponent } from './be04-form.component';

describe('Be04FormComponent', () => {
  let component: Be04FormComponent;
  let fixture: ComponentFixture<Be04FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be04FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be04FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
