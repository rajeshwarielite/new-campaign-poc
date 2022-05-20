import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaign-container',
  templateUrl: './campaign-container.component.html',
  styleUrls: ['./campaign-container.component.scss']
})
export class CampaignContainerComponent implements OnInit {

  channelSelected: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  defineTabSelected():void{
    this.channelSelected = false;
  }

  channelTabSelected():void{
    this.channelSelected = true;
  }

  setChannelStep(next: boolean) {
    this.channelSelected = next;
  }

}
