import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBeNewComponent } from './add-be-new.component';

describe('AddBeNewComponent', () => {
  let component: AddBeNewComponent;
  let fixture: ComponentFixture<AddBeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
