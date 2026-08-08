import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFlagService } from './services/global-flag.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Modernize Angular Admin Tempplate';
  constructor(
    private globalFlagService: GlobalFlagService,
  ) { }
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    // const forms = document.querySelectorAll('form.ng-dirty');
    const forms = document.querySelectorAll('.ng-dirty');
    if (forms.length > 0 && !this.globalFlagService.isSubmitted()) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Do you really want to leave?';
    }
  }
}
