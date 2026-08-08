import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFinancialAssetComponent } from './edit-financial-asset.component';

describe('EditFinancialAssetComponent', () => {
  let component: EditFinancialAssetComponent;
  let fixture: ComponentFixture<EditFinancialAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFinancialAssetComponent]
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
