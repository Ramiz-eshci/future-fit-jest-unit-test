import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonService } from 'src/app/services/common.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { UserService } from 'src/app/services/user.service';
import { ValidationService } from 'src/app/services/validation.service';
interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-tutorial-videos',
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
  templateUrl: './add-tutorial-videos.component.html',
  styleUrl: './add-tutorial-videos.component.scss'
})
export class AddTutorialVideosComponent {
  companyArr: Company[] = [];
  beFormList: any[] = [];
  @ViewChild('select') select: MatSelect;
  tutorialVideoForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  CompanyID: any;
  title: any = 'Users';
  selectedFile: File | null = null;
  errorMsg = '';

  allowedTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-matroska' // .mkv
  ];
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) {
    this.RoleID = this.userService.RoleID
    // this.RoleID = this.userService.RoleID
    this.CompanyID = this.userService.CompanyID


    this.tutorialVideoForm = this.formBuilder.group({
      VideoTitle: ['', [Validators.required]],
      // VideoType: ['', [Validators.required]],
      VideoURL: ['', [Validators.required, this.videoLinkValidator.bind(this)]],
      OrderBy: ['', [Validators.required, ValidationService.numberOnlyValidator]],
    });

  }
  videoLinkValidator(control: any) {
    const url = control.value;
    if (!url) return null;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    // const driveRegex = /^(https?:\/\/)?(drive\.google\.com)\//;

    // if (youtubeRegex.test(url) || driveRegex.test(url)) {
    if (youtubeRegex.test(url)) {
      return null;
    }
    return { invalidVideoLink: true };
  }

  onSubmit() {
    this.loading = true;

    this.tutorialVideoForm.controls['VideoTitle'].markAsTouched()
    // this.tutorialVideoForm.controls['VideoType'].markAsTouched()
    if (this.tutorialVideoForm.valid) {
      // if (!this.selectedFile) {
      //    this.loading = false;
      //   this._snackBar.open('Please select a video file.', '', {
      //     duration: 2000,
      //     verticalPosition: 'top',
      //     horizontalPosition: 'end',
      //     panelClass: ['customErrorClass']
      //   });
      //   return;
      // }
      const formData = new FormData();
      formData.append('VideoTitle', this.tutorialVideoForm.value.VideoTitle);
      // formData.append('VideoType', this.tutorialVideoForm.value.VideoType);
      formData.append('OrderBy', this.tutorialVideoForm.value.OrderBy);
      // formData.append('VideoURL', this.selectedFile);
      formData.append('VideoURL', this.tutorialVideoForm.value.VideoURL);

      this.commonService.addData('tutorial-videos/add/', formData).subscribe(
        response => {
          this._snackBar.open(response.message, '', {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['customSuccessClass']
          });
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/tutorial-videos']);
          }, 2000);
        },
        error => {
          this.loading = false;
          console.error('An error occurred:', error);
        }
      );


    }
  }

  onNumberInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    // Allow control keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow digits only
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.errorMsg = '';

    if (!file) return;

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMsg = 'Invalid file type. Only mp4, mov, avi, mkv allowed.';
      return;
    }

    // Optional size validation (100MB)
    if (file.size > 100 * 1024 * 1024) {
      this.errorMsg = 'File size must be less than 100MB.';
      return;
    }

    this.selectedFile = file;
    this.tutorialVideoForm.controls['VideoURL'].setValue(this.selectedFile);
  }
  resetAndChooseFile(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.selectedFile = null;
    this.tutorialVideoForm.controls['VideoURL'].setValue(null);
    this.errorMsg = '';
    fileInput.click();
  }

}
