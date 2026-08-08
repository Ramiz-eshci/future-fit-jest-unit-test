import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddFinancialAssetComponent } from './add-financial-asset.component';

describe('AddFinancialAssetComponent', () => {
  let component: AddFinancialAssetComponent;
  let fixture: ComponentFixture<AddFinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFinancialAssetComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFinancialAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
