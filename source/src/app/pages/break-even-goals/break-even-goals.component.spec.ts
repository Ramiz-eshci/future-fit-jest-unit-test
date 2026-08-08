import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { BreakEvenGoalsComponent } from './break-even-goals.component';

describe('BreakEvenGoalsComponent', () => {
  let component: BreakEvenGoalsComponent;
  let fixture: ComponentFixture<BreakEvenGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakEvenGoalsComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakEvenGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
