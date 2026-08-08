import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { AddBeGoalsComponent } from './add-be-goals.component';

describe('AddBeGoalsComponent', () => {
  let component: AddBeGoalsComponent;
  let fixture: ComponentFixture<AddBeGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeGoalsComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBeGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
