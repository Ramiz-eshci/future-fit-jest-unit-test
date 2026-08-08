import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be17FormComponent } from './be17-form.component';

describe('Be17FormComponent', () => {
  let component: Be17FormComponent;
  let fixture: ComponentFixture<Be17FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be17FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be17FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
