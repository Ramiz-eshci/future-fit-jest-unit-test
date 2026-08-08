import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { EditPurchaseComponent } from './edit-purchase.component';

describe('EditPurchaseComponent', () => {
  let component: EditPurchaseComponent;
  let fixture: ComponentFixture<EditPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPurchaseComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
