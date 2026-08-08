import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { Be07FormComponent } from './be07-form.component';

describe('Be07FormComponent', () => {
  let component: Be07FormComponent;
  let fixture: ComponentFixture<Be07FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Be07FormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Be07FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
