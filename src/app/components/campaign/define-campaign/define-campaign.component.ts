import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    campaignBudget: new FormControl('', [Validators.min(0), Validators.max(9999999), Validators.minLength(7)]),
    campaignConversionTarget: new FormControl('', [Validators.min(1), Validators.max(100)]),
    campaignStartEnd: new FormControl('', Validators.required),

    // Upsell || !acquisation
    campaignRegion: new FormControl(''),
    campaignLocation: new FormControl(''),
    campaignService: new FormControl(''),

    // acquisation
    campaignZipzode: new FormControl(''),
    campaignZipplus: new FormControl(''),
    campaignPropensity: new FormControl('')
  });
  //@ts-ignore
  saveModel: SaveCampaignModel;

  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 12));

  isRecommenedSelected: boolean = false;
  isAcquisitionSelected: boolean = false;;
  savedSegments: SegmentModel[] = [];
  recommendedSegments: SegmentModel[] = [];
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
    this.subscriptions.push(
      forkJoin([
        this.newCampaignService.getRecommendedSegments(),
        this.newCampaignService.getSavedSegments(),
        this.newCampaignService.getZipcodes(),
        this.newCampaignService.getZippluses(),
        this.newCampaignService.getLocations(),
        this.newCampaignService.getRegions(),
        this.newCampaignService.getServices(),
        this.newCampaignService.getPropensity(),
      ]).subscribe(
        result => {
          this.recommendedSegments = result[0].length > 0 ? result[0] : [];
          this.savedSegments = result[1].length > 0 ? result[1] : [];
          this.zipcodes = result[2].length > 0 ? result[2] : [];
          this.zippluses = result[3].length > 0 ? result[3] : [];
          this.locations = result[4].length > 0 ? result[4] : [];
          this.regions = result[5].length > 0 ? result[5] : [];
          this.services = result[6].length > 0 ? result[6] : [];
          this.propensities = result[7].length > 0 ? result[7] : [];
        }

      ));
  }

  saveCampaignClick(next: boolean): void {

    this.nextStepEvent.emit(next);

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

    if (selectedSegment) {
      //@ts-ignore
      this.saveModel = {
        name: this.defineFormGroup.value.campaignName,
        segmentId: this.defineFormGroup.value.campaignSegment,
        segmentCategory: segmentCategory,
        segmentName: selectedSegment.segmentName,
        segmentType: selectedSegment.segmentType,
        segmentSize: selectedSegment.subscriberCount,
        orgId: 12903101,
        budget: this.defineFormGroup.value.campaignBudget ? parseInt(this.defineFormGroup.value.campaignBudget) : 0,
        conversionTarget: this.defineFormGroup.value.campaignConversionTarget ? parseInt(this.defineFormGroup.value.campaignConversionTarget) : 0,
        startDate: this.defineFormGroup.value.campaignStartEnd[0],
        endDate: this.defineFormGroup.value.campaignStartEnd[1],
        region: this.defineFormGroup.value.campaignRegion,
        location: this.defineFormGroup.value.campaignLocation,
        service: this.defineFormGroup.value.campaignService,
        zipcode: this.defineFormGroup.value.campaignZipzode,
        zipPlusFour: this.defineFormGroup.value.campaignZipplus,
        propensity: this.defineFormGroup.value.campaignPropensity,
      }
      this.newCampaignService.saveCampaign(this.saveModel).subscribe(result => {
        this.saveModel = result;
        alert('New Campaign Saved : ' + result.campaignId);
      });
    }
  }

  segmentSelected() {
    const selectedSegmentId: string = this.defineFormGroup.value.campaignSegment;
    this.isRecommenedSelected = this.recommendedSegments.some(s => s.segmentId === selectedSegmentId);
    this.isisAcquisitionSegment(selectedSegmentId);
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
}
