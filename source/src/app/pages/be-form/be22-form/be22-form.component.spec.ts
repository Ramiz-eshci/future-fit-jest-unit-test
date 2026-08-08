import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be22FormComponent } from './be22-form.component';

describe('Be22FormComponent', () => {
  let component: Be22FormComponent;
  let fixture: ComponentFixture<Be22FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be22FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be22FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
