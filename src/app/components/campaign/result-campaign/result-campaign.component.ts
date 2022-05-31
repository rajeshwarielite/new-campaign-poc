import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-result-campaign',
  templateUrl: './result-campaign.component.html',
  styleUrls: ['./result-campaign.component.scss']
})
export class ResultCampaignComponent implements OnInit {
  modalRef?: BsModalRef;
  //@ts-ignore
  saveCampaignModel: SaveCampaignModel = {};
  savedChannels: SaveChannelResponseModel[] = [];
  //@ts-ignore
  deployChannel: SaveChannelResponseModel;

  constructor(private modalService: BsModalService,
    private newCampaignService: NewCampaignService
  ) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => {
      this.saveCampaignModel = result;
      if (result.channels && result.channels.length > 0) {
        this.newCampaignService.getCampaignChannels(this.saveCampaignModel.campaignId).subscribe(result => {
          if (Array.isArray(result)) {
            this.savedChannels = result;
          }
        });
      }
    });
  }

  openRedeployModal(channel: SaveChannelResponseModel, template: TemplateRef<any>): void {
    this.deployChannel = channel;
    this.modalRef = this.modalService.show(template);
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
    };
    this.newCampaignService.updateChannel(saveChannelRequestModel).subscribe(result => {
      this.modalRef?.hide();
      if (result as SaveChannelResponseModel) {
        channel = result;
      }
    });
  }
}
