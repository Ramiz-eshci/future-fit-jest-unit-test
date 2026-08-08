import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CanDeactivateGuard, CanComponentDeactivate } from './can-deactivate.guard';

describe('CanDeactivateGuard', () => {
  let guard: CanDeactivateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateGuard],
    });
    guard = TestBed.inject(CanDeactivateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation when component has no canDeactivate method', () => {
    const component = {} as CanComponentDeactivate;
    expect(guard.canDeactivate(component)).toBe(true);
  });

  it('should call the component canDeactivate returning true', () => {
    const component: CanComponentDeactivate = {
      canDeactivate: jest.fn().mockReturnValue(true),
    };

    const result = guard.canDeactivate(component);

    expect(component.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should call the component canDeactivate returning false', () => {
    const component: CanComponentDeactivate = {
      canDeactivate: jest.fn().mockReturnValue(false),
    };

    const result = guard.canDeactivate(component);

    expect(component.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should support promise-based canDeactivate', async () => {
    const component: CanComponentDeactivate = {
      canDeactivate: jest.fn().mockResolvedValue(true),
    };

    const result = guard.canDeactivate(component) as Promise<boolean>;

    await expect(result).resolves.toBe(true);
  });

  it('should support observable-based canDeactivate', (done) => {
    const component: CanComponentDeactivate = {
      canDeactivate: () => of(true),
    };

    guard.canDeactivate(component) as Promise<boolean>;
    const result = guard.canDeactivate(component) as { subscribe: (cb: (v: boolean) => void) => void };

    result.subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });
});