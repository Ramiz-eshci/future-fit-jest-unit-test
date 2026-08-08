import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeFormComponent } from './be-form.component';

describe('BeFormComponent', () => {
  let component: BeFormComponent;
  let fixture: ComponentFixture<BeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
