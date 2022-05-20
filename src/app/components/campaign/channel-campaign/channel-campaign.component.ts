import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-channel-campaign',
  templateUrl: './channel-campaign.component.html',
  styleUrls: ['./channel-campaign.component.scss']
})
export class ChannelCampaignComponent implements OnInit {
  channelFormGroup: FormGroup = new FormGroup({
    channel: new FormControl(''),
    constantContact: new FormControl(''),
    mobileNotifications: new FormControl(''),
    faceBook: new FormControl(''),
    mailChimp: new FormControl(''),
    hubSpot: new FormControl(''),
    downloadCSV: new FormControl('')
  })

  constructor() { }

  ngOnInit(): void {
  }

}
