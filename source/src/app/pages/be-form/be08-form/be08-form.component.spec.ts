import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be08FormComponent } from './be08-form.component';

describe('Be08FormComponent', () => {
  let component: Be08FormComponent;
  let fixture: ComponentFixture<Be08FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be08FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be08FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
