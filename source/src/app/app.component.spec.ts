import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { GlobalFlagService } from './services/global-flag.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let globalFlagService: GlobalFlagService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    globalFlagService = TestBed.inject(GlobalFlagService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    expect(component.title).toBe('Modernize Angular Admin Tempplate');
  });

  it('should render the router outlet', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  describe('handleBeforeUnload', () => {
    it('should prevent unload when dirty forms exist and form not submitted', () => {
      // Simulate a dirty form element in the document
      const dummy = document.createElement('form');
      dummy.className = 'ng-dirty';
      document.body.appendChild(dummy);

      const event = { preventDefault: jest.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
      component.handleBeforeUnload(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.returnValue).toBe('You have unsaved changes. Do you really want to leave?');

      document.body.removeChild(dummy);
    });

    it('should NOT prevent unload when no dirty forms exist', () => {
      const event = { preventDefault: jest.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
      component.handleBeforeUnload(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should NOT prevent unload when the form was already submitted', () => {
      const dummy = document.createElement('form');
      dummy.className = 'ng-dirty';
      document.body.appendChild(dummy);

      globalFlagService.setSubmitted(true);

      const event = { preventDefault: jest.fn(), returnValue: '' } as unknown as BeforeUnloadEvent;
      component.handleBeforeUnload(event);

      expect(event.preventDefault).not.toHaveBeenCalled();

      document.body.removeChild(dummy);
    });
  });
});