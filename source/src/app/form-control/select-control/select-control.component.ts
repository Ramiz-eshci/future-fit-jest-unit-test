import { Component, ElementRef, forwardRef, Input, OnInit, OnChanges, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatAccordion } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface SelectControlItem {
  id: string;
  name: string;
  [x: string]: string;
}
@Component({
  selector: 'app-select-control',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule, MatAccordion, MatSelectModule],
  templateUrl: './select-control.component.html',
  styleUrl: './select-control.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectControlComponent),
      multi: true,
    },
  ],
})
export class SelectControlComponent implements OnInit, ControlValueAccessor {

  @ViewChild('inputRef')
  inputRef: ElementRef<HTMLInputElement>;
  @Input()
  items: any = [];
  newItems: any;
  @Input()
  ControlName: string | number;
  @Input() public form: FormGroup;
  @Input() control: FormControl;

  @Input()
  displayExpr = 'name';
  @Input()
  valueExpr = 'id';
  @Input()
  searchExpr = 'name';
  @Input()
  groupExpr: any;
  @Input()
  searchEnabled = true;

  @Input()
  disabledItems: any[] = [];
  @Input()
  grouped = false;
  @Input()
  maxDisplayedTags = 2;
  @Input()
  multiple: undefined;

  @Input()
  template: TemplateRef<any>;

  @Input()
  value: any
  @Input()
  dataSource: any = [];

  @Input() inputNgStyle: any;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>(); // Event emitter
  _multiple: boolean;

  ngOnInit() {
    // if(this.disabledItems.length > 0){
    //   console.log('870')
    //   this.disabledItems.forEach(element => {
    //     for (let [key, value1] of Object.entries(JSON.parse(JSON.stringify(this.items)))) {
    //       value1 = this.deleteElementFromObject(value1, key, element);
    //       this.items[key] = value1
    //      }
    //   });
    // }
    this.filterManagerTag()
    this._multiple = this.multiple !== undefined;

  }
  ngOnChanges() {
  }
  onSelectionChange(event: any) {
    // Emit the selected value when the selection changes
    console.log('onSelectionChange -- 120')
    this.selectionChange.emit(event.value); // Send the selected value to the parent
  }
  filterManagerTag() {
    let disabledItems = this.disabledItems; // Array of disabled item IDs

    // Filter manager tags
    let optionArr = this.items.filter((item: { id: any; }) => {
      if (this.value === item.id) {
        return true; // Include item if its ID matches `this.value`
      } else {
        return !disabledItems.includes(item.id); // Exclude item if it's in `disabledItems`
      }
    });

    // Assign the filtered items to `newItems`
    this.newItems = optionArr;

  }
  deleteElementFromObject(obj: any, key: any, element: any) {
    // Check if the key exists in the object
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
      // Filter out the specified element from the array
      return obj[key] = obj[key].filter((value: any) => value !== element);
    }
  }
  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any): void {
    this.value = value;
    this.onChange(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
  }

  GetFilterTag(ManagerTags: any) {
    let list: any = []
    // list = JSON.parse(JSON.stringify(ManagerTags))
    list = JSON.parse(JSON.stringify(ManagerTags))
    let disableItems = []
    disableItems = this.disabledItems;
    console.log(disableItems, ' 868')
    if (disableItems.length > 0) {
      console.log('870')
      disableItems.forEach(element => {
        console.log('871', element)
        const objWithIdIndex = list.findIndex((obj: { id: any; }) => obj.id === element);
        list.splice(objWithIdIndex, 1);

      });
    }
    return list;
    console.log(JSON.stringify(ManagerTags), 'ManagerTags')
    console.log(list, 'list ---- ')
    // return ManagerTags;

  }


}
