import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ChannelCampaignModel, LocationModel, PropensityModel, RegionModel, SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel, SegmentModel, ServiceModel, ZipcodeModel } from './models/new-campaign-models';

@Injectable({
  providedIn: 'root'
})
export class NewCampaignService {

  private apiUrl = 'https://dev.api.calix.ai/v1/cmc';

  constructor(
    private httpClient: HttpClient) { }

  private selectedChannelsSubject = new BehaviorSubject<ChannelCampaignModel[]>([]);
  public $selectedChannels = this.selectedChannelsSubject.asObservable();

  private saveCampaignModelSubject = new Subject<SaveCampaignModel>();
  public $saveCampaignModel = this.saveCampaignModelSubject.asObservable();

  getSavedSegments(): Observable<SegmentModel[]> {
    return this.httpClient.get<SegmentModel[]>(this.apiUrl + '/segments/savedSegments?details=false&counts=false');
  }

  getRecommendedSegments(): Observable<SegmentModel[]> {
    return this.httpClient.get<SegmentModel[]>(this.apiUrl + '/segments/recommendedSegments?details=false&counts=false');
  }

  saveCampaign(saveCampaignModel: SaveCampaignModel): Observable<SaveCampaignModel> {
    if (saveCampaignModel.campaignId) {
      return this.httpClient.put<SaveCampaignModel>(this.apiUrl + '-campaigns/campaign', saveCampaignModel);
    }
    else {
      return this.httpClient.post<SaveCampaignModel>(this.apiUrl + '-campaigns/campaign', saveCampaignModel);
    }
  }

  getCampaigns(): Observable<SaveCampaignModel[]> {
    return this.httpClient.get<SaveCampaignModel[]>(this.apiUrl + '-campaigns/campaign');
  }

  saveChannel(saveChannelRequestModel: SaveChannelRequestModel): Observable<SaveChannelResponseModel> {
    return this.httpClient.post<SaveChannelResponseModel>(this.apiUrl + '-channel/channel', saveChannelRequestModel);
  }

  getCampaignChannels(campaignId: string): Observable<SaveChannelResponseModel[]> {
    return this.httpClient.get<SaveChannelResponseModel[]>(this.apiUrl + '-channel/channel/' + campaignId);
  }


  getZipcodes(): Observable<ZipcodeModel[]> {
    const zipcodes: ZipcodeModel[] = [
      { item_id: 0, item_text: '68025' }
      , { item_id: 1, item_text: '68502' }
      , { item_id: 2, item_text: '68504' }
      , { item_id: 3, item_text: '68506' }
      , { item_id: 4, item_text: '68507' }
      , { item_id: 5, item_text: '68510' }
      , { item_id: 6, item_text: '68512' }
      , { item_id: 7, item_text: '68516' }
      , { item_id: 8, item_text: '68520' }
      , { item_id: 9, item_text: '68521' }
      , { item_id: 10, item_text: '68701' }
      , { item_id: 11, item_text: '68901' }
      , { item_id: 12, item_text: '69101' }
      , { item_id: 13, item_text: '69301' }
      , { item_id: 14, item_text: '69361' }
    ];

    return of(zipcodes);
  }

  getZippluses(): Observable<ZipcodeModel[]> {
    const zippluses: ZipcodeModel[] = [
      { item_id: 0, item_text: '68025-4583' }
      , { item_id: 1, item_text: '68502-4583' }
      , { item_id: 2, item_text: '68504-4587' }
    ];
    return of(zippluses);
  }
  getLocations(): Observable<LocationModel[]> {
    const locations: LocationModel[] = [{ Location: 'Tamil Nadu' }];
    return of(locations);
  }
  getRegions(): Observable<RegionModel[]> {
    const regions: RegionModel[] = [{ Region: 'Chennai' }];
    return of(regions);
  }
  getServices(): Observable<ServiceModel[]> {
    const services: ServiceModel[] = [{ Service: '<20M' }, { Service: '20M' }, { Service: '50M' }];
    return of(services);
  }
  getPropensity(): Observable<PropensityModel[]> {
    const propensities: PropensityModel[] = [{ Propensity: 'High' }, { Propensity: 'Low' }];
    return of(propensities);
  }

  getChannels(): Observable<ChannelCampaignModel[]> {
    return this.httpClient.get<ChannelCampaignModel[]>(this.apiUrl + '-mchannel/marketingChannel');
  }

  setSelectedChannels(selectedChannels: ChannelCampaignModel[]): void {
    this.selectedChannelsSubject.next(selectedChannels);
  }
  setSaveCampaignModel(saveCampaignModel: SaveCampaignModel): void {
    this.saveCampaignModelSubject.next(saveCampaignModel);
  }
}
