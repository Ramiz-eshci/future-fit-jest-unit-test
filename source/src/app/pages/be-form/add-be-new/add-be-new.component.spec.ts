import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddBeNewComponent } from './add-be-new.component';

describe('AddBeNewComponent', () => {
  let component: AddBeNewComponent;
  let fixture: ComponentFixture<AddBeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeNewComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
