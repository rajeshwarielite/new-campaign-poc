import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-channel-campaign',
  templateUrl: './channel-campaign.component.html',
  styleUrls: ['./channel-campaign.component.scss']
})
export class ChannelCampaignComponent implements OnInit {
  @Output() nextStepEvent = new EventEmitter<boolean>();
  channelFormGroup: FormGroup = new FormGroup({
  }, Validators.requiredTrue);

  markettingChannels: ChannelCampaignModel[] = [];

  constructor(private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.getChannels().subscribe(result => {
      this.markettingChannels = result;
      result.forEach(channel => {
        this.channelFormGroup.addControl(channel.marketingChannelId, new FormControl(false));
      });
    });
  }

  setSelectedChannels(next: boolean): void {
    this.nextStepEvent.emit(next);
    const selectedChannelIds = Object.keys(this.channelFormGroup.controls).map(control => this.channelFormGroup.get(control)?.value ? control : '');
    const selectedChannels = this.markettingChannels.filter(ch=>selectedChannelIds.includes(ch.marketingChannelId));
    this.newCampaignService.setSelectedChannels(selectedChannels);
  }
  
  previousDefine():void{

  }
}
