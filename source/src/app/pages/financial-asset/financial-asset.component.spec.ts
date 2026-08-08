import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialAssetComponent } from './financial-asset.component';

describe('FinancialAssetComponent', () => {
  let component: FinancialAssetComponent;
  let fixture: ComponentFixture<FinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialAssetComponent]
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
