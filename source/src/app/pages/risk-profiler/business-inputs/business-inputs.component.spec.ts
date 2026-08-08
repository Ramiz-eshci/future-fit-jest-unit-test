import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { BusinessInputsComponent } from './business-inputs.component';

describe('BusinessInputsComponent', () => {
  let component: BusinessInputsComponent;
  let fixture: ComponentFixture<BusinessInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessInputsComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the characteristic questions', () => {
    expect(component.questions.length).toBe(4);
    expect(component.questions[0].text).toContain('fossil fuels');
  });

  it('should set the activity answer on a question', () => {
    component.selectActivity(component.questions[0], 'Yes');
    expect(component.questions[0].activityAnswer).toBe('Yes');
  });

  it('should set the company answer on a question', () => {
    component.selectCompany(component.questions[1], 'No');
    expect(component.questions[1].companyAnswer).toBe('No');
  });

  it('should reset previously set company answers when overwritten', () => {
    component.selectCompany(component.questions[2], 'Yes');
    component.selectCompany(component.questions[2], 'Not answered');
    expect(component.questions[2].companyAnswer).toBe('Not answered');
  });
});
