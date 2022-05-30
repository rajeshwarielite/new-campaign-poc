import { Component, OnInit } from '@angular/core';
import { SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-result-campaign',
  templateUrl: './result-campaign.component.html',
  styleUrls: ['./result-campaign.component.scss']
})
export class ResultCampaignComponent implements OnInit {
  //@ts-ignore
  saveCampaignModel: SaveCampaignModel = {};
  savedChannels: SaveChannelResponseModel[] = [];

  constructor(
    private newCampaignService: NewCampaignService
  ) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => {
      this.saveCampaignModel = result;
      this.newCampaignService.getCampaignChannels(this.saveCampaignModel.campaignId).subscribe(result => {
        if (Array.isArray(result)) {
          this.savedChannels = result;
        }
      });
    });
  }

  redeployChannel(channel: SaveChannelResponseModel) {
    const saveChannelRequestModel: SaveChannelRequestModel = {
      campaignId: channel.campaignId,
      includeInChannel: channel.includeInChannel,
      marketingChannelId: channel.marketingChannelId,
      marketingChannelName: channel.marketingChannelName,
      notificationName: channel.notificationName,
      orgId: channel.orgId,
      scheduleType: channel.scheduleType,
      content: channel.content,
      eventDriven: channel.eventDriven,
      eventThreshold: channel.eventThreshold,
      link: channel.link,
      notificationTime: channel.notificationTime,
      notificationTimeZone: channel.notificationTimeZone,
      scheduledDateTime: channel.scheduledDateTime
    }
    this.newCampaignService.updateChannel(saveChannelRequestModel).subscribe(result => {
      if (result as SaveChannelResponseModel) {
        channel = result;
      }
    });
  }
}
