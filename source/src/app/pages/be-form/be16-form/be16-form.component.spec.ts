import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be16FormComponent } from './be16-form.component';

describe('Be16FormComponent', () => {
  let component: Be16FormComponent;
  let fixture: ComponentFixture<Be16FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be16FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be16FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
