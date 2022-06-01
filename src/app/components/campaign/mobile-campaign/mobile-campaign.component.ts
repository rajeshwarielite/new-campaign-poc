import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mobile-campaign',
  templateUrl: './mobile-campaign.component.html',
  styleUrls: ['./mobile-campaign.component.scss']
})
export class MobileCampaignComponent implements OnInit {

  @Output() fileSelected = new EventEmitter<any>();

  minimumDateTime = new Date();

  @Input() mobileFormGroup: FormGroup = new FormGroup({
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

  campaignImageFile: any;
  selectedFile: any;

  constructor() { }

  ngOnInit(): void {
    this.minimumDateTime = new Date(this.minimumDateTime.getTime() + 15 * 60000);
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
        this.mobileFormGroup.addControl('nDateTime', new FormControl(this.minimumDateTime, Validators.required));
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
        this.fileSelected.emit(this.selectedFile);
      }
    }
  }

}
