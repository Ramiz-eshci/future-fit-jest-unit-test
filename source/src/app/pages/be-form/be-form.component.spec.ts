import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { BeFormComponent } from './be-form.component';

describe('BeFormComponent', () => {
  let component: BeFormComponent;
  let fixture: ComponentFixture<BeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeFormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
