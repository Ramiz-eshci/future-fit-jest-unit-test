import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be09FormComponent } from './be09-form.component';

describe('Be09FormComponent', () => {
  let component: Be09FormComponent;
  let fixture: ComponentFixture<Be09FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be09FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be09FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
