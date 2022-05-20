import { TestBed } from '@angular/core/testing';

import { NewCampaignService } from './new-campaign.service';

describe('NewCampaignService', () => {
  let service: NewCampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewCampaignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
