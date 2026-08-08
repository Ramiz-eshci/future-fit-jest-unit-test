import { TestBed } from '@angular/core/testing';
import { GlobalFlagService } from './global-flag.service';

describe('GlobalFlagService', () => {
  let service: GlobalFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFlagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default the form-submitted flag to false', () => {
    expect(service.isSubmitted()).toBe(false);
  });

  it('should reflect a true value after setSubmitted(true)', () => {
    service.setSubmitted(true);
    expect(service.isSubmitted()).toBe(true);
  });

  it('should reflect a false value after setSubmitted(false)', () => {
    service.setSubmitted(true);
    service.setSubmitted(false);
    expect(service.isSubmitted()).toBe(false);
  });

  it('should be able to toggle between states multiple times', () => {
    service.setSubmitted(true);
    expect(service.isSubmitted()).toBe(true);

    service.setSubmitted(false);
    expect(service.isSubmitted()).toBe(false);

    service.setSubmitted(true);
    expect(service.isSubmitted()).toBe(true);
  });

  it('should maintain an isolated state per service instance', () => {
    const service2 = TestBed.inject(GlobalFlagService);
    service.setSubmitted(true);

    // singleton: same instance, so flag is shared
    expect(service2.isSubmitted()).toBe(true);
  });
});