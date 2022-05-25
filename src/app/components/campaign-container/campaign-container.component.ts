import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { ActiveTab } from './active-tab.enum';

@Component({
  selector: 'app-campaign-container',
  templateUrl: './campaign-container.component.html',
  styleUrls: ['./campaign-container.component.scss']
})
export class CampaignContainerComponent implements OnInit {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent = TabsetComponent.prototype;

  activeTab = ActiveTab.Define;

  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

  disableAllTabs(): void {
    this.staticTabs.tabs.forEach(tab => {
      tab.disabled = true;
      tab.active = false;
    });
  }

  setDefineStep(next?: boolean) {
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Channel;
      // this.staticTabs.tabs[0].disabled = false;
      this.staticTabs.tabs[1].disabled = false;
      this.staticTabs.tabs[1].active = true;
    }
    else if (next === false) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Define;
      this.staticTabs.tabs[0].disabled = false;
      this.staticTabs.tabs[0].active = true;
    }
  }

  setChannelStep(next?: boolean) {
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Deploy;
      // this.staticTabs.tabs[0].disabled = false;
      // this.staticTabs.tabs[1].disabled = false;
      this.staticTabs.tabs[2].disabled = false;
      this.staticTabs.tabs[2].active = true;
    }
    else if (next === false) {
      this.setDefineStep(false);
    }
  }

  setDeployStep(next?: boolean) {
    if (next) {
      this.disableAllTabs();
      this.activeTab = ActiveTab.Result;
      // this.staticTabs.tabs[0].disabled = false;
      // this.staticTabs.tabs[1].disabled = false;
      // this.staticTabs.tabs[2].disabled = false;
      this.staticTabs.tabs[3].disabled = false;
      this.staticTabs.tabs[3].active = true;
    }
    else if (next === false) {
      this.setDefineStep(true);
    }
  }

  setResultStep() {
    this.setChannelStep(true);
  }

}
