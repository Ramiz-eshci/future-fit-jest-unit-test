import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddRelevanceComponent } from './add-relevance.component';

describe('AddRelevanceComponent', () => {
  let component: AddRelevanceComponent;
  let fixture: ComponentFixture<AddRelevanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRelevanceComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
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
