import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { async } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { LocationModel, PropensityModel, RegionModel, ServiceModel, TicketTokenResponse, ZipcodeModel } from '../new-campaign/models/new-campaign-models.js';
//@ts-ignore
import { openQlikConnection, openApp, getRecommendedSegmentAdditionalFilters, downloadQSReports } from './qlik-connection.js';


@Injectable({
  providedIn: 'root'
})
export class QlikProviderService {

  qlikApp: any;

  constructor(private httpClient: HttpClient) {

  }

  qlikInitialize(): void {
    console.log("1 QLINK getQlikTOkenByAppType", new Date());
    this.getQlikTOkenByAppType('CMC').subscribe(async (result) => {
      console.log("2 QLINK openQlikConnection", result, new Date());
      openQlikConnection(result.Ticket).then(() => {
        console.log("3 QLINK openApp", result, new Date());
        openApp().then(
          //@ts-ignore
          result => {
            console.log("4 QLINK Done", result, new Date());
            this.qlikApp = result;
          });
      });
    });
  }

  private getQlikTOkenByAppType(type: string): Observable<TicketTokenResponse> {
    return this.httpClient.get<TicketTokenResponse>('https://stage.api.calix.ai/v1/qlik/ticket?app=' + type);
  }

  async getRegions(): Promise<RegionModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'JMaAZ');
    return result.data;
  }
  async getServices(): Promise<ServiceModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'PJsnhVn');
    return result.data;
  }
  async getLocations(): Promise<LocationModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'LFeyjKg');
    return result.data;
  }
  async getPropensity(): Promise<PropensityModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'WAxmwY');
    return result.data;
  }
  async getZipcodes(): Promise<ZipcodeModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'SJYdy');
    return result.data;
  }
  async getZippluses(): Promise<ZipcodeModel[]> {
    const result = await getRecommendedSegmentAdditionalFilters(this.qlikApp, 'jnQpJTt');
    return result.data;
  }
  downloadQlikCSVreport(): void {
    downloadQSReports(this.qlikApp, 'CSV Download');
  }
  downloadCSVSegmentFilters():void
  {

  }
}
