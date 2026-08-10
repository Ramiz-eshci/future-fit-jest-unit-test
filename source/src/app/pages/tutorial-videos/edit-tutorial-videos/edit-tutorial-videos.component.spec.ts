import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { APP_TEST_PROVIDERS, mockCommonService, mockSnackBar, mockRouter } from 'src/app/testing/test-helpers';
import { EditTutorialVideosComponent } from './edit-tutorial-videos.component';

describe('EditTutorialVideosComponent', () => {
  let component: EditTutorialVideosComponent;
  let fixture: ComponentFixture<EditTutorialVideosComponent>;

  beforeEach(async () => {
    mockCommonService.getData.mockReturnValue(
      of({
        status: true,
        data: [
          {
            title: 'Intro',
            video_type: 'YOUTUBE',
            video_url: 'https://www.youtube.com/watch?v=abc123def45',
            order_by: 1,
          },
        ],
      }) as any
    );

    await TestBed.configureTestingModule({
      imports: [EditTutorialVideosComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    jest.clearAllMocks();
    mockCommonService.getData.mockReturnValue(
      of({
        status: true,
        data: [
          {
            title: 'Intro',
            video_type: 'YOUTUBE',
            video_url: 'https://www.youtube.com/watch?v=abc123def45',
            order_by: 1,
          },
        ],
      }) as any
    );

    fixture = TestBed.createComponent(EditTutorialVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the tutorial video form with validators', () => {
    expect(component.tutorialVideoForm.contains('VideoTitle')).toBe(true);
    expect(component.tutorialVideoForm.contains('VideoURL')).toBe(true);
    expect(component.tutorialVideoForm.contains('OrderBy')).toBe(true);
  });

  it('should load the existing video data and pre-fill the form', () => {
    expect(component.EditValues.title).toBe('Intro');
    expect(component.tutorialVideoForm.get('VideoTitle')?.value).toBe('Intro');
    expect(component.tutorialVideoForm.get('OrderBy')?.value).toBe(1);
  });

  it('should return a YouTube thumbnail for youtube videos', () => {
    const url = component.getThumbnail({
      video_type: 'YOUTUBE',
      video_url: 'https://www.youtube.com/watch?v=abc123def45',
    });
    expect(url).toContain('img.youtube.com');
  });

  it('should return the no-thumbnail placeholder for non-youtube videos', () => {
    const url = component.getThumbnail({ video_type: 'MP4', video_url: 'x.mp4' });
    expect(url).toContain('no-thumbnail.png');
  });

  it('videoLinkValidator should accept youtube and drive links', () => {
    expect(component.videoLinkValidator({ value: 'https://youtube.com/watch?v=abc123def45' })).toBeNull();
    expect(component.videoLinkValidator({ value: 'https://drive.google.com/file/d/xyz' })).toBeNull();
  });

  it('videoLinkValidator should reject unsupported links', () => {
    expect(component.videoLinkValidator({ value: 'https://example.com/x' })).toEqual({
      invalidVideoLink: true,
    });
  });

  it('onSubmit should mark fields touched and submit a valid form', () => {
    component.tutorialVideoForm.get('VideoTitle')?.setValue('Intro');
    component.tutorialVideoForm.get('VideoURL')?.setValue('https://youtube.com/watch?v=abc123def45');
    component.tutorialVideoForm.get('OrderBy')?.setValue('1');
    component.tutorialVideoForm.markAsDirty();

    component.onSubmit();

    expect(component.tutorialVideoForm.get('VideoTitle')?.touched).toBe(true);
    expect(mockCommonService.addData).toHaveBeenCalledWith('tutorial-videos/edit/1', expect.any(FormData));
  });

  it('onNumberInput should prevent non-digit characters', () => {
    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    component.onNumberInput(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('onFileSelected should reject an invalid file type', () => {
    const event = {
      target: { files: [{ type: 'text/plain', size: 10 }] },
    };
    component.onFileSelected(event);
    expect(component.errorMsg).toContain('Invalid file type');
  });

  it('openVideo should open a youtube video into a safe URL', () => {
    component.openVideo({ video_type: 'YOUTUBE', video_url: 'https://www.youtube.com/watch?v=abc123def45' });
    expect(component.selectedVideo).toBeTruthy();
    expect(component.safeVideoUrl).toBeTruthy();
  });

  it('closeVideo should clear the selected video', () => {
    component.selectedVideo = { video_type: 'YOUTUBE' };
    component.closeVideo();
    expect(component.selectedVideo).toBeNull();
  });
});