import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRelevanceComponent } from './add-relevance.component';

describe('AddRelevanceComponent', () => {
  let component: AddRelevanceComponent;
  let fixture: ComponentFixture<AddRelevanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRelevanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRelevanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
