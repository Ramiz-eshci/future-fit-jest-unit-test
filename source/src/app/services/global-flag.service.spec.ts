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
});
