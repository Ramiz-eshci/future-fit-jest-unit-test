import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBe04CategoryComponent } from './add-be04-category.component';

describe('AddBe04CategoryComponent', () => {
  let component: AddBe04CategoryComponent;
  let fixture: ComponentFixture<AddBe04CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBe04CategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBe04CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
