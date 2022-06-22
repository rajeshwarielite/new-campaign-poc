import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { CampaignModel, HomepageService } from 'src/app/services/homepage.service';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';
import { SegmentModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor(private loginProviderService: LoginProviderService,
    private homepageService: HomepageService,
    private exploreChartService: ExploreChartService,
   private newCampaignService: NewCampaignService) {
    this.loginProviderService.getToken();
  }
  serviceTierChart: Chart = Chart.prototype;
  newSubscribersChart: Chart = Chart.prototype;
  churnTrendsChart: Chart = Chart.prototype;
  campaignlist: CampaignModel[] = [];
  recommenedSegmentlist: SegmentModel[] = [];
 savedSegmentList: SegmentModel[] = [];
  ngOnInit(): void {
    this.homepageService.getServiceTierChart().subscribe(result => {
      this.serviceTierChart = this.exploreChartService.getServiceTierChart(result);
    });
    this.homepageService.getNewSubscribersChart().subscribe(result => {
      const newSubscribersChartData = new Map<string, Map<string, number[]>>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        const innerMap = new Map<string, number[]>();
        m[key].forEach(n => {
          const innerKey = Object.keys(n)[0];
          innerMap.set(innerKey, n[innerKey]);
        })
        newSubscribersChartData.set(key, innerMap);
      });
      this.newSubscribersChart = this.exploreChartService.getNewSubscribersChart(newSubscribersChartData);
    });
    this.homepageService.getChurnTrendsChart().subscribe(result => {
      const newSubscribersChartData = new Map<string, Map<string, number[]>>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        const innerMap = new Map<string, number[]>();
        m[key].forEach(n => {
          const innerKey = Object.keys(n)[0];
          innerMap.set(innerKey, n[innerKey]);
        })
        newSubscribersChartData.set(key, innerMap);
      });
      this.churnTrendsChart = this.exploreChartService.getNewSubscribersChart(newSubscribersChartData);
    });
    this.homepageService.getcampaignlist().subscribe(result => {
      this.campaignlist = result.splice(0, 5);
    }
    );
    this.newCampaignService.getRecommendedSegments().subscribe(result => {
      this.recommenedSegmentlist = result.splice(0, 5);
    }
    );
    this.newCampaignService.getSavedSegments().subscribe(result => {
      this.savedSegmentList = result.splice(0, 5);
    }
    );
  }

}
