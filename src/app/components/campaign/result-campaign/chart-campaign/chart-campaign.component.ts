import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { SaveCampaignModel } from 'src/app/services/new-campaign/models/new-campaign-models';
import { NewCampaignService } from 'src/app/services/new-campaign/new-campaign.service';

@Component({
  selector: 'app-chart-campaign',
  templateUrl: './chart-campaign.component.html',
  styleUrls: ['./chart-campaign.component.scss']
})
export class ChartCampaignComponent implements OnInit {

  selectedMonth: string = '3';
  activeTab = 'Revenue';

  segmentRevenueChartAvailable = false;
  totalRevenueChartAvailable = false;
  segmentSubscriberChartAvailable = false;
  totaltSubscriberChartAvailable = false;
  segmentRevenueChart = new Chart();
  totalRevenueChart = new Chart();
  segmentSubscriberChart = new Chart();
  totaltSubscriberChart = new Chart();

  //@ts-ignore
  saveCampaignModel: SaveCampaignModel = {};

  constructor(private newCampaignService: NewCampaignService) { }

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

  getRevenue(): void {
    this.activeTab = 'Revenue';
    this.createChart();

    this.newCampaignService.getSegmentRevenue(this.saveCampaignModel.campaignId, this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.segmentRevenueChartAvailable = true;
        //@ts-ignore
        this.segmentRevenueChart.addSeries({ name: 'Campaign Segment Revenue', data: result.data.map(d => [d.timestamp, d.totalRevenue]), color: '#0d6efd' }, true, false);
        //@ts-ignore
        this.segmentRevenueChart.addSeries({ name: 'Campaign Segment Revenue - Not Opted Out', data: result.data.map(d => [d.timestamp, d.totalNonOptOutRevenue]), color: '#0d6efd' }, true, false);
      } else {
        this.segmentRevenueChartAvailable = false;
      }
    });
    this.newCampaignService.getTotalRevenue(this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.totalRevenueChartAvailable = true;
        //@ts-ignore
        this.totalRevenueChart.addSeries({ name: 'Campaign Segment Revenue', data: result.data.map(d => [d.timestamp, d.totalRevenue]), color: '#0d6efd' }, true, false);
        //@ts-ignore
        this.totalRevenueChart.addSeries({ name: 'Campaign Segment Revenue - Not Opted Out', data: result.data.map(d => [d.timestamp, d.totalNonOptOutRevenue]), color: '#0d6efd' }, true, false);
      } else {
        this.totalRevenueChartAvailable = false;
      }
    });
  }

  getSubscriber(): void {
    this.activeTab = 'Subscribers';
    this.createChart();

    this.newCampaignService.getSegmentSubscriber(this.saveCampaignModel.campaignId, this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.segmentSubscriberChartAvailable = true;
        //@ts-ignore
        this.segmentSubscriberChart.addSeries({ name: 'Total Subscribers', data: result.data.map(d => [d.timestamp, d.totalSubscribers]) }, true, false);
      } else {
        this.segmentSubscriberChartAvailable = false;
      }
    });
    this.newCampaignService.getTotalSubscriber(this.selectedMonth).subscribe(result => {
      if (result && result.data && result.data.length > 0) {
        this.totaltSubscriberChartAvailable = true;
        //@ts-ignore
        this.totaltSubscriberChart.addSeries({ name: 'Total Subscribers', data: result.data.map(d => [d.timestamp, d.totalSubscribers]) }, true, false);
      } else {
        this.totaltSubscriberChartAvailable = false;
      }
    });
  }

  createChart(): void {
    this.segmentRevenueChart = new Chart({
      chart: {
        type: 'line',
        animation: false,
      },
      title: {
        text: 'Segment Revenue'
      },
      xAxis: {
      },
      yAxis: {
        title: {
          text: 'Revenue ($)'
        }
      },
      series: []
    });

    this.totalRevenueChart = new Chart({
      chart: {
        type: 'line',
        animation: false,
      },
      title: {
        text: 'Total Revenue'
      },
      xAxis: {

      },
      yAxis: {
        title: {
          text: 'Revenue ($)'
        }
      },
      series: []
    });

    this.segmentSubscriberChart = new Chart({
      chart: {
        type: 'line',
        animation: false,
      },
      title: {
        text: 'Segment Subscribers'
      },
      xAxis: {
      },
      yAxis: {
        title: {
          text: 'Subscribers'
        }
      },
      series: []
    });

    this.totaltSubscriberChart = new Chart({
      chart: {
        type: 'line',
        animation: false,
      },
      title: {
        text: 'Total Subscribers'
      },
      xAxis: {
      },
      yAxis: {
        title: {
          text: 'Subscribers'
        }
      },
      series: []
    });
  }

}
