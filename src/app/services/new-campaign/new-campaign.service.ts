import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { delay, expand, switchMap, take } from 'rxjs/operators'
import { ChannelCampaignModel, FileUploadResponseModel, LocationModel, PropensityModel, RegionModel, SaveCampaignModel, SaveChannelRequestModel, SaveChannelResponseModel, SegmentModel, ServiceModel, ZipcodeModel } from './models/new-campaign-models';

@Injectable({
  providedIn: 'root'
})
export class NewCampaignService {

  private apiUrl = 'https://stage.api.calix.ai/v1/';

  constructor(
    private httpClient: HttpClient) { }

  private selectedChannelsSubject = new BehaviorSubject<ChannelCampaignModel[]>([]);
  public $selectedChannels = this.selectedChannelsSubject.asObservable();

  private saveCampaignModelSubject = new Subject<SaveCampaignModel>();
  public $saveCampaignModel = this.saveCampaignModelSubject.asObservable();

  //#region Segment
  getSavedSegments(): Observable<SegmentModel[]> {
    return this.httpClient.get<SegmentModel[]>(this.apiUrl + 'cmc/segments/savedSegments?details=false&counts=false');
  }

  getRecommendedSegments(): Observable<SegmentModel[]> {
    return this.httpClient.get<SegmentModel[]>(this.apiUrl + 'cmc/segments/recommendedSegments?details=false&counts=false');
  }
  //#endregion

  //#region Camapaign
  saveCampaign(saveCampaignModel: SaveCampaignModel): Observable<SaveCampaignModel> {
    if (saveCampaignModel.campaignId) {
      return this.httpClient.put<SaveCampaignModel>(this.apiUrl + 'cmc-campaigns/campaign', saveCampaignModel).pipe(
        delay(1000),
        switchMap(result => this.getCampaignById(result.campaignId))
      );
    }
    else {
      return this.httpClient.post<SaveCampaignModel>(this.apiUrl + 'cmc-campaigns/campaign', saveCampaignModel);
    }
  }

  getCampaignById(id: string): Observable<SaveCampaignModel> {
    return this.httpClient.get<SaveCampaignModel>(this.apiUrl + 'cmc-campaigns/campaign/' + id);
  }

  getCampaigns(): Observable<SaveCampaignModel[]> {
    return this.httpClient.get<SaveCampaignModel[]>(this.apiUrl + 'cmc-campaigns/campaign');
  }
  //#endregion

  //#region Channel
  getChannels(): Observable<ChannelCampaignModel[]> {
    return this.httpClient.get<ChannelCampaignModel[]>(this.apiUrl + 'cmc-mchannel/marketingChannel');
  }

  saveFile(formData: FormData): Observable<FileUploadResponseModel> {
    return this.httpClient.post<FileUploadResponseModel>(this.apiUrl + 's3/upload/files', formData);
  }

  saveChannel(saveChannelRequestModel: SaveChannelRequestModel): Observable<SaveChannelResponseModel> {
    return this.httpClient.post<SaveChannelResponseModel>(this.apiUrl + 'cmc-channel/channel', saveChannelRequestModel);
  }
  
  updateChannel(saveChannelRequestModel: SaveChannelRequestModel): Observable<SaveChannelResponseModel> {
    return this.httpClient.put<SaveChannelResponseModel>(this.apiUrl + 'cmc-channel/channel', saveChannelRequestModel);
  }

  getCampaignChannels(campaignId: string): Observable<SaveChannelResponseModel[]> {
    return this.httpClient.get<SaveChannelResponseModel[]>(this.apiUrl + 'cmc-channel/channel/' + campaignId);
  }
  //#endregion

  //#region Static Data
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
  //#endregion

  //#region Observable Data
  setSelectedChannels(selectedChannels: ChannelCampaignModel[]): void {
    this.selectedChannelsSubject.next(selectedChannels);
  }
  setSaveCampaignModel(saveCampaignModel: SaveCampaignModel): void {
    this.saveCampaignModelSubject.next(saveCampaignModel);
  }
  //#endregion
}
