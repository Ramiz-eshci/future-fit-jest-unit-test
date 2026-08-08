import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose toggleSidebar$ as an observable', () => {
    expect(service.toggleSidebar$).toBeDefined();
  });

  it('should expose closeSidebar$ as an observable', () => {
    expect(service.closeSidebar$).toBeDefined();
  });

  it('should emit on toggleSidebar$ when toggleSidebar() is called', (done) => {
    service.toggleSidebar$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    service.toggleSidebar();
  });

  it('should emit on closeSidebar$ when closeSidebar() is called', (done) => {
    service.closeSidebar$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    service.closeSidebar();
  });

  it('should NOT emit closeSidebar$ when toggleSidebar() is called', () => {
    const closeSpy = jest.fn();
    const toggleSpy = jest.fn();

    service.closeSidebar$.subscribe(closeSpy);
    service.toggleSidebar$.subscribe(toggleSpy);

    service.toggleSidebar();

    expect(toggleSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should NOT emit toggleSidebar$ when closeSidebar() is called', () => {
    const closeSpy = jest.fn();
    const toggleSpy = jest.fn();

    service.closeSidebar$.subscribe(closeSpy);
    service.toggleSidebar$.subscribe(toggleSpy);

    service.closeSidebar();

    expect(closeSpy).toHaveBeenCalled();
    expect(toggleSpy).not.toHaveBeenCalled();
  });

  it('should emit a single notification without a payload (void)', (done) => {
    let calls = 0;

    service.toggleSidebar$.subscribe(() => {
      calls += 1;
    });

    service.toggleSidebar();

    // Simulate completion of the micro-task queue
    setTimeout(() => {
      expect(calls).toBe(1);
      done();
    }, 0);
  });
});