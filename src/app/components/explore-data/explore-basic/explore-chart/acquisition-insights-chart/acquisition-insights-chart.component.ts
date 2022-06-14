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

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }
  acquisitionRateInsightsChart: Chart = Chart.prototype;
  ngOnInit(): void {
    this.exploreDataService.getServiceProviderAcqInsightsChart().subscribe(result=>{
     // this.acquisitionRateInsightsChart=this.exploreChartService.getAcquisitionRateInsightsChart(result);
    });
  }

}
