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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
declare var webkitSpeechRecognition: any;


interface Videos {
  title: string;
  video_url: string;
  thumbnail: string;
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

  templateUrl: './video-library.component.html',
  styleUrl: './video-library.component.scss'
})

export class VideoLibraryComponent {

  selectedVideo: any = null;
  safeVideoUrl!: SafeResourceUrl;
  videos: Videos[] = [];

  recognition: any;
  text = '';


  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {

    this.commonService.getData('tutorial-videos/getAllvideos').subscribe((response) => {
      if (response.status === true) {
        this.prepareVideos(response.data);
      }
    });

    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.text = transcript;
    };

  }
  startListening() {
    this.recognition.start();
  }

  stopListening() {
    this.recognition.stop();
  }
  prepareVideos(videoList: any[]) {
    this.videos = videoList.map(video => ({
      ...video,
      thumbnail: this.getThumbnail(video)
    }));
  }
  getThumbnail(video: any): string {
    if (video.video_type === 'YOUTUBE') {
      const id = this.getYoutubeVideoId(video.video_url);
      console.log(id, 'video id')
      return id
        ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        : 'assets/images/no-thumbnail.png';
    }

    if (video.video_type === 'GDRIVE') {
      // return 'assets/images/drive-thumbnail.png';
      console.log(this.getDriveThumbnail(video.video_url), 'thumb url')
      return this.getDriveThumbnail(video.video_url);
    }

    return 'assets/images/no-thumbnail.png';
  }
  getDriveThumbnail(url: string): string {
    const fileId = this.getDriveFileId(url);
    console.log(url, 'url')
    console.log(fileId, 'filedID')
    return fileId
      ? `https://lh3.googleusercontent.com/d/${fileId}=w640`
      : 'assets/no-thumbnail.png';
  }
  getDriveFileId(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,   // /file/d/ID/
      /id=([a-zA-Z0-9_-]+)/,           // open?id=ID
      /\/d\/([a-zA-Z0-9_-]+)/          // /d/ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
  // getYoutubeVideoId(url: string): string | null {
  //   if (!url) return null;

  //   const regExp =
  //     /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  //   const match = url.match(regExp);
  //   return match ? match[1] : null;
  // }
  // openVideo(video: any) {
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
  //   }else{
  //      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  //     video.video_url
  //   );
  //   }
  //   // else if (video.video_type === 'GDRIVE') {
  //   //   this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  //   //     video.video_url.replace('/view', '/preview')
  //   //   );
  //   // }
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
