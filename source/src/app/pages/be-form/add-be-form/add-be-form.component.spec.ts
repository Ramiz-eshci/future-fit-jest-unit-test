import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBeFormComponent } from './add-be-form.component';

describe('AddBeFormComponent', () => {
  let component: AddBeFormComponent;
  let fixture: ComponentFixture<AddBeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
