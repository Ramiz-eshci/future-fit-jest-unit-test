import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFinancialAssetComponent } from './add-financial-asset.component';

describe('AddFinancialAssetComponent', () => {
  let component: AddFinancialAssetComponent;
  let fixture: ComponentFixture<AddFinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFinancialAssetComponent]
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
