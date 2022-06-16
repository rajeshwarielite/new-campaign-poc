import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';

@Component({
  selector: 'app-acquisition-insights-chart',
  templateUrl: './acquisition-insights-chart.component.html',
  styleUrls: ['./acquisition-insights-chart.component.scss']
})
export class AcquisitionInsightsChartComponent implements OnInit {

  totalAcquired = 0;

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }
  acquisitionRateInsightsChart: Chart = Chart.prototype;
  ngOnInit(): void {
    this.refreshSubscriber();
    this.exploreDataService.areaFilterProvider$.subscribe(() => {
      this.refreshSubscriber();
    });
  }
  refreshSubscriber(): void {

    this.exploreDataService.getServiceProviderAcqInsightsChart().subscribe(result => {
      const acquisitionRateInsightsChartData = new Map<string, Map<string, number[]>>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        const innerMap = new Map<string, number[]>();
        m[key].forEach(n => {
          const innerKey = Object.keys(n)[0];
          innerMap.set(innerKey, n[innerKey]);
        })
        acquisitionRateInsightsChartData.set(key, innerMap);
      });
      const featureTotal = Array.from(acquisitionRateInsightsChartData.keys()).map(c => this.exploreChartService.getFeatureTotal(acquisitionRateInsightsChartData, c));
      this.totalAcquired = featureTotal.reduce((a, b) => a + b, 0);

      this.acquisitionRateInsightsChart = this.exploreChartService.getAcquisitionRateInsightsChart(acquisitionRateInsightsChartData);
    });
  }

}
