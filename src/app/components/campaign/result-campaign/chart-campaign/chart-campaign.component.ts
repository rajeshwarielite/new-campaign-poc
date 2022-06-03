import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { chart } from 'highcharts';
import { ChartCampaignService } from 'src/app/services/chart-campaign.service';
import { SaveCampaignModel, SubscriberRevenueDataModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-chart-campaign',
  templateUrl: './chart-campaign.component.html',
  styleUrls: ['./chart-campaign.component.scss']
})
export class ChartCampaignComponent implements OnInit {

  selectedMonth: string = '3';
  activeTab = 'Revenue';

  segmentRevenueChartSelected = false;
  totalRevenueChartSelected = false;
  segmentSubscriberChartSelected = false;
  totaltSubscriberChartSelected = false;

  segmentRevenueChartAvailable = false;
  totalRevenueChartAvailable = false;
  segmentSubscriberChartAvailable = false;
  totaltSubscriberChartAvailable = false;

  segmentRevenue = '';
  totalRevenue = '';
  segmentSubscribers = '';
  totaltSubscribers = '';

  segmentRevenueChart = Chart.prototype;
  totalRevenueChart = Chart.prototype;
  segmentSubscriberChart = Chart.prototype;
  totaltSubscriberChart = Chart.prototype;

  segmentRevenueChartData: any[] = [];
  totalRevenueChartData: any[] = [];
  segmentSubscriberChartData: any[] = [];
  totaltSubscriberChartData: any[] = [];

  //@ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService,
    private chartCampaignService: ChartCampaignService) { }

  ngOnInit(): void {
    this.newCampaignService.$saveCampaignModel.subscribe(result => {
      this.saveCampaignModel = result;
      if (result.status === 'In-Progress') {
        this.getRevenue();
      }
    });
  }

  monthChanged() {
    if (this.activeTab === 'Revenue') {
      this.getRevenue();
    }
    if (this.activeTab === 'Subscribers') {
      this.getSubscriber();
    }
  }

  getRevenueTab(): void {
    this.activeTab = 'Revenue';
    this.selectedMonth = '3';
    this.segmentRevenueChart = Chart.prototype;
    this.totalRevenueChart = Chart.prototype;
    this.getRevenue();
  }

  getSubscriberTab(): void {
    this.activeTab = 'Subscribers';
    this.selectedMonth = '3';
    this.segmentSubscriberChart = Chart.prototype;
    this.totaltSubscriberChart = Chart.prototype;
    this.getSubscriber();
  }

  getRevenue(): void {
    this.segmentRevenueChart = Chart.prototype;
    this.totalRevenueChart = Chart.prototype;

    this.newCampaignService.getSegmentRevenue(this.saveCampaignModel.campaignId, this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.segmentRevenueChartAvailable = true;
        this.segmentRevenueChartData = result.data.map(d => {
          return { TimeStamp: this.formatDate(d.timestamp), SegmentRevenue: d.totalRevenue }
        });
        this.segmentRevenue = this.campaignFormatter(result.data.map(d => d.totalRevenue)[result.data.length - 1]);
        this.segmentRevenueChart = this.chartCampaignService.createSegmentRevenuePerformanceChart(result.data);
      } else {
        this.segmentRevenueChartAvailable = false;
      }
    });
    this.newCampaignService.getTotalRevenue(this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.totalRevenueChartAvailable = true;
        this.totalRevenueChartData = result.data.map(d => {
          return { TimeStamp: this.formatDate(d.timestamp), TotalRevenue: d.totalRevenue, PotentialRevenue: d.potentialRevenue }
        });
        this.totalRevenue = this.campaignFormatter(result.data.map(d => d.totalRevenue)[result.data.length - 1]);
        this.totalRevenueChart = this.chartCampaignService.createTotalRevenuePerformanceChart(result.data);
      } else {
        this.totalRevenueChartAvailable = false;
      }
    });
  }

  getSubscriber(): void {
    this.segmentSubscriberChart = Chart.prototype;
    this.totaltSubscriberChart = Chart.prototype;

    this.newCampaignService.getSegmentSubscriber(this.saveCampaignModel.campaignId, this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.segmentSubscriberChartAvailable = true;
        this.segmentSubscriberChartData = result.data.map(d => {
          return { SegmentSubscribers: d.totalSubscribers, TimeStamp: this.formatDate(d.timestamp) }
        });
        this.segmentSubscribers = this.campaignFormatter(result.data.map(d => d.totalSubscribers)[result.data.length - 1]);
        this.segmentSubscriberChart = this.chartCampaignService.createSubscribersPerformanceChart(result.data, 'Segment');
      } else {
        this.segmentSubscriberChartAvailable = false;
      }
    });
    this.newCampaignService.getTotalSubscriber(this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.totaltSubscriberChartAvailable = true;
        this.totaltSubscriberChartData = result.data.map(d => {
          return { SegmentSubscribers: d.totalSubscribers, TimeStamp: this.formatDate(d.timestamp) }
        });
        this.totaltSubscribers = this.campaignFormatter(result.data.map(d => d.totalSubscribers)[result.data.length - 1]);
        this.totaltSubscriberChart = this.chartCampaignService.createSubscribersPerformanceChart(result.data, 'Total');
      } else {
        this.totaltSubscriberChartAvailable = false;
      }
    });
  }

  private formatDate(input: string): string {
    const date = new Date(input);
    return '' + date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear() + '';
  }

  campaignFormatter(value: number, num = 1) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
      return value >= item.value;
    });
    return item ? (value / item.value).toFixed(num).replace(rx, "$1") + item.symbol : "0";
  }

  downloadCsv(chartData: SubscriberRevenueDataModel[], type: string): void {
    this.chartCampaignService.downloadCsvFile(chartData, type);
  }

}
