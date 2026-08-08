import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be20FormComponent } from './be20-form.component';

describe('Be20FormComponent', () => {
  let component: Be20FormComponent;
  let fixture: ComponentFixture<Be20FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be20FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be20FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
