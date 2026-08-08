import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be18FormComponent } from './be18-form.component';

describe('Be18FormComponent', () => {
  let component: Be18FormComponent;
  let fixture: ComponentFixture<Be18FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be18FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be18FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
