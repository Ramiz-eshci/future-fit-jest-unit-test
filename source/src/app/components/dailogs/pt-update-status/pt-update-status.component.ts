import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter'; // Use moment adapter


export const MY_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'MMM DD, YYYY', // Example format Oct 02, 2024
  },
  display: {
    dateInput: 'MMM DD, YYYY', // Adjust this format as needed
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
interface Status {
  status_id: string;
  status_name: string;
}
@Component({
  selector: 'app-pt-update-status',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule,MaterialModule],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
  
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  templateUrl: './pt-update-status.component.html',
  styleUrl: './pt-update-status.component.scss'
})

export class PtUpdateStatusComponent {
  form: FormGroup;
  selectedStatus: number = 0;
  status: Status[] = [];
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PtUpdateStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public commonService: CommonService
  ) {
    // console.log('response p =>', this.data);
    this.selectedStatus = Number(this.data.status_id);
    this.commonService.getData('status').subscribe((response) => {
      // console.log('response p =>', response.status);
      if (response.status === true) {
        this.status = response.data
      }
    });
  }

  ngOnInit(): void {
    // console.log(this.data.next_reading_date_form,'this.data.next_reading_date_form')
    this.form = this.fb.group({
      status_id: [this.selectedStatus, [Validators.required]],
      next_pt_reading_date: [this.data.next_reading_date_form],
    });
  }
  onSubmit(): void {
    if (this.form.valid) {
      this.form.controls['status_id'].setValue(this.selectedStatus)
      this.dialogRef.close(this.form.value); // Pass form values on close
    }
  }
  onClose(): void {
    this.dialogRef.close();
  }
}
