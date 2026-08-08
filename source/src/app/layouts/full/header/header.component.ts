import {
  AfterViewInit,
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'src/app/services/user.service';
import { SidebarService } from 'src/app/services/sidebar.service';
import { TourService } from 'src/app/services/tour.service';
import introJs from 'intro.js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgScrollbarModule, MaterialModule, MatButtonModule],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent implements AfterViewInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  userName: any = '';
  userEmail: any = '';
  isLoggedin: boolean = false;
  RoleID: any = 1;
profilePic: any = '/assets/images/profile/user-1.jpg';
  constructor(private userService: UserService,
    private sidebarService: SidebarService,
    private tourService: TourService
  ) {
    this.RoleID = this.userService.RoleID;
    this.isLoggedin = this.userService.isLoggedIn;
    const storedPic = localStorage.getItem('profile_pic');
    console.log(storedPic,'----profile Pic')
    if (storedPic) {
     this.profilePic = storedPic;
 
  
    }
   else {
    this.profilePic = '/assets/images/profile/user-1.jpg';  
    }
    this.sidebarService.toggleSidebar$.subscribe(() => {
      this.toggleMobileNav.emit(); // Emit the event to toggle sidebar
    });
    if (this.isLoggedin) {
      this.userName = localStorage.getItem('UserName')
      this.userEmail = localStorage.getItem('Email')
    }
  }
  onStartTourClick() {
    this.tourService.triggerTour();
  }

  ngAfterViewInit() {
   
  }


  logout() {
    // this.userService.oldWebsiteLogout();
    this.userService.logout();
  }

  prestartTour() {
    const intro = introJs();

    intro.setOptions({
      steps: [
        // {
        //   intro: 'Welcome to Future Fit! Let’s take a quick tour.'
        // },
        {
          element: document.querySelector('#tour-button1') as HTMLElement,
          intro: 'Click here to get started',
        },
        
      ],
      // showProgress: true,
      showBullets: false,
      tooltipPosition: 'auto',
      // scrollToElement: true,
      disableInteraction: true,
      
    });

    intro.start();
  }
}
