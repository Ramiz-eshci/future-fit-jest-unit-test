import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceYearComponent } from './reference-year.component';

describe('ReferenceYearComponent', () => {
  let component: ReferenceYearComponent;
  let fixture: ComponentFixture<ReferenceYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferenceYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
