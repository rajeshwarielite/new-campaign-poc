import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelCampaignComponent } from './channel-campaign.component';

describe('ChannelCampaignComponent', () => {
  let component: ChannelCampaignComponent;
  let fixture: ComponentFixture<ChannelCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChannelCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
