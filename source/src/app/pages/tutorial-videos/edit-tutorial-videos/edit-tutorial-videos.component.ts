import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-edit-tutorial-videos',
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
  templateUrl: './edit-tutorial-videos.component.html',
  styleUrl: './edit-tutorial-videos.component.scss'
})
export class EditTutorialVideosComponent {
  companyArr: Company[] = [];
  @ViewChild('select') select: MatSelect;
  tutorialVideoForm: any;
  loading: boolean = false;
  RoleID: any = 1;
  beFormList: any[] = [];
  selectedGoals: number[] = [];
  CompanyID: any;
  title: any = 'Tutorial Videos';
  routeId: string | null = null;
  selectedFile: File | null = null;
  errorMsg = '';
  noChange: boolean = true;
  EditValues: any = []

  selectedVideo: any = null;
  safeVideoUrl!: SafeResourceUrl;
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
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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

    this.route.paramMap.subscribe(params => {
      this.routeId = params.get('id');
    });
    //   ;
    console.log(this.routeId, 'routerId');
    this.commonService.getData('tutorial-videos/getById/' + this.routeId).subscribe((response) => {
      console.log('response p =>', response.status);
      if (response.status === true) {
        const user = response.data[0];
        this.EditValues = response.data[0];
        this.EditValues.thumbnail = this.getThumbnail(user);
        this.tutorialVideoForm.controls['VideoTitle'].setValue(response.data[0].title)
        // this.tutorialVideoForm.controls['VideoType'].setValue(response.data[0].video_type)
        this.tutorialVideoForm.controls['VideoURL'].setValue(response.data[0].video_url)
        this.tutorialVideoForm.controls['OrderBy'].setValue(response.data[0].order_by)


      }
    }, (error) => {
      this._snackBar.open('Video Not Found', '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['customClass']
      });
      setTimeout(() => {
        this.router.navigate(['/tutorial-videos']);
      }, 2000);
    });
  }
  getThumbnail(video: any): string {
    if (video.video_type === 'YOUTUBE') {
      const id = this.getYoutubeVideoId(video.video_url);
      console.log(id, 'video id')
      return id
        ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        : 'assets/images/no-thumbnail.png';
    }
    return 'assets/images/no-thumbnail.png';
  }
  videoLinkValidator(control: any) {
    const url = control.value;
    if (!url) return null;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    const driveRegex = /^(https?:\/\/)?(drive\.google\.com)\//;

    if (youtubeRegex.test(url) || driveRegex.test(url)) {
      return null;
    }
    return { invalidVideoLink: true };
  }


  onSubmit() {
    this.loading = true;



    this.tutorialVideoForm.controls['VideoTitle'].markAsTouched()
    // this.tutorialVideoForm.controls['VideoType'].markAsTouched()
    this.tutorialVideoForm.controls['VideoURL'].markAsTouched()

    if (this.tutorialVideoForm.valid) {
      if (!this.tutorialVideoForm.dirty) {
        this._snackBar.open('No changes made.', '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/tutorial-videos']);
        }, 2000);
        this.loading = false;
        return;
      }
      const formData = new FormData();
      formData.append('VideoTitle', this.tutorialVideoForm.value.VideoTitle);
      // formData.append('VideoType', this.tutorialVideoForm.value.VideoType);
      formData.append('OrderBy', this.tutorialVideoForm.value.OrderBy);
      formData.append('VideoURL', this.tutorialVideoForm.value.VideoURL);
      // if (this.selectedFile) {
      //   formData.append('VideoURL', this.selectedFile);
      // }
      this.commonService.addData('tutorial-videos/edit/' + this.routeId, formData).subscribe(
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
    this.noChange = false;
    this.tutorialVideoForm.controls['VideoURL'].setValue(this.selectedFile);
  }
  resetAndChooseFile(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.selectedFile = null;
    this.tutorialVideoForm.controls['VideoURL'].setValue(null);
    this.errorMsg = '';
    fileInput.click();
  }
  // openVideo(video: any) {
  //   console.log(video, 'video')
  //   this.selectedVideo = video;
  //   // this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  //   //   video.video_url
  //   // );
  //   // this.safeVideoUrl = `${environment.apiHost}tutorial-videos/stream/${video.video_name}`;
  //   if (video.video_type === 'YOUTUBE') {
  //     const videoId = this.getYoutubeVideoId(video.video_url);

  //     const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
  //     this.safeVideoUrl =
  //       this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  //   }
  //   else if (video.video_type === 'GDRIVE') {
  //     this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  //       video.video_url.replace('/view', '/preview')
  //     );
  //   }
  // }
  openVideo(video: any): void {
    console.log(video, 'video');

    this.selectedVideo = video;
    // this.safeVideoUrl = null;

    if (!video?.video_type || !video?.video_url) {
      console.error('Invalid video data');
      return;
    }

    if (video.video_type === 'YOUTUBE') {
      const videoId = this.getYoutubeVideoId(video.video_url);

      // YouTube video IDs are exactly 11 characters
      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        console.error('Invalid YouTube video URL');
        return;
      }

      const embedUrl =
        `https://www.youtube.com/embed/${videoId}` +
        `?rel=0&modestbranding=1&controls=1`;

      this.safeVideoUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);

    } else if (video.video_type === 'GDRIVE') {
      const fileId = this.getGoogleDriveFileId(video.video_url);

      if (!fileId) {
        console.error('Invalid Google Drive video URL');
        return;
      }

      const previewUrl =
        `https://drive.google.com/file/d/${fileId}/preview`;

      this.safeVideoUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);

    } else {
      console.error('Unsupported video type:', video.video_type);
    }
  }

  // getYoutubeVideoId(url: string): string | null {
  //   if (!url) return null;

  //   const regExp =
  //     /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  //   const match = url.match(regExp);
  //   return match ? match[1] : null;
  // }
  closeVideo() {
    this.selectedVideo = null;
  }
  private getYoutubeVideoId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Only allow trusted YouTube hosts
      if (
        hostname !== 'youtube.com' &&
        hostname !== 'www.youtube.com' &&
        hostname !== 'm.youtube.com' &&
        hostname !== 'youtu.be' &&
        hostname !== 'www.youtu.be'
      ) {
        return null;
      }

      if (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be'
      ) {
        return parsedUrl.pathname.substring(1);
      }

      return parsedUrl.searchParams.get('v');
    } catch {
      return null;
    }
  }
  private getGoogleDriveFileId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Only allow Google Drive
      if (
        hostname !== 'drive.google.com' &&
        hostname !== 'www.drive.google.com'
      ) {
        return null;
      }

      const match = parsedUrl.pathname.match(
        /^\/file\/d\/([a-zA-Z0-9_-]+)\/(?:view|preview)$/
      );

      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

}

