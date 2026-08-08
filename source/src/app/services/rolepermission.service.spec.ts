import { TestBed } from '@angular/core/testing';

import { RolepermissionService } from './rolepermission.service';

describe('RolepermissionService', () => {
  let service: RolepermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolepermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
