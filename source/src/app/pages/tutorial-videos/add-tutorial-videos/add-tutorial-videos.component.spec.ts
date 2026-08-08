import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_TEST_PROVIDERS, mockCommonService, mockSnackBar } from 'src/app/testing/test-helpers';

import { AddTutorialVideosComponent } from './add-tutorial-videos.component';

describe('AddTutorialVideosComponent', () => {
  let component: AddTutorialVideosComponent;
  let fixture: ComponentFixture<AddTutorialVideosComponent>;

  beforeEach(async () => {
    mockCommonService.addData.mockClear();
    mockSnackBar.open.mockClear();

    await TestBed.configureTestingModule({
      imports: [AddTutorialVideosComponent],

      providers: [provideNoopAnimations(), ...APP_TEST_PROVIDERS],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTutorialVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the tutorial video form with required controls', () => {
    const form = component.tutorialVideoForm;
    expect(form.contains('VideoTitle')).toBe(true);
    expect(form.contains('VideoURL')).toBe(true);
    expect(form.contains('OrderBy')).toBe(true);

    const title = form.controls['VideoTitle'];
    expect(title.errors?.['required']).toBe(true);
  });

  it('should reject a video url that is not a valid link', () => {
    const valid = component.videoLinkValidator({ value: 'https://www.youtube.com/watch?v=abcdefghijk' });
    expect(valid).toBeNull();

    const invalid = component.videoLinkValidator({ value: 'https://www.example.com/video' });
    expect(invalid).toEqual({ invalidVideoLink: true });
  });

  it('should only allow numeric values in the order field', () => {
    const control = component.tutorialVideoForm.controls['OrderBy'];
    control.setValue('42');
    expect(control.valid).toBe(true);

    control.setValue('abc');
    expect(control.errors?.['invalidNumber']).toBe(true);
  });

  it('should submit a valid form through the add endpoint', () => {
    component.tutorialVideoForm.controls['VideoTitle'].setValue('Intro');
    component.tutorialVideoForm.controls['VideoURL'].setValue('https://www.youtube.com/watch?v=abcdefghijk');
    component.tutorialVideoForm.controls['OrderBy'].setValue('5');

    component.onSubmit();

    expect(component.loading).toBe(true);
    expect(mockCommonService.addData).toHaveBeenCalledWith(
      'tutorial-videos/add/',
      expect.any(FormData)
    );
  });

  it('should not submit an invalid form', () => {
    component.onSubmit();
    expect(mockCommonService.addData).not.toHaveBeenCalled();
  });

  it('should prevent non-numeric keys in the order input', () => {
    const event = { key: 'a', preventDefault: jest.fn() } as unknown as KeyboardEvent;
    component.onNumberInput(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});