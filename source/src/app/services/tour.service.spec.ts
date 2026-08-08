import { TestBed } from '@angular/core/testing';
import { TourService } from './tour.service';

describe('TourService', () => {
  let service: TourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose startTour$ as an observable', () => {
    expect(service.startTour$).toBeDefined();
  });

  it('should not emit before triggerTour() is called', () => {
    const spy = jest.fn();
    service.startTour$.subscribe(spy);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit once per triggerTour() call', (done) => {
    const spy = jest.fn();
    service.startTour$.subscribe(spy);

    service.triggerTour();
    service.triggerTour();

    setTimeout(() => {
      expect(spy).toHaveBeenCalledTimes(2);
      done();
    }, 0);
  });

  it('should deliver the tour event to subscribers', (done) => {
    let received = false;

    service.startTour$.subscribe(() => {
      received = true;
      expect(received).toBe(true);
      done();
    });

    service.triggerTour();
  });
});