import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { RelevanceComponent } from './relevance.component';

describe('RelevanceComponent', () => {
  let component: RelevanceComponent;
  let fixture: ComponentFixture<RelevanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelevanceComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelevanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
