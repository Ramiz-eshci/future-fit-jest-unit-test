import { Component, ViewChild } from '@angular/core';

import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder, FormArray,
  AbstractControl
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
import { CommonService } from 'src/app/services/common.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { catchError, map, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'YYYY' },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

interface Company {
  id: string;
  name: string;
}
@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [
    MaterialModule, MatMenuModule, MatButtonModule, MatTabsModule, CommonModule, MatTableModule, MatPaginatorModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
   providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './add-purchase.component.html',
  styleUrl: './add-purchase.component.scss'
})
export class AddPurchaseComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  purchaseForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  lastChangedIndex: number | null = null;

  title: any = 'Purchase';
  purchaseTypes: string[] = [
    'Product input',
    'Outsourced core function',
    'Ancillary spend'
  ];
  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID;
    this.CompanyID = this.userService.CompanyID;


    if (this.RoleID == 1) {
      this.purchaseForm = this.formBuilder.group({
        purchase: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],


        purchase_id: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // cost: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        purchase_type: ['', [Validators.required]],
        product_input: [''],
        company_id: ['', [Validators.required]],
        yearlyCostData: this.formBuilder.array([this.createYearCostGroup()])
      });
    } else {
      this.purchaseForm = this.formBuilder.group({
        purchase: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],



        purchase_id: ['', [Validators.pattern(/^[a-zA-Z0-9 .&_@#$%^ -]*$/)]],
        // cost: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
        purchase_type: ['', [Validators.required]],
        product_input: [''],
        company_id: [this.CompanyID],
        yearlyCostData: this.formBuilder.array([this.createYearCostGroup()])
      });
    }


    this.commonService.getData('list/company').subscribe((response) => {
      if (response.status === true) {
        this.companyArr = response.data;
      }
    });
  }
  get yearlyCostData(): FormArray {
    return this.purchaseForm.get('yearlyCostData') as FormArray;
  }

   
  createYearCostGroup(): FormGroup {
  const group = this.formBuilder.group({
    year: ['', Validators.required],
    cost: ['', [Validators.required, Validators.pattern(/^[0-9,]+$/)]]
  });

  group.get('year')?.valueChanges.subscribe(() => {
    const index = this.yearlyCostData.controls.indexOf(group);
    this.lastChangedIndex = index;
  });

  return group;
}

openYearPicker(picker: any): void {
  picker.open();
}

 
 selectYear(event: any, datepicker: any, currentIndex: number): void {
  let selectedYear: number;

  // Extract year value
  if (event && typeof event.year === 'function') {
    selectedYear = event.year();
  } else if (event instanceof Date) {
    selectedYear = event.getFullYear();
  } else {
    selectedYear = event;
  }

  const group = this.yearlyCostData.at(currentIndex);
  const yearControl = group.get('year');

  // Check for duplicate year
  const isDuplicate = this.yearlyCostData.controls.some((ctrl, i) => {
    if (i === currentIndex) return false;
    const value = ctrl.get('year')?.value;
    return value?.toString() === selectedYear.toString();
  });

  if (isDuplicate) {
    yearControl?.setValue(selectedYear.toString());
    yearControl?.setErrors({ duplicateYear: true });
    yearControl?.markAsTouched();
    datepicker.close();
    this.purchaseForm.updateValueAndValidity({ emitEvent: true });
    return;
  }

  // Valid year
  yearControl?.setValue(selectedYear.toString());
  yearControl?.setErrors(null);
  yearControl?.markAsTouched();
  yearControl?.updateValueAndValidity();
  setTimeout(() => datepicker.close(), 50);
}
 

  addYearCostGroup(): void {
    this.yearlyCostData.push(this.createYearCostGroup());
  }

  
  removeYearCostGroup(index: number): void {
  // Prevent removal if only one item is left
  if (this.yearlyCostData.length > 1) {
    this.yearlyCostData.removeAt(index);
  }
  }

 
 
  isDuplicateYear(currentIndex: number): boolean {
  const control = this.yearlyCostData.at(currentIndex).get('year');
  return !!control?.errors?.['duplicateYear'];
}


onNumberInput(event: any, formGroup: AbstractControl): void {
  const group = formGroup as FormGroup;
  let rawValue = event.target.value || '';

  // Remove commas and non-numeric chars
  rawValue = rawValue.replace(/,/g, '').replace(/[^0-9]/g, '');

  if (rawValue !== '') {
    const numberValue = Number(rawValue);
    // Update form control without re-triggering events
    group.get('cost')?.setValue(numberValue, { emitEvent: false });
    // Format number with commas for display
    event.target.value = this.formatNumberForDisplay(numberValue);
  } else {
    group.get('cost')?.setValue('', { emitEvent: false });
  }
}

private formatNumberForDisplay(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US'); // Add commas (e.g. 12,000)
}

private parseNumber(value: any): number {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, ''));
}




  onSubmit() {
    this.loading = true;
    this.purchaseForm.markAllAsTouched();

    if (this.purchaseForm.invalid) {
      this.loading = false;
      return;
    }

    const years = this.yearlyCostData.controls.map(x => x.value.year).join(',');
    // const costs = this.yearlyCostData.controls.map(x => x.value.cost).join(',');
const costs = this.yearlyCostData.controls
  .map(x => this.parseNumber(x.value.cost))
  .join(',');

    const payload = {
      ...this.purchaseForm.value,
      year: years,
      cost: costs
    };

    console.log('Final Payload:', payload);

    this.commonService.addData('purchase/add/', payload).subscribe(
      (response) => {
        this._snackBar.open(response.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/purchase']);
        }, 2000);
      },
      (error) => {
        console.error('An error occurred:', error);
        this.loading = false;
      }
    );
  }
 
}
