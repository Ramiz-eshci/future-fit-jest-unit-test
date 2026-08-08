import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRelevanceComponent } from './edit-relevance.component';

describe('EditRelevanceComponent', () => {
  let component: EditRelevanceComponent;
  let fixture: ComponentFixture<EditRelevanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRelevanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRelevanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
