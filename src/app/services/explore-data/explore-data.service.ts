import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExploreDataModel, StreamingGamingWfhUsersExploreDataModel, SubscriberExploreDataModel } from './models/explore-data-model';

@Injectable({
  providedIn: 'root'
})

export class ExploreDataService {
  private apiUrl = " https://stage.api.calix.ai/v1/cmc/";


  constructor(private httpClient: HttpClient) { }
  getRegion(): Observable<[string[]]> {
    return this.httpClient.get<[string[]]>(this.apiUrl + 'cloud/region-location-hierarchy?org-id=10009&');
  }
  getSubscriber(exploreDataModel: ExploreDataModel): Observable<SubscriberExploreDataModel> {
    return this.httpClient.get<SubscriberExploreDataModel>(this.apiUrl + 'insights/total-active-subscribers?org-id=10009&period=last-2m&region=Tamilnadu&location=Pondicherry' + exploreDataModel);
  }
  getStreamingGamingWfhUsers(exploreDataModel: ExploreDataModel): Observable<StreamingGamingWfhUsersExploreDataModel> {
    return this.httpClient.get<StreamingGamingWfhUsersExploreDataModel>(this.apiUrl + 'target-segmentation/user-counts?org-id=10009&period=last-2m&region=Tamilnadu&location=Pondicherry' + exploreDataModel);
  }
  getSubscriberChart(period: string, region: string, location: string): Observable<any> {
    return this.httpClient.get(this.apiUrl + 'insights/total-bandwidth-consumed?categories=75-200-500-1000-2000-3000&org-id=10009&period=' + period + '&region=' + region + '&location=' + location);
  }
  getSubscriberDataUsageTrendsChart(period: string, region: string, location: string): Observable<any> {
    return this.httpClient.get(this.apiUrl + 'insights/subscriber-trends-by-application-group?month=6&org-id=10009&period=' + period + '&region=' + region + '&location=' + location);
  }
  getApplicationUsageByTypeChart(period: string, region: string, location: string): Observable<any> {
    return this.httpClient.get(this.apiUrl +'insights/application-group-usage?limit=4&others=true&org-id=10009&period='+period+'&region=Tamil%20Nadu&location='+location);
}
getApplicationHeatMapChart(period: string, region: string, location: string): Observable<any> {
  return this.httpClient.get(this.apiUrl +'insights/social-channel-list?timezone=05.30&org-id=10009&period='+period+'&region=Tamil%20Nadu&location='+location);
}
getRetentionChurnRiskChart(period: string, region: string, location: string): Observable<any> {
  return this.httpClient.get(this.apiUrl +'insights/churn-user-count-by-month?org-id=10009&period='+period+'&region=Tamil%20Nadu&location='+location);
}
getServiceProviderAcqInsightsChart(period: string, region: string, location: string): Observable<any>{
  return this.httpClient.get(this.apiUrl +'acquisition/acquisition-user-count-by-month?page=1&size=10&output=json&org-id=10009&period='+period+'&region=Tamil%20Nadu&location='+location);
}
getSysytemByModelChart(): Observable<any> {
  return this.httpClient.get(this.apiUrl='https://stage.api.calix.ai/v1/foundation/dashboard/system-model/10009?productType=all&limit=30');
}

}

