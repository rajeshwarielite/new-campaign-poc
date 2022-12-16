import { TestBed } from '@angular/core/testing';

import { RealTimeTrafficService } from './real-time-traffic.service';

describe('RealTimeTrafficService', () => {
  let service: RealTimeTrafficService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeTrafficService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
