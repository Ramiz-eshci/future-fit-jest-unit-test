import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { EditFinancialAssetComponent } from './edit-financial-asset.component';

describe('EditFinancialAssetComponent', () => {
  let component: EditFinancialAssetComponent;
  let fixture: ComponentFixture<EditFinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFinancialAssetComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFinancialAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
