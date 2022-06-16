import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';

@Component({
  selector: 'app-retention-chart',
  templateUrl: './retention-chart.component.html',
  styleUrls: ['./retention-chart.component.scss']
})
export class RetentionChartComponent implements OnInit {
  churnRateInsightsChart: Chart = Chart.prototype;
  totalAcquired = 0;

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }
  retentionChartDataCSV: any;

  ngOnInit(): void {
    this.refreshSubscriber();
    this.exploreDataService.areaFilterProvider$.subscribe(() => {
      this.refreshSubscriber();
    });
  }
  refreshSubscriber(): void {
    this.exploreDataService.getRetentionChurnRateInsightsChart().subscribe(result => {
      this.retentionChartDataCSV = result;
      const retentionChartData = new Map<string, Map<string, number[]>>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        const innerMap = new Map<string, number[]>();
        m[key].forEach(n => {
          const innerKey = Object.keys(n)[0];
          innerMap.set(innerKey, n[innerKey]);
        })
        retentionChartData.set(key, innerMap);
      });
      const featureTotal = Array.from(retentionChartData.keys()).map(c => this.exploreChartService.getFeatureTotal(retentionChartData, c));
      this.totalAcquired = featureTotal.reduce((a, b) => a + b, 0);
      this.churnRateInsightsChart = this.exploreChartService.getchurnRateInsightsChart(retentionChartData)
    });
  }
  downloadChannelCsv(): void {
    this.exploreDataService.downloadCsvFile(this.retentionChartDataCSV, 'Churn Rate & Insights');
  }

}
