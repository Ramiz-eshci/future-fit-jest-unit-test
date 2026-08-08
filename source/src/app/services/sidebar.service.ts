import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private toggleSidebarSource = new Subject<void>();
  toggleSidebar$ = this.toggleSidebarSource.asObservable();
  private closeSidebarSource = new Subject<void>();
  closeSidebar$ = this.closeSidebarSource.asObservable();
  toggleSidebar() {
    this.toggleSidebarSource.next();
  }
  closeSidebar() {
    this.closeSidebarSource.next(); // Notify listeners to close the sidebar
  }
}
