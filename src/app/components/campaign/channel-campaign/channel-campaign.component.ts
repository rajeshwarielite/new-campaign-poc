import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-channel-campaign',
  templateUrl: './channel-campaign.component.html',
  styleUrls: ['./channel-campaign.component.scss']
})
export class ChannelCampaignComponent implements OnInit {
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

}
