import { Component, OnInit, ViewChild } from '@angular/core';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Subject } from 'rxjs';
import { SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { ChannelCampaignComponent } from '../campaign/channel-campaign/channel-campaign.component';
import { DefineCampaignComponent } from '../campaign/define-campaign/define-campaign.component';
import { ActiveTab } from './active-tab.enum';

@Component({
  selector: 'app-campaign-container',
  templateUrl: './campaign-container.component.html',
  styleUrls: ['./campaign-container.component.scss']
})
export class CampaignContainerComponent implements OnInit {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent = TabsetComponent.prototype;
  @ViewChild('defineCampaign', { static: false }) defineCampaignComponent: DefineCampaignComponent = DefineCampaignComponent.prototype;
  @ViewChild('channelCampaign', { static: false }) channelCampaignComponent: ChannelCampaignComponent = ChannelCampaignComponent.prototype;

  activeTab = ActiveTab.Define;
  prevTab = ActiveTab.Define;

  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

  disableAllTabs(): void {
    /* this.staticTabs.tabs.forEach(tab => {
      tab.disabled = true;
      tab.active = false;
    }); */
  }

  setDefineStep(next?: boolean) {
    this.prevTab = this.activeTab;
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Channel;
      this.staticTabs.tabs[1].disabled = false;
      this.staticTabs.tabs[2].disabled = true;
      this.staticTabs.tabs[1].active = true;
      this.staticTabs.tabs[0].customClass = 'done';
    }
    else if (next === false) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Define;
      this.staticTabs.tabs[0].disabled = false;
      this.staticTabs.tabs[0].active = true;
      this.staticTabs.tabs[1].customClass = '';
      this.staticTabs.tabs[1].disabled = true;
      this.staticTabs.tabs[2].disabled = true;
    }
  }

  setChannelStep(next?: boolean) {
    this.prevTab = this.activeTab;
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Deploy;
      // this.staticTabs.tabs[0].disabled = false;
      // this.staticTabs.tabs[1].disabled = false;
      this.staticTabs.tabs[2].disabled = false;
      this.staticTabs.tabs[2].active = true;
      this.staticTabs.tabs[1].customClass = 'done';
    }
    else if (next === false) {
      this.setDefineStep(false);
    }
  }

  setDeployStep(next?: boolean) {
    this.prevTab = this.activeTab;
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Result;
      this.staticTabs.tabs[0].disabled = true;
      this.staticTabs.tabs[1].disabled = true;
      this.staticTabs.tabs[2].disabled = true;
      this.staticTabs.tabs[3].disabled = false;
      this.staticTabs.tabs[3].active = true;
      this.staticTabs.tabs[2].customClass = 'done';
    }
    else if (next === false) {
      this.setDefineStep(true);
    }
  }

  setResultStep() {
    this.setChannelStep(true);
  }

  channelSelected(event: TabDirective): void {
    console.log(event);
    if (this.prevTab === ActiveTab.Define) {
      if (this.defineCampaignComponent.defineFormGroup.valid) {
        //this.defineCampaignComponent.saveCampaignClick(true);
      }
    } else {
      this.setDefineStep(true);
    }
  }

  defineSelected(event: any): void {
    console.log(event);
    this.setDefineStep(false);
  }

  deploySelected(event: any): void {
    console.log(event);
    if (this.prevTab === ActiveTab.Channel || this.activeTab === ActiveTab.Channel) {
      if (this.channelCampaignComponent.formValid) {
        this.channelCampaignComponent.setSelectedChannels(true);
      }
    }
    else {
      this.setChannelStep(true);
    }
  }

}
