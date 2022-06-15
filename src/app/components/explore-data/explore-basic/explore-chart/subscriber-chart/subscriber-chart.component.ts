import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';
import { DataUsageTrendsModel, StreamingGamingWfhUsersExploreDataModel, SubscriberExploreDataModel } from 'src/app/services/explore-data/models/explore-data-model';

@Component({
  selector: 'app-subscriber-chart',
  templateUrl: './subscriber-chart.component.html',
  styleUrls: ['./subscriber-chart.component.scss']
})
export class SubscriberChartComponent implements OnInit {

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }

  public subscriberData: SubscriberExploreDataModel = { activesubscribers: 0 };

  public streamingGamingWfhUsers: StreamingGamingWfhUsersExploreDataModel = {
    streamingUsers: 0,
    gamingUsers: 0,
    wfhUsers: 0
  };

  subscriberDataUsageChart: Chart = Chart.prototype;

  dataUsageTrendsChart: Chart = Chart.prototype;

  ngOnInit(): void {
    this.refreshSubscriber();
    this.exploreDataService.areaFilterProvider$.subscribe(() => {
      this.refreshSubscriber();
    });
  }

  refreshSubscriber(): void {
    this.exploreDataService.getSubscriber().subscribe(result => { this.subscriberData = result });
    this.exploreDataService.getStreamingGamingWfhUsers().subscribe(result => { this.streamingGamingWfhUsers = result });
    this.exploreDataService.getSubscriberDataUsageChart().subscribe(result => {
      const subscriberDataUsageData = new Map<string, number>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        subscriberDataUsageData.set(key, m[key]);
      });
      this.subscriberDataUsageChart = this.exploreChartService.getSubscriberDataUsageChart(subscriberDataUsageData, this.subscriberData.activesubscribers)

    });
    this.exploreDataService.getSubscriberDataUsageTrendsChart().subscribe(result => {
      this.dataUsageTrendsChart = this.exploreChartService.getSubscriberUsageDataTrendsChart(result);
    });

  }

}
