import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { CalculateDosesComponent } from './calculate-doses.component';

describe('CalculateDosesComponent', () => {
  let component: CalculateDosesComponent;
  let fixture: ComponentFixture<CalculateDosesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateDosesComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateDosesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
