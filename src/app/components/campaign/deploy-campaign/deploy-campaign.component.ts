import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { ChannelCampaignModel, SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
@Component({
  selector: 'app-deploy-campaign',
  templateUrl: './deploy-campaign.component.html',
  styleUrls: ['./deploy-campaign.component.scss']
})
export class DeployCampaignComponent implements OnInit {
  @Output() nextStepEvent = new EventEmitter<boolean>();

  selectedChannels: ChannelCampaignModel[] = [];
  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(
    private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$selectedChannels.subscribe(result => this.selectedChannels = result);
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

}
