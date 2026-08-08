import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding">
      <a [routerLink]="['/']">
        <img
          src="./assets/images/logos/future_fit_logo.png"
          class="align-middle m-2"
          alt="logo"
          width="250"
          height="96"
        />
      </a>
    </div>
  `,
})
export class BrandingComponent {
  constructor() {}
}
