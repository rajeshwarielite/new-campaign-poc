import { ThisReceiver } from '@angular/compiler';
import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chart } from 'angular-highcharts';
import { forkJoin, Subscription } from 'rxjs';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';
import { LocationModel, PropensityModel, RegionModel, SaveCampaignModel, SegmentModel, ServiceModel, ZipcodeModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-define-campaign',
  templateUrl: './define-campaign.component.html',
  styleUrls: ['./define-campaign.component.scss']
})
export class DefineCampaignComponent implements OnInit, OnDestroy {

  @Output() nextStepEvent = new EventEmitter<boolean>();

  defineFormGroup: FormGroup = new FormGroup({
    campaignName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    campaignSegment: new FormControl('', Validators.required),
    campaignBudget: new FormControl('', [Validators.minLength(7), Validators.min(0), Validators.max(9999999)]),
    campaignConversionTarget: new FormControl('', [Validators.min(1), Validators.max(100)]),
    campaignStart: new FormControl('', Validators.required),
    campaignEnd: new FormControl('', Validators.required),

    // Upsell || !acquisation
    campaignRegion: new FormControl(''),
    campaignLocation: new FormControl(''),
    campaignService: new FormControl(''),
    campaignPropensity: new FormControl(''),

    // acquisation
    campaignZipzode: new FormControl(''),
    campaignZipplus: new FormControl(''),
  });
  //@ts-ignore
  saveModelResult: SaveCampaignModel = {};

  allCampaignModels: SaveCampaignModel[] = [];

  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 12));

  isRecommenedSelected: boolean = false;
  isAcquisitionSelected: boolean = false;;
  savedSegments: SegmentModel[] = [];
  recommendedSegments: SegmentModel[] = [];

  savedSegmentsDropdown: SegmentModel[] = [];
  recommendedSegmentsDropdown: SegmentModel[] = [];

  successMessage: string = '';
  errorMessage: string = '';

  //@ts-ignore
  selectedSegment: SegmentModel = {};

  zipcodes: ZipcodeModel[] = [];
  zippluses: ZipcodeModel[] = [];
  locations: LocationModel[] = [];
  regions: RegionModel[] = [];
  services: ServiceModel[] = [];
  propensities: PropensityModel[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private loginProviderService: LoginProviderService,
    private newCampaignService: NewCampaignService) {
    this.loginProviderService.getToken();
  }

  ngOnInit(): void {
    setInterval(() => this.errorMessage = this.successMessage = '', 10000);

    this.subscriptions.push(
      forkJoin([
        this.newCampaignService.getRecommendedSegments(),
        this.newCampaignService.getSavedSegments()
      ]).subscribe(
        result => {
          this.recommendedSegments = result[0].length > 0 ? result[0] : [];
          this.savedSegments = result[1].length > 0 ? result[1] : [];
          this.recommendedSegmentsDropdown = result[0].length > 0 ? result[0] : [];
          this.savedSegmentsDropdown = result[1].length > 0 ? result[1] : [];
        }
      ),
      forkJoin([
        this.newCampaignService.getZipcodes(),
        this.newCampaignService.getZippluses(),
        this.newCampaignService.getLocations(),
        this.newCampaignService.getRegions(),
        this.newCampaignService.getServices(),
        this.newCampaignService.getPropensity(),
      ]).subscribe(
        result => {
          this.zipcodes = result[0].length > 0 ? result[0] : [];
          this.zippluses = result[1].length > 0 ? result[1] : [];
          this.locations = result[2].length > 0 ? result[2] : [];
          this.regions = result[3].length > 0 ? result[3] : [];
          this.services = result[4].length > 0 ? result[4] : [];
          this.propensities = result[5].length > 0 ? result[5] : [];
        }
      ),
      //this.newCampaignService.getCampaigns().subscribe(result => this.allCampaignModels = result)
    );
  }

  campaignNameChanged(): void {
    this.errorMessage = '';
    this.successMessage = '';
    let campainNameAvailable = this.allCampaignModels.some(s => s.name === this.defineFormGroup.value.campaignName);
    if (campainNameAvailable) {
      this.errorMessage = 'Campaign name already exists';
    }
  }

  saveCampaignClick(next: boolean): void {
    this.successMessage = '';
    this.errorMessage = '';
    if (this.defineFormGroup.invalid) {
      this.errorMessage = 'Form Invalid';
      return;
    }

    let campainNameAvailable = this.allCampaignModels.some(s => s.name === this.defineFormGroup.value.campaignName);
    if (campainNameAvailable) {
      this.errorMessage = 'Campaign name already exists';
      return;
    }

    let segmentCategory: string = '';
    const selectedSegmentId: string = this.defineFormGroup.value.campaignSegment;
    let selectedSegment = this.recommendedSegments.find(s => s.segmentId === selectedSegmentId);
    if (selectedSegment) {
      segmentCategory = 'Recommended';
    } else {
      selectedSegment = this.savedSegments.find(s => s.segmentId === selectedSegmentId);
      if (selectedSegment) {
        segmentCategory = 'Saved';
      }
    }

    //@ts-ignore
    const saveModel: SaveCampaignModel = {};

    if (selectedSegment) {
      if (this.saveModelResult.campaignId) {
        saveModel.campaignId = this.saveModelResult.campaignId;
      }
      saveModel.name = this.defineFormGroup.value.campaignName;
      saveModel.segmentId = this.defineFormGroup.value.campaignSegment;
      saveModel.segmentCategory = segmentCategory;
      saveModel.segmentName = selectedSegment.segmentName;
      saveModel.segmentType = selectedSegment.segmentType;
      saveModel.segmentSize = selectedSegment.subscriberCount;
      saveModel.subscriberCount = selectedSegment.subscriberCount;
      saveModel.orgId = 10009;
      saveModel.budget = this.defineFormGroup.value.campaignBudget ? this.defineFormGroup.value.campaignBudget : 0;
      saveModel.conversionTarget = this.defineFormGroup.value.campaignConversionTarget ? this.defineFormGroup.value.campaignConversionTarget : 0;
      saveModel.startDate = this.defineFormGroup.value.campaignStart.toISOString().split('T')[0];
      saveModel.endDate = this.defineFormGroup.value.campaignEnd.toISOString().split('T')[0];

      if (this.isRecommenedSelected) {
        saveModel.region = this.defineFormGroup.value.campaignRegion;
        saveModel.location = this.defineFormGroup.value.campaignLocation;
        saveModel.service = this.defineFormGroup.value.campaignService;
        saveModel.propensity = this.defineFormGroup.value.campaignPropensity;
      }
      if (this.isAcquisitionSelected) {
        saveModel.zipcode = this.defineFormGroup.value.campaignZipzode ? this.defineFormGroup.value.campaignZipzode : [];
        //this.saveModel.zipPlusFour = [this.defineFormGroup.value.campaignZipplus];
      }
      this.subscriptions.push(
        this.newCampaignService.saveCampaign(saveModel).subscribe(
          (result) => {
            this.saveModelResult = result;
            this.newCampaignService.setSaveCampaignModel(result);
            if (result.campaignId) {
              this.successMessage = 'New Campaign Updated Successfully';
            }
            else {
              this.successMessage = 'New Campaign Saved Successfully';
            }
            this.nextStepEvent.emit(next);
            this.newCampaignService.getCampaignById(result.campaignId).subscribe();
          },
          (err) => {
            this.errorMessage = err.error.errorDesc;
          })
      );
    }
  }

  segmentSelected(segment: SegmentModel) {
    this.selectedSegment = segment;
    const selectedSegmentId = segment.segmentId;
    this.isRecommenedSelected = this.recommendedSegments.some(s => s.segmentId === selectedSegmentId);
    this.isisAcquisitionSegment(selectedSegmentId);
    this.defineFormGroup.controls['campaignSegment'].setValue(segment.segmentId);
    this.defineFormGroup.controls['campaignRegion'].setValue('');
    this.defineFormGroup.controls['campaignLocation'].setValue('');
    this.defineFormGroup.controls['campaignService'].setValue('');
    this.defineFormGroup.controls['campaignPropensity'].setValue('');
    this.defineFormGroup.controls['campaignZipzode'].setValue('');
    this.defineFormGroup.controls['campaignZipplus'].setValue('');
  }

  searchSegments(query: any): void {
    this.recommendedSegmentsDropdown = this.recommendedSegments.filter(segment => segment.segmentName.toLocaleLowerCase().includes(query.target.value.toLocaleLowerCase()));
    this.savedSegmentsDropdown = this.savedSegments.filter(segment => segment.segmentName.toLocaleLowerCase().includes(query.target.value.toLocaleLowerCase()));
  }

  private isisAcquisitionSegment(selectedSegmentId: string): void {
    let selectedSegment = [...this.recommendedSegments, ...this.savedSegments].find(s => s.segmentId === selectedSegmentId);
    if (selectedSegment) {
      this.isAcquisitionSelected = selectedSegment.segmentType === 'Acquisition';
    } else {
      this.isAcquisitionSelected = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  startDateChange(): void {
    if (this.defineFormGroup.value.campaignEnd && (this.defineFormGroup.value.campaignStart > this.defineFormGroup.value.campaignEnd)) {
      this.defineFormGroup.controls['campaignEnd'].setValue(this.defineFormGroup.value.campaignStart);
    }
  }

  messageReset() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}

