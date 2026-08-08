import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserService } from '../services/user.service';

describe('authGuard', () => {
  let userServiceSpy: { isLoggedIn: boolean };
  let routerSpy: { navigate: jest.Mock };

  const route = {} as ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => authGuard(route, state)) as unknown as boolean;
  }

  beforeEach(() => {
    localStorage.clear();
    userServiceSpy = { isLoggedIn: false };
    routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('should allow access when user is logged in and on a non-login route', () => {
    userServiceSpy.isLoggedIn = true;
    expect(runGuard()).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when not logged in and not on the login route', () => {
    userServiceSpy.isLoggedIn = false;
    state = { url: '/dashboard' } as RouterStateSnapshot;

    expect(runGuard()).toBe(false);
  });

  it('should allow access to the login route when not logged in', () => {
    userServiceSpy.isLoggedIn = false;
    state = { url: '/authentication/login' } as RouterStateSnapshot;

    expect(runGuard()).toBe(true);
  });

  it('should redirect logged-in users away from the login page and deny access', () => {
    userServiceSpy.isLoggedIn = true;
    state = { url: '/authentication/login' } as RouterStateSnapshot;

    expect(runGuard()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});