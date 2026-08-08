import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { APP_TEST_PROVIDERS, mockCommonService } from 'src/app/testing/test-helpers';

import { VideoLibraryComponent } from './video-library.component';

class MockSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: any = null;
  start = jest.fn();
  stop = jest.fn();
}

describe('VideoLibraryComponent', () => {
  let component: VideoLibraryComponent;
  let fixture: ComponentFixture<VideoLibraryComponent>;

  beforeEach(async () => {
    (globalThis as any).webkitSpeechRecognition = MockSpeechRecognition;
    mockCommonService.getData.mockClear();

    await TestBed.configureTestingModule({
      imports: [VideoLibraryComponent],

      providers: [
        provideNoopAnimations(),
        ...APP_TEST_PROVIDERS,
        { provide: CommonService, useValue: mockCommonService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request the video list on construction', () => {
    expect(mockCommonService.getData).toHaveBeenCalledWith('tutorial-videos/getAllvideos');
  });

  it('should prepare videos with youtube thumbnails', () => {
    const video = {
      id: 1,
      title: 'Intro',
      video_url: 'https://www.youtube.com/watch?v=abcdefghijk',
      video_type: 'YOUTUBE',
    };
    component.prepareVideos([video]);
    expect(component.videos.length).toBe(1);
    expect(component.videos[0].thumbnail).toBe('https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg');
  });

  it('should fall back to a placeholder thumbnail for unknown types', () => {
    component.prepareVideos([{ id: 1, title: 'File', video_url: 'local.mp4', video_type: 'FILE' }]);
    expect(component.videos[0].thumbnail).toBe('assets/images/no-thumbnail.png');
  });

  it('should set a safe embed url when opening a youtube video', () => {
    const video = { title: 'Intro', video_url: 'https://www.youtube.com/watch?v=abcdefghijk', video_type: 'YOUTUBE' };
    component.openVideo(video);
    expect(component.selectedVideo).toBe(video);
    expect(component.safeVideoUrl).toBeDefined();
  });

  it('should clear the selected video when closing the modal', () => {
    component.selectedVideo = { title: 'Intro' };
    component.closeVideo();
    expect(component.selectedVideo).toBeNull();
  });
});