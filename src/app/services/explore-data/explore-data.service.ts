import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AreaFilterModel, DataUsageTrendsModel, ExploreDataModel, HeatMapModel, StreamingGamingWfhUsersExploreDataModel, SubscriberExploreDataModel } from './models/explore-data-model';

@Injectable({
  providedIn: 'root'
})

export class ExploreDataService {
  private apiUrl = " https://stage.api.calix.ai/v1/cmc/";

  private areaFilterSubject = new Subject<AreaFilterModel>();
  public areaFilterProvider$ = this.areaFilterSubject.asObservable();
  public areaFilterModel: AreaFilterModel = {
    location: '',
    region: '',
    timeFrame: 'last-2m'
  };

  constructor(private httpClient: HttpClient) { }

  setAreaFilterModel(input: AreaFilterModel): void {
    this.areaFilterModel = input;
    this.areaFilterSubject.next(input);
  }

  getRegion(): Observable<[string[]]> {
    return this.httpClient.get<[string[]]>(this.apiUrl + 'cloud/region-location-hierarchy?org-id=10009&');
  }
  getSubscriber(): Observable<SubscriberExploreDataModel> {
    return this.httpClient.get<SubscriberExploreDataModel>(this.apiUrl + 'insights/total-active-subscribers?org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getStreamingGamingWfhUsers(): Observable<StreamingGamingWfhUsersExploreDataModel> {
    return this.httpClient.get<StreamingGamingWfhUsersExploreDataModel>(this.apiUrl + 'target-segmentation/user-counts?org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getSubscriberDataUsageChart(): Observable<[{ [key: string]: number }]> {
    return this.httpClient.get<[{ [key: string]: number }]>(this.apiUrl + 'insights/total-bandwidth-consumed?categories=75-200-500-1000-2000-3000&org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getSubscriberDataUsageTrendsChart(): Observable<DataUsageTrendsModel> {
    return this.httpClient.get<DataUsageTrendsModel>(this.apiUrl + 'insights/total-and-streaming-usage-trend?month=6&org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }

  getServicesBlockedThreatsInsightsChart(): Observable<[{ WG: number }, { AV: number }, { IPS: number }]> {
    return this.httpClient.get<[{ WG: number }, { AV: number }, { IPS: number }]>(this.apiUrl + 'marketing/subscriber-protectiq-insight?org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }

  getApplicationUsageByTypeChart(): Observable<[{ [key: string]: number }]> {
    return this.httpClient.get<[{ [key: string]: number }]>(this.apiUrl + 'insights/application-group-usage?limit=4&others=true&org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getApplicationSocials(): Observable<[{ [key: string]: number }]> {

    return this.httpClient.get<[{ [key: string]: number }]>(this.apiUrl + 'insights/social-channel-list?timezone=05.30&org-id=10009&period=' + this.areaFilterModel.timeFrame + '&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getApplicationHeatMapChart(channelName: string,): Observable<HeatMapModel> {
    return this.httpClient.get<HeatMapModel>(this.apiUrl + 'insights/application-heatmap?social-channel-name=' + channelName + '&timezone=05.30&interval=2&org-id=10009&period=last-30d&region=' + this.areaFilterModel.region + '&location=' + this.areaFilterModel.location);
  }
  getRetentionChurnRiskChart(period: string, region: string, location: string): Observable<any> {
    return this.httpClient.get(this.apiUrl + 'insights/churn-user-count-by-month?org-id=10009&period=' + period + '&region=Tamil%20Nadu&location=' + location);
  }
  getServiceProviderAcqInsightsChart(period: string, region: string, location: string): Observable<any> {
    return this.httpClient.get(this.apiUrl + 'acquisition/acquisition-user-count-by-month?page=1&size=10&output=json&org-id=10009&period=' + period + '&region=Tamil%20Nadu&location=' + location);
  }
  getSysytemByModelChart(): Observable<any> {
    return this.httpClient.get(this.apiUrl = 'https://stage.api.calix.ai/v1/foundation/dashboard/system-model/10009?productType=all&limit=30');
  }

}

