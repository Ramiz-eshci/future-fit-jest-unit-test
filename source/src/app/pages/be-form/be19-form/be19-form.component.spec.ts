import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Be19FormComponent } from './be19-form.component';

describe('Be19FormComponent', () => {
  let component: Be19FormComponent;
  let fixture: ComponentFixture<Be19FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be19FormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be19FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
