import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { ReferenceYearComponent } from './reference-year.component';

describe('ReferenceYearComponent', () => {
  let component: ReferenceYearComponent;
  let fixture: ComponentFixture<ReferenceYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceYearComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferenceYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
