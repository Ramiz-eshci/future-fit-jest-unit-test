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

@Component({
  selector: 'app-view-pt-history',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule,MaterialModule],
  
  templateUrl: './view-pt-history.component.html',
  styleUrl: './view-pt-history.component.scss'
})
export class ViewPtHistoryComponent {
 
  constructor(
    public dialogRef: MatDialogRef<ViewPtHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    console.log(this.data,'data')
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
