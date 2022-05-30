import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { ChannelCampaignModel, SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EMPTY, forkJoin, lastValueFrom, Observable } from 'rxjs';
@Component({
  selector: 'app-deploy-campaign',
  templateUrl: './deploy-campaign.component.html',
  styleUrls: ['./deploy-campaign.component.scss']
})
export class DeployCampaignComponent implements OnInit {

  modalRef?: BsModalRef;
  @Output() nextStepEvent = new EventEmitter<boolean>();

  mobileFormGroup: FormGroup = new FormGroup({
    message: new FormControl(''),
    link: new FormControl(''),
    image: new FormControl(''),
    schedule: new FormControl('Immediate'),
    event: new FormControl(),
    threshold: new FormControl(),
    timeZone: new FormControl(),
    nTime: new FormControl(),
    nDateTime: new FormControl(),
  });

  campaignImageFile: any = '';

  selectedChannels: ChannelCampaignModel[] = [];
  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  selectedFile: any;

  constructor(private modalService: BsModalService,
    private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$selectedChannels.subscribe(result => {
      result.sort((a, b) => (a.marketingChannel === 'Mobile Notification') ? -1 : ((a.marketingChannel > b.marketingChannel) ? 1 : 0));
      if (result.some(channel => channel.marketingChannel === 'Mobile Notification')) {
        this.mobileFormGroup = new FormGroup({
          message: new FormControl('', [Validators.required, Validators.maxLength(178)]),
          link: new FormControl('', Validators.pattern(/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)),
          image: new FormControl(''),
          schedule: new FormControl('Immediate', Validators.required)
        });
      }
      else {
        ['message', 'link', 'image', 'schedule', 'event', 'threshold', 'timeZone', 'nTime', 'nDateTime'].forEach(ctrl => {
          this.mobileFormGroup.removeControl(ctrl);
        });
      }
      this.selectedChannels = result;
    });
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template);
  }

  async deployCampaign(): Promise<void> {
    forkJoin([await this.saveMobileNotificationChannel(), ...this.saveOtherChannels()]).subscribe(
      () => {
        this.saveCampaign();
      },
      () => {
        this.saveCampaign();
      }
    );
  }

  saveCampaign(): void {
    this.saveCampaignModel.status = 'In-Progress';
    if (this.selectedChannels.some(channel => channel.marketingChannel === 'CSV Download')) {
      this.saveCampaignModel.csvDownloadOnly = true;
    }
    this.newCampaignService.saveCampaign(this.saveCampaignModel).subscribe(result => {
      this.saveCampaignModel.channels = result.channels;
      this.newCampaignService.setSaveCampaignModel(this.saveCampaignModel);
      this.modalRef?.hide();
      this.nextStepEvent.emit(true);
    });
  }

  async saveMobileNotificationChannel(): Promise<Observable<SaveChannelResponseModel>> {
    const mobileChannel = this.selectedChannels.find(channel => channel.marketingChannel === 'Mobile Notification');
    if (mobileChannel) {
      const saveChannelRequest: SaveChannelRequestModel =
      {
        campaignId: this.saveCampaignModel.campaignId,
        includeInChannel: this.saveCampaignModel.segmentMobileAppSize,
        link: this.mobileFormGroup.get('link')?.value,
        marketingChannelId: mobileChannel.marketingChannelId,
        marketingChannelName: mobileChannel.marketingChannel,
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
      return this.newCampaignService.saveChannel(saveChannelRequest);
    }
    return EMPTY;
  }

  saveOtherChannels(): Observable<SaveChannelResponseModel>[] {
    return this.selectedChannels.filter(channel => channel.marketingChannel !== 'Mobile Notification').map(channel => {
      const saveChannelRequest: SaveChannelRequestModel =
      {
        campaignId: this.saveCampaignModel.campaignId,
        includeInChannel: channel.include,
        marketingChannelId: channel.marketingChannelId,
        marketingChannelName: channel.marketingChannel,
        scheduleType: '',
        notificationName: '',
        orgId: 10009,
      };
      return this.newCampaignService.saveChannel(saveChannelRequest);
    })
  }

  public findInvalidControls() {
    const controls = this.mobileFormGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        console.log(name);
      }
    }
  }

  selectSchedule() {

    ['event', 'threshold', 'timeZone', 'nTime', 'nDateTime'].forEach(ctrl => {
      this.mobileFormGroup.removeControl(ctrl);
    });

    const selectedSchedule = this.mobileFormGroup.value.schedule;

    switch (selectedSchedule) {
      case 'Immediate':
        break;
      case 'Event-Driven':
        ['event', 'threshold', 'timeZone', 'nTime'].forEach(ctrl => {
          if (ctrl === 'threshold') {
            this.mobileFormGroup.addControl(ctrl, new FormControl('', [Validators.required, Validators.min(1), Validators.max(65535)]));
          }
          else {
            this.mobileFormGroup.addControl(ctrl, new FormControl('', Validators.required));
          }
        });
        break;
      case 'Scheduled':
        this.mobileFormGroup.addControl('nDateTime', new FormControl('', Validators.required));
        break;
    }
  }

  imageSelected(event: any): void {
    if (event && event.target.files && event.target.files[0]) {
      if (['image/png', 'image/jpeg', 'image/jpg'].includes(event.target.files[0].type)) {
        this.selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => this.campaignImageFile = reader.result;
        reader.readAsDataURL(this.selectedFile);
      }

    }
  }
}
