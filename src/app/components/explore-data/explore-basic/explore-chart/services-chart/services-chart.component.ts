import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';

@Component({
  selector: 'app-services-chart',
  templateUrl: './services-chart.component.html',
  styleUrls: ['./services-chart.component.scss']
})
export class ServicesChartComponent implements OnInit {

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }
  servicesBlockedThreatsInsightsChart: Chart = Chart.prototype;
  servicesBlockedThreatsInsightsData: any;
  ngOnInit(): void {
    this.refreshSubscriber();
    this.exploreDataService.areaFilterProvider$.subscribe(() => {
      this.refreshSubscriber();
    });

  }
  refreshSubscriber(): void {
    this.exploreDataService.getServicesBlockedThreatsInsightsChart().subscribe(result => {
      this.servicesBlockedThreatsInsightsChart.destroy();
      if (result.length) {
        this.servicesBlockedThreatsInsightsData = result;
        this.servicesBlockedThreatsInsightsChart = this.exploreChartService.getservicesBlockedThreatsInsightsChart(result);
      }
    });
  }
  downloadChannelCsv(): void {
    this.exploreDataService.downloadCsvFile(this.servicesBlockedThreatsInsightsData, 'Blocked Threats Insights');
  }

}
