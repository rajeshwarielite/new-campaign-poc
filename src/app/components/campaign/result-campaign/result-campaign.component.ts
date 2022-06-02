import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Chart } from 'angular-highcharts';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EMPTY, lastValueFrom, Observable } from 'rxjs';
import { ChannelNameSizeModel, SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-result-campaign',
  templateUrl: './result-campaign.component.html',
  styleUrls: ['./result-campaign.component.scss']
})
export class ResultCampaignComponent implements OnInit {
  modalRef?: BsModalRef;

  minimumDateTime = new Date();

  mobileFormGroup: FormGroup = new FormGroup({
    message: new FormControl(''),
    link: new FormControl(''),
    image: new FormControl(''),
    schedule: new FormControl('Immediate'),
    event: new FormControl(),
    threshold: new FormControl(),
    timeZone: new FormControl(),
    nTime: new FormControl(),
    nDateTime: new FormControl(this.minimumDateTime),
  });

  selectedFile: any;

  //@ts-ignore
  saveCampaignModel: SaveCampaignModel = {};
  savedChannels: SaveChannelResponseModel[] = [];
  channelNameSizeModel: ChannelNameSizeModel[] = [];

  //@ts-ignore
  deployChannel: SaveChannelResponseModel;

  constructor(private modalService: BsModalService,
    private newCampaignService: NewCampaignService
  ) { }

  ngOnInit(): void {
    this.minimumDateTime = new Date(this.minimumDateTime.getTime() + 15 * 60000);
    this.newCampaignService.$saveCampaignModel.subscribe(result => {
      this.saveCampaignModel = result;
      if (result.channels && result.channels.length > 0) {
        this.channelNameSizeModel = result.channels;

        this.createChart(result.channels.map(ch => ch.channelName));

        result.channels.forEach(channel => this.chart.addSeries({
          name: channel.channelName,
          //@ts-ignore
          data: [channel.channelName, channel.channelSize],
          color: '#0d6efd'
        }, true, false));
      }
      if (result.status === 'In-Progress') {
        this.newCampaignService.getCampaignChannels(this.saveCampaignModel.campaignId).subscribe(result => {
          if (Array.isArray(result)) {
            result.sort((a, b) => (a.marketingChannelName === 'Mobile Notification') ? -1 : ((a.marketingChannelName > b.marketingChannelName) ? 1 : 0));
            this.savedChannels = result;
          }
        });
      }
    });
  }

  openRedeployModal(channel: SaveChannelResponseModel, template: TemplateRef<any>): void {
    this.deployChannel = channel;
    this.modalRef = this.modalService.show(template);
    if (channel.marketingChannelName === 'Mobile Notification') {
      this.mobileFormGroup.get('message')?.setValue(channel.notificationName);
      this.mobileFormGroup.get('link')?.setValue(channel.link);
      this.mobileFormGroup.get('schedule')?.setValue(channel.scheduleType);
      this.mobileFormGroup.get('event')?.setValue(channel.eventDriven);
      this.mobileFormGroup.get('threshold')?.setValue(channel.eventThreshold);
      this.mobileFormGroup.get('timeZone')?.setValue(channel.notificationTimeZone);
      this.mobileFormGroup.get('nTime')?.setValue(channel.notificationTime);
      this.mobileFormGroup.get('nDateTime')?.setValue(channel.scheduledDateTime);
    }
  }

  redeployChannel(channel: SaveChannelResponseModel) {
    if (channel.marketingChannelName !== 'Mobile Notification') {
      const saveChannelRequestModel: SaveChannelRequestModel = {
        campaignId: channel.campaignId,
        includeInChannel: channel.includeInChannel,
        marketingChannelId: channel.marketingChannelId,
        marketingChannelName: channel.marketingChannelName,
        notificationName: channel.notificationName,
        orgId: channel.orgId,
        scheduleType: channel.scheduleType,
      };
      this.newCampaignService.updateChannel(saveChannelRequestModel).subscribe(result => {
        this.modalRef?.hide();
        if (result as SaveChannelResponseModel) {
          channel = result;
        }
      });
    } else {
      this.saveMobileNotificationChannel().then();
    }
  }

  async saveMobileNotificationChannel(): Promise<void> {

    const saveChannelRequest: SaveChannelRequestModel =
    {
      campaignId: this.saveCampaignModel.campaignId,
      includeInChannel: this.saveCampaignModel.segmentMobileAppSize,
      link: this.mobileFormGroup.get('link')?.value,
      marketingChannelId: this.deployChannel.marketingChannelId,
      marketingChannelName: this.deployChannel.marketingChannelName,
      notificationName: this.mobileFormGroup.get('message')?.value,
      orgId: 10009,
      scheduleType: this.mobileFormGroup.get('schedule')?.value,
    };

    if (this.mobileFormGroup.get('schedule')?.value === 'Event-Driven') {
      saveChannelRequest.eventDriven = this.mobileFormGroup.get('event')?.value;
      saveChannelRequest.eventThreshold = this.mobileFormGroup.get('threshold')?.value;
      saveChannelRequest.notificationTimeZone = this.mobileFormGroup.get('timeZone')?.value;
      saveChannelRequest.notificationTime = this.mobileFormGroup.get('nTime')?.value;
    }
    else if (this.mobileFormGroup.get('schedule')?.value === 'Scheduled') {
      saveChannelRequest.scheduledDateTime = this.mobileFormGroup.get('nDateTime')?.value;
    }

    if (this.mobileFormGroup.get('image')?.value) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      const fileResult = await lastValueFrom(this.newCampaignService.saveFile(formData));
      saveChannelRequest.content = fileResult.url;
    }
    this.newCampaignService.updateChannel(saveChannelRequest).subscribe(result => {
      this.modalRef?.hide();
      if (result as SaveChannelResponseModel) {
        this.deployChannel = result;
      }
    });
  }

  imageSelected(event: any): void {
    this.selectedFile = event;
  }

  createChart(categories: string[]): void {
    this.chart = new Chart({
      chart: {
        type: 'column',
        animation: false
      },
      title: {
        text: 'Segment Distribution'
      },
      xAxis: {
        title: {
          text: 'Channel(s)'
        },
        categories: categories
      },
      yAxis: {
        title: {
          text: 'Segment Members'
        }
      },
      series: []
    });
  }

  chart = new Chart();
}
