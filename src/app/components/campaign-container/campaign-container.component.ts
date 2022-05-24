import { Component, OnInit } from '@angular/core';
import { SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-campaign-container',
  templateUrl: './campaign-container.component.html',
  styleUrls: ['./campaign-container.component.scss']
})
export class CampaignContainerComponent implements OnInit {

  defineSelected: boolean = true;
  channelSelected: boolean = false;
  deploySelected: boolean = false;
  resultSelected: boolean = false;

  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

  defineTabSelected(): void {
    this.channelSelected = false;
  }

  channelTabSelected(): void {
    this.channelSelected = true;
  }

  setChannelStep(next: boolean) {
    this.channelSelected = next;
    if(next){
     this.defineSelected = false;
     this.deploySelected = false;
     this.resultSelected = false;
    }
  }

  setDeployStep(next: boolean) {
    this.deploySelected = next;
    if(next){
     this.defineSelected = false;
     this.channelSelected = false;
     this.resultSelected = false;
    }
  }

  setResultStep(next: boolean) {
    this.resultSelected = next;
    if(next){
     this.defineSelected = false;
     this.deploySelected = false;
     this.channelSelected = false;
    }
  }

}
