import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationComponent } from '../components/validation/validation.component';
import { SelectControlComponent } from 'src/app/form-control/select-control/select-control.component';

import { CountUpDirective } from '../form-control/count-up/count-up.directive';
import { NumberFormatterDirective  } from './directives/number-format.directive';


@NgModule({
  declarations: [ValidationComponent,CountUpDirective,NumberFormatterDirective ],
  imports: [
    CommonModule,
    SelectControlComponent
  ],
  exports:[ValidationComponent,SelectControlComponent,CountUpDirective,NumberFormatterDirective ]
})
export class SharedModule { }
