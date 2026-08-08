import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelpDialogComponent } from './help-dialog.component';

describe('HelpDialogComponent', () => {
  let component: HelpDialogComponent;
  let fixture: ComponentFixture<HelpDialogComponent>;

  const dialogData = {
    criteria: '<b>Must have financial controls</b>',
    notes: '<i>Reviewed quarterly</i>',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: dialogData }],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the injected dialog data', () => {
    expect(component.data).toEqual(dialogData);
  });

  it('should render the dialog title', () => {
    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent.trim()).toContain('Help Information');
  });

  it('should render the criteria heading', () => {
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h3') as NodeListOf<HTMLElement>
    );
    expect(headings.some((h) => h.textContent?.includes('Fitness Criteria'))).toBe(true);
  });

  it('should render the notes heading', () => {
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h3') as NodeListOf<HTMLElement>
    );
    expect(headings.some((n) => n.textContent?.includes('Notes'))).toBe(true);
  });

  it('should bind the criteria HTML through innerHTML', () => {
    const criteriaDiv = fixture.nativeElement.querySelector('.dialog-section div');
    expect(criteriaDiv.textContent).toContain('Must have financial controls');
  });

  it('should render a close button', () => {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>
    );
    expect(buttons.some((btn) => btn.textContent?.trim() === 'Close')).toBe(true);
  });
});