import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { chart } from 'highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';
import { HeatMapModel } from 'src/app/services/explore-data/models/explore-data-model';

@Component({
  selector: 'app-applications-chart',
  templateUrl: './applications-chart.component.html',
  styleUrls: ['./applications-chart.component.scss']
})
export class ApplicationsChartComponent implements OnInit {

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }

  usagebyApplicationTypeChart: Chart = Chart.prototype;
  socialChannelHeatmapChart: Chart = chart.prototype;
  socialChannels: string[] = [];
  selectedChannel = '';

  ngOnInit(): void {
    this.refreshSubscriber();
  }
  refreshSubscriber(): void {
    this.exploreDataService.getApplicationUsageByTypeChart().subscribe(result => {

      const appTypeChartData = new Map<string, number>();
      result.forEach(m => {
        const key = Object.keys(m)[0];
        appTypeChartData.set(key, m[key]);
      });

      this.usagebyApplicationTypeChart = this.exploreChartService.getusagebyApplicationTypeChart(appTypeChartData);

    });
    this.exploreDataService.getApplicationSocials().subscribe(result => {
      result.forEach(m => {
        const key = Object.keys(m)[0];
        this.socialChannels.push(key);
      });
      this.selectedChannel = this.socialChannels[0];
      this.refreshChart();
    });
  }

  refreshChart(): void {
    this.socialChannelHeatmapChart = new Chart();
    this.exploreDataService.getApplicationHeatMapChart(this.selectedChannel).subscribe(result => {
      this.socialChannelHeatmapChart = this.exploreChartService.getheatMapChart(result);
    });

  }

}
