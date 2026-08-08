import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddBeFormComponent } from './add-be-form.component';

describe('AddBeFormComponent', () => {
  let component: AddBeFormComponent;
  let fixture: ComponentFixture<AddBeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeFormComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
