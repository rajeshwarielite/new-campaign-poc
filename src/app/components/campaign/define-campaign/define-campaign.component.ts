import { ThisReceiver } from '@angular/compiler';
import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chart } from 'angular-highcharts';
import { delay, forkJoin, Subscription } from 'rxjs';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';
import { LocationModel, PropensityModel, RegionModel, SaveCampaignModel, SegmentModel, ServiceModel, ZipcodeModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';
import { QlikProviderService } from 'src/app/services/qlik-provider/qlik-provider.service';

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
    campaignRegion: new FormControl('All'),
    campaignLocation: new FormControl('All'),
    campaignService: new FormControl('All'),
    campaignPropensity: new FormControl('All'),

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
  isAcquisitionSelected: boolean = false;
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
  regions: RegionModel[] = [{ Region: 'All' }];
  locations: LocationModel[] = [{ Location: 'All' }];
  services: ServiceModel[] = [{ Service: 'All' }];
  propensities: PropensityModel[] = [{ Propensity: 'All' }];
  private subscriptions: Subscription[] = [];

  constructor(
    private loginProviderService: LoginProviderService,
    private newCampaignService: NewCampaignService,
    private qlikProviderService: QlikProviderService) {
    this.qlikProviderService.qlikInitialize();
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
        this.newCampaignService.getZippluses()]).subscribe(
          result => {
            this.zipcodes = result[0].length > 0 ? result[0] : [];
            this.zippluses = result[1].length > 0 ? result[1] : [];
          }
        ),
      //this.newCampaignService.getCampaigns().subscribe(result => this.allCampaignModels = result)
    );
    setTimeout(() => {
      this.getRegions();
      this.getLocations();
      this.getServices();
      this.getPropensity();
      this.getZipcodes();
      this.getZippluses();
    }, 10000);
  }

  getRegions(): void {
    this.qlikProviderService.getRegions().then(result => {
      this.regions = [{ Region: 'All' }, ...result];
      const selectedRegion = this.defineFormGroup.controls['campaignRegion'].value;
      if (selectedRegion) {
        this.defineFormGroup.controls['campaignRegion'].setValue(selectedRegion);
      }
      else {
        this.defineFormGroup.controls['campaignRegion'].setValue('All');
      }
    });
  }

  getLocations(): void {
    this.qlikProviderService.getLocations().then(result => {
      this.locations = [{ Location: 'All' }, ...result];
      const selectedLocation = this.defineFormGroup.controls['campaignLocation'].value;
      if (selectedLocation) {
        this.defineFormGroup.controls['campaignLocation'].setValue(selectedLocation);
      }
      else {
        this.defineFormGroup.controls['campaignLocation'].setValue('All');
      }
    });
  }

  getServices(): void {
    this.qlikProviderService.getServices().then(result => {
      this.services = [{ Service: 'All' }, ...result];
      const selectedService = this.defineFormGroup.controls['campaignService'].value;
      if (selectedService) {
        this.defineFormGroup.controls['campaignService'].setValue(selectedService);
      }
      else {
        this.defineFormGroup.controls['campaignService'].setValue('All');
      }
    });
  }

  getPropensity(): void {
    this.qlikProviderService.getPropensity().then(result => {
      this.propensities = [{ Propensity: 'All' }, ...result];
      const selectedPropensity = this.defineFormGroup.controls['campaignPropensity'].value;
      if (selectedPropensity) {
        this.defineFormGroup.controls['campaignPropensity'].setValue(selectedPropensity);
      }
      else {
        this.defineFormGroup.controls['campaignPropensity'].setValue('All');
      }
    });
  }

  getZipcodes(): void {
    this.qlikProviderService.getZipcodes().then(result => {
      this.zipcodes = result;
      const selectedZipcode = this.defineFormGroup.controls['campaignZipzode'].value;
      if (selectedZipcode) {
        this.defineFormGroup.controls['campaignZipzode'].setValue(selectedZipcode);
      }
      this.getZippluses();
    });
  }

  getZippluses(): void {
    this.qlikProviderService.getZippluses().then(result => {
      this.zippluses = result;
      const selectedZipplus = this.defineFormGroup.controls['campaignZipplus'].value;
      if (selectedZipplus) {
        this.defineFormGroup.controls['campaignZipplus'].setValue(selectedZipplus);
      }
    });
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
    if (this.isisAcquisitionSegment(selectedSegmentId)) {
      this.getZipcodes();
    }
    this.defineFormGroup.controls['campaignSegment'].setValue(segment.segmentId);
    this.defineFormGroup.controls['campaignRegion'].setValue('All');
    this.defineFormGroup.controls['campaignLocation'].setValue('All');
    this.defineFormGroup.controls['campaignService'].setValue('All');
    this.defineFormGroup.controls['campaignPropensity'].setValue('All');
    this.defineFormGroup.controls['campaignZipzode'].setValue('');
    this.defineFormGroup.controls['campaignZipplus'].setValue('');
  }

  searchSegments(query: any): void {
    this.recommendedSegmentsDropdown = this.recommendedSegments.filter(segment => segment.segmentName.toLocaleLowerCase().includes(query.target.value.toLocaleLowerCase()));
    this.savedSegmentsDropdown = this.savedSegments.filter(segment => segment.segmentName.toLocaleLowerCase().includes(query.target.value.toLocaleLowerCase()));
  }

  private isisAcquisitionSegment(selectedSegmentId: string): boolean {
    let selectedSegment = [...this.recommendedSegments, ...this.savedSegments].find(s => s.segmentId === selectedSegmentId);
    if (selectedSegment) {
      this.isAcquisitionSelected = selectedSegment.segmentType === 'Acquisition';
    } else {
      this.isAcquisitionSelected = false;
    }
    return this.isAcquisitionSelected;
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

