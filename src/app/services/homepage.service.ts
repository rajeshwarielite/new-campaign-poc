import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataUsageTrendsModel, HeatMapModel } from './explore-data/models/explore-data-model';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private apiUrl = " https://stage.api.calix.ai/v1/";

  constructor(private httpClient: HttpClient
    ) { }

  getServiceTierChart(): Observable<DataUsageTrendsModel> {

    return this.httpClient.get<DataUsageTrendsModel>(this.apiUrl + 'cmc/target-segmentation/service-tier-counts?org-id=10009&period=last-30d');
  }
  getNewSubscribersChart(): Observable<[{ [key: string]: [{ [key: string]: number[] }] }]> {

    return this.httpClient.get<[{ [key: string]: [{ [key: string]: number[] }] }]>(this.apiUrl + 'acquisition/acquisition-user-count-by-month?page=1&size=10&output=json&org-id=10009&period=last-30d');
  }
  getChurnTrendsChart(): Observable<[{ [key: string]: [{ [key: string]: number[] }] }]> {

    return this.httpClient.get<[{ [key: string]: [{ [key: string]: number[] }] }]>(this.apiUrl + 'insights/churn-user-count-by-month?org-id=10009&period=last-30d');
  }
  
}


