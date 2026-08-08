import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationEnd, NavigationStart, Event } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NavService } from './nav.service';

describe('NavService', () => {
  let service: NavService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let events$: BehaviorSubject<Event | null>;

  beforeEach(() => {
    events$ = new BehaviorSubject<Event | null>(null);

    TestBed.configureTestingModule({
      providers: [
        NavService,
        { provide: Router, useValue: { events: events$ } },
      ],
    });

    service = TestBed.inject(NavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default showClass to false', () => {
    expect(service.showClass).toBe(false);
  });

  it('should expose currentUrl as a BehaviorSubject', () => {
    expect(service.currentUrl).toBeInstanceOf(BehaviorSubject);
  });

  it('should initially have undefined currentUrl value', () => {
    expect(service.currentUrl.getValue()).toBeUndefined();
  });

  it('should update currentUrl on NavigationEnd event', (done) => {
    service.currentUrl.subscribe((url: string | undefined) => {
      if (url) {
        expect(url).toBe('/dashboard');
        done();
      }
    });

    events$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
  });

  it('should NOT update currentUrl on non-NavigationEnd events', () => {
    const urlSpy = jest.spyOn(service.currentUrl, 'next');
    events$.next(new NavigationStart(1, '/dashboard'));

    expect(urlSpy).not.toHaveBeenCalled();
  });

  it('should keep emitting latest value to late subscribers (cached value)', () => {
    events$.next(new NavigationEnd(1, '/home', '/home'));

    let received: string | undefined;
    service.currentUrl.subscribe((url) => (received = url));

    expect(received).toBe('/home');
  });
});