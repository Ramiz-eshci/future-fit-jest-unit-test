import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service'; // Adjust the import path as necessary
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(UserService); // Use Angular's inject function to get the service
  const router = inject(Router); // Use Angular's inject function to get the router
  // const isAuthenticated = authService.isLoggedIn(); // Check if user is logged in
  // console.log(route,'route')
  // console.log(state,'state')
  // Get route data
  // const module = route.data['module'] as string;
  // const permission = route.data['permission'] as string;

  // // Parse RoleID once
  // const RoleID:any = parseInt(localStorage.getItem('RoleID') || '0', 10);

  // console.log(RoleID,'RoleID ==== ')
  // console.log(permission,'permission ==== ')
  // console.log(module,'module ==== ')
  // console.log(authService.isLoggedIn,'authService.isLoggedIn ==== ')
  // console.log(router,'router')
  if (!authService.isLoggedIn && state.url != '/authentication/login') {
    const router = new Router(); // Ideally, inject this via constructor
    router.navigate(['/authentication/login']); // Redirect to login page if not authenticated
    return false; // Prevent access
  } else {
    if (authService.isLoggedIn && state.url === '/authentication/login') {
      // Redirect authenticated users away from login page
      router.navigate(['/dashboard']);
      return false; // Prevent access to login page
    }
    return true; // Allow access
    
  }
};
