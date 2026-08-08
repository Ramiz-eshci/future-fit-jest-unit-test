import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private startTourSubject = new Subject<void>();
  startTour$ = this.startTourSubject.asObservable();

  triggerTour() {
    this.startTourSubject.next();
  }

  constructor() { }
}
