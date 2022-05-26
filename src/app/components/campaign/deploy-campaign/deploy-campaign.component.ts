import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { ChannelCampaignModel, SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
@Component({
  selector: 'app-deploy-campaign',
  templateUrl: './deploy-campaign.component.html',
  styleUrls: ['./deploy-campaign.component.scss']
})
export class DeployCampaignComponent implements OnInit {
  @Output() nextStepEvent = new EventEmitter<boolean>();

  mobileFormGroup: FormGroup = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.maxLength(178)]),
    link: new FormControl(''),
    image: new FormControl(''),
    schedule: new FormControl('i', Validators.required),
    event: new FormControl(),
    threshold: new FormControl(),
    timeZone: new FormControl(),
    nTime: new FormControl(),
    nDateTime: new FormControl(),
  });

  selectedChannels: ChannelCampaignModel[] = [];
  // @ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(
    private newCampaignService: NewCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$selectedChannels.subscribe(result => this.selectedChannels = result);
    this.newCampaignService.$saveCampaignModel.subscribe(result => this.saveCampaignModel = result);
  }

  deployCampaign(next?: boolean): void {
    this.nextStepEvent.emit(next);
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

    ['threshold', 'timeZone', 'nTime', 'nDateTime', 'nDateTime'].forEach(ctrl => {
      this.mobileFormGroup.get(ctrl)?.clearValidators();
    });
    
    const selectedSchedule = this.mobileFormGroup.value.schedule;

    switch (selectedSchedule) {
      case 'i':
        break;
      case 'e':
        ['threshold', 'timeZone', 'nTime', 'nDateTime'].forEach(ctrl => {
          this.mobileFormGroup.get(ctrl)?.addValidators(Validators.required);
        });
        break;
      case 's':
          this.mobileFormGroup.get('nDateTime')?.addValidators(Validators.required);
        break;
    }
  }
}
