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
      this.markettingChannels = result;
      result.forEach(channel => {
        this.channelFormGroup.addControl(channel.marketingChannelId, new FormControl({ value: false, disabled: !channel.available }));
      });
    });
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
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
