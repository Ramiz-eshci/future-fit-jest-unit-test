import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { FinancialAssetComponent } from './financial-asset.component';

describe('FinancialAssetComponent', () => {
  let component: FinancialAssetComponent;
  let fixture: ComponentFixture<FinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialAssetComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
