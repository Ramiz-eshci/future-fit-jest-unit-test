import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-new-customers',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './new-customers.component.html',
})
export class AppNewCustomersComponent {
  @Input() title:any = 'Customers';
  @Input() icon:any = 'solar:football-outline';
  @Input() countValue:any = 0;
  constructor() {}
}
