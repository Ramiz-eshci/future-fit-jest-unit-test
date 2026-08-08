// import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

// @Directive({
//     selector: '[appNumberFormat]'
// })
// export class NumberFormatDirective implements OnInit {

//     private el: HTMLInputElement;

//     constructor(private elementRef: ElementRef) {
//         this.el = this.elementRef.nativeElement;
//     }

//     ngOnInit() {
//         // Initial format on load
//         this.formatInput(this.el.value);
//         console.log('gerererer')
//     }

//     @HostListener('input', ['$event'])
//     onInput(event: Event) {
//         const input = event.target as HTMLInputElement;
//         const value = input.value.replace(/,/g, '');
//         this.formatInput(value);
//     }

//     private formatInput(value: string | number) {
//         if (!value) return;
//         const numericValue = value.toString().replace(/,/g, '');
//         if (isNaN(+numericValue)) return;

//         this.el.value = Number(numericValue).toLocaleString('en-US');
//     }
// }


import {
  Directive,
  HostListener,
  ElementRef,
  Renderer2,
  Optional,
  AfterViewInit
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormatter]'
})
export class NumberFormatterDirective implements AfterViewInit {
  private lastCleanValue: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() private control: NgControl
  ) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const raw = value.replace(/,/g, '');
    const num = parseFloat(raw);

    if (!isNaN(num)) {
      this.lastCleanValue = num.toString();

      if (this.control?.control) {
        this.control.control.setValue(num, { emitEvent: false });
      }

      const formatted = new Intl.NumberFormat('en-US').format(num);
      this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
    } else {
      // 🛠️ Ensure field blank when input is cleared
      this.lastCleanValue = '';
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      if (this.control?.control) {
        this.control.control.setValue(null, { emitEvent: false });
      }
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const val = this.control?.control?.value;

    if (val === null || val === '') {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      return;
    }

    const formatted = new Intl.NumberFormat('en-US').format(+val);
    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }

  @HostListener('focus')
  onFocus(): void {
    const val = this.control?.control?.value;

    if (val === null || val === '') {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      return;
    }

    this.renderer.setProperty(this.el.nativeElement, 'value', val.toString());
  }

  ngAfterViewInit(): void {
    const val = this.control?.control?.value;

    if (val === null || val === '') {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      this.lastCleanValue = '';
      return;
    }

    const formatted = new Intl.NumberFormat('en-US').format(+val);
    this.lastCleanValue = val.toString();
    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }
}
