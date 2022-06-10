import { TestBed } from '@angular/core/testing';

import { ExploreChartService } from './explore-chart.service';

describe('ExploreChartService', () => {
  let service: ExploreChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploreChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
