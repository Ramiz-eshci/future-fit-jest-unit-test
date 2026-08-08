import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBeGoalsComponent } from './add-be-goals.component';

describe('AddBeGoalsComponent', () => {
  let component: AddBeGoalsComponent;
  let fixture: ComponentFixture<AddBeGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeGoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
