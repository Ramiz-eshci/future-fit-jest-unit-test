import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-view-dose-history',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule,MaterialModule],
  templateUrl: './view-dose-history.component.html',
  styleUrl: './view-dose-history.component.scss'
})
export class ViewDoseHistoryComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewDoseHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    // console.log(this.data,'data')
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
