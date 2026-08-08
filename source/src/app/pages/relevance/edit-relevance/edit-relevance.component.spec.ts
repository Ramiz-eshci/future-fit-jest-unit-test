import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { EditRelevanceComponent } from './edit-relevance.component';

describe('EditRelevanceComponent', () => {
  let component: EditRelevanceComponent;
  let fixture: ComponentFixture<EditRelevanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRelevanceComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
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
