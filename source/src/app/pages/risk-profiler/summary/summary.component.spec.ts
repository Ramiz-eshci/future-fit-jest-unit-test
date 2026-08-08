import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS } from 'src/app/testing/test-helpers';

import { SummaryComponent } from './summary.component';

describe('SummaryComponent', () => {
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the summary sections', () => {
    expect(component.sections.length).toBe(8);
  });

  it('should include the main impact categories', () => {
    const titles = component.sections.map((section) => section.title);
    expect(titles).toEqual(expect.arrayContaining(['Energy', 'Water', 'Pollution', 'People']));
  });

  it('should keep activity and company ratings per item', () => {
    const energy = component.sections.find((section) => section.title === 'Energy');
    expect(energy?.items[0]).toEqual(
      expect.objectContaining({ code: 'BE01', label: 'Energy Use', activity: 'Moderate', company: 'High' })
    );
  });

  it('should total 23 items across all sections', () => {
    const totalItems = component.sections.reduce((sum, section) => sum + section.items.length, 0);
    expect(totalItems).toBe(23);
  });
});