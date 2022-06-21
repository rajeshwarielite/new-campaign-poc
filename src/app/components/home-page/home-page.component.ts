import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { HomepageService } from 'src/app/services/homepage.service';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor(private loginProviderService: LoginProviderService,
    private homepageService: HomepageService,
    private exploreChartService: ExploreChartService) {
    this.loginProviderService.getToken();
  }
  serviceTierChart: Chart = Chart.prototype;
  newSubscribersChart: Chart = Chart.prototype;
  churnTrendsChart: Chart = Chart.prototype;
  ngOnInit(): void {
    this.homepageService.getServiceTierChart().subscribe(result => {
      this.serviceTierChart = this.exploreChartService.getServiceTierChart(result);
    });
    this.homepageService.getNewSubscribersChart().subscribe(result => {
      this.newSubscribersChart = this.exploreChartService.getNewSubscribersChart(result);
    });
    this.homepageService.getChurnTrendsChart().subscribe(result => {
      this.churnTrendsChart = this.exploreChartService.getChurnTrendsChart(result);
    });
  }

}
