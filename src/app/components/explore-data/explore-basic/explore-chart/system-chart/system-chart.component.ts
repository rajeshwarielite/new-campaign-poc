import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';
@Component({
  selector: 'app-system-chart',
  templateUrl: './system-chart.component.html',
  styleUrls: ['./system-chart.component.scss']
})
export class SystemChartComponent implements OnInit {

  private systemData: any;
  systemByModelChart: Chart = Chart.prototype;



  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }



  ngOnInit(): void {
    this.refreshSubscriber();
  }
  refreshSubscriber():void{
    this.exploreDataService.getSystemByModelChart().subscribe(result => {
      this.systemData = result;

      const systemChartData: Map<string, number>[] = [];
      result.forEach(m => {
        const keys = Object.keys(m);
        const maps = new Map<string, number>();
        keys.forEach(k => maps.set(k, m[k]));
        systemChartData.push(maps);
      });
      this.systemByModelChart = this.exploreChartService.getsystemByModelChart(systemChartData);
    });
  }
  downloadChannelCsv(): void {
    this.exploreDataService.downloadCsvFile(this.systemData, 'System by Model');
  }

}
