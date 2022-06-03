import { TestBed } from '@angular/core/testing';

import { ChartCampaignService } from './chart-campaign.service';

describe('ChartCampaignService', () => {
  let service: ChartCampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartCampaignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
