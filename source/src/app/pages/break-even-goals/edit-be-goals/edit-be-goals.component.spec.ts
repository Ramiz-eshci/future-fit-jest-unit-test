import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { EditBeGoalsComponent } from './edit-be-goals.component';

describe('EditBeGoalsComponent', () => {
  let component: EditBeGoalsComponent;
  let fixture: ComponentFixture<EditBeGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBeGoalsComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBeGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
