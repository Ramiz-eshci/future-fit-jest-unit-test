import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtUpdateStatusComponent } from './pt-update-status.component';

describe('PtUpdateStatusComponent', () => {
  let component: PtUpdateStatusComponent;
  let fixture: ComponentFixture<PtUpdateStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtUpdateStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtUpdateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
