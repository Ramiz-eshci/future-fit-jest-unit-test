import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBeGoalsComponent } from './edit-be-goals.component';

describe('EditBeGoalsComponent', () => {
  let component: EditBeGoalsComponent;
  let fixture: ComponentFixture<EditBeGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBeGoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBeGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
