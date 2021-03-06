import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelCampaignModel, SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-channel-campaign',
  templateUrl: './channel-campaign.component.html',
  styleUrls: ['./channel-campaign.component.scss']
})
export class ChannelCampaignComponent implements OnInit {
  @Output() nextStepEvent = new EventEmitter<boolean>();
  channelFormGroup: FormGroup = new FormGroup({
    csvDownload: new FormControl(false),
    selectAll: new FormControl(false)
  }, Validators.requiredTrue);

  formValid: boolean = false;

  allMarkettingChannels: ChannelCampaignModel[] = [];

  markettingChannels: ChannelCampaignModel[] = [];

  csvChannel: ChannelCampaignModel = {
    available: true,
    completedCampaigns: 0,
    costPerSubscriber: 0,
    description: 'CSV Download',
    inprogressCampaigns: 0,
    marketingChannel: 'CSV Download',
    marketingChannelId: 'csvDownload',
    scheduleCampaigns: 0,
    include: 'All',
  };
  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.getChannels().subscribe(result => {
      result.sort((a, b) => (a.marketingChannel > b.marketingChannel) ? 1 : -1);
      result.forEach(channel => channel.include = channel.marketingChannel === 'Mobile Notification' ? 0 : 'All');
      this.allMarkettingChannels = result;
    });
    this.newCampaignService.$saveCampaignModel.subscribe(result => {
      if (result.segmentType === 'Acquisition') {
        this.markettingChannels = this.allMarkettingChannels.filter(ch => ch.marketingChannel !== 'Mobile Notification');
        this.csvChannel.available = false;
        this.channelFormGroup.removeControl(this.csvChannel.marketingChannelId);
      }
      else {
        this.markettingChannels = this.allMarkettingChannels;
        this.csvChannel.available = true;
        this.channelFormGroup.removeControl(this.csvChannel.marketingChannelId);
        this.channelFormGroup.addControl(this.csvChannel.marketingChannelId, new FormControl({ value: false, disabled: !this.csvChannel.available }));
      }
      this.markettingChannels.forEach(channel => {
        this.channelFormGroup.addControl(channel.marketingChannelId, new FormControl({ value: false, disabled: !channel.available }));
      });
      Object.keys(this.channelFormGroup.controls).forEach(ctrl => {
        const control = this.channelFormGroup.get(ctrl);
        if (control && !control.disabled) {
          control.setValue(false);
        }
      });
      this.formValid = false;
      this.formValid = false;
      this.saveCampaignModel = result;
    });
  }

  selectAllChannel(event: any): void {
    if (event.target.checked) {
      Object.keys(this.channelFormGroup.controls).filter(c => c !== 'selectAll').forEach(ctrl => {
        const control = this.channelFormGroup.get(ctrl);
        if (control && !control.disabled) {
          control.setValue(true);
        }
      });
      this.formValid = true;
    }
    else {
      Object.keys(this.channelFormGroup.controls).filter(c => c !== 'selectAll').forEach(ctrl => {
        const control = this.channelFormGroup.get(ctrl);
        if (control && !control.disabled) {
          control.setValue(false);
        }
      });
      this.formValid = false;
    }
  }

  selectChannel(event: any, channel: ChannelCampaignModel): void {
    const allChecked = Object.keys(this.channelFormGroup.controls).filter(c => c !== 'selectAll').every(ctrl => {
      const control = this.channelFormGroup.get(ctrl);
      if (control && !control.disabled) {
        return control.value;
      }
      else {
        return true;
      }
    });
    this.channelFormGroup.controls['selectAll'].setValue(allChecked);
    if (event.target.checked) {
      this.formValid = true;
    } else {
      const anyChecked = Object.keys(this.channelFormGroup.controls).filter(c => c !== 'selectAll').some(ctrl => {
        const control = this.channelFormGroup.get(ctrl);
        return control?.value;
      });
      this.formValid = anyChecked;
    }
  }

  selectChannelInclude(event: any, channel: ChannelCampaignModel): void {
    channel.include = event.target.value;
  }

  setSelectedChannels(next?: boolean): void {
    this.nextStepEvent.emit(next);
    const selectedChannelIds = Object.keys(this.channelFormGroup.controls).map(control => this.channelFormGroup.get(control)?.value ? control : '');
    const selectedChannels = [...this.markettingChannels, this.csvChannel].filter(ch => selectedChannelIds.includes(ch.marketingChannelId));
    this.newCampaignService.setSelectedChannels(selectedChannels);
  }
}
