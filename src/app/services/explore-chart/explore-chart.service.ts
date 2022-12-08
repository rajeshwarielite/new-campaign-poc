import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { DataUsageTrendsModel, HeatMapModel } from '../explore-data/models/explore-data-model';
import * as moment from 'moment';
import Heatmap from 'highcharts/modules/heatmap.js';
Heatmap(Highcharts);

@Injectable({
  providedIn: 'root'
})
export class ExploreChartService {
  stackedAqiteColors = ['#0027FF', '#FF489D', '#FF8238', '#B926F0', '#F7C343', '#5ACFEA', '#836ee8', '#ff8238', '#029a7c', '#f7c343', '#ff489d', '#28527a', '#5ACFEA', '#e9896a', '#b3d974', '#5ACFEA', '#5ACFEA', '#FF8238'
    , '#ff96c5', '#ffcccd', '#efdeco', '#DB7093', '#DA70D6', '#D8BFD8', '#DDA0DD', '#9370DB', '#FFC0CB', '#7B68EE', '#5F9EA0', '#2F4F4F', '#66CDAA', '#3CB371', '#90EE90', '#6B8E23', '#BDB76B', '#FFE4B5', '#CD853F', '#E9967A',
    '#A52A2A', '#DC143C', '#FF00FF', '#800080', '#00CED1', '#00FF00', '#FF8C00', '#D2691E', '#FF4500', '#B22222', '#FFA500', '#800000', '#008B45', '#36648B', '#551011', '#551A8B', '#543948', '#A6D785', '#A5435C', '#B3C95A', '#C71585',
    '#DCA2CD', '#EECBAD', '#FFC125', '#ADEAEA', '#9F9F5F', '#8C1717', '#8B6508', '#86C67C', '#7FFFD4', '#4DBD33']
  commonHighChartOptions = {
    exporting: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    title: {
      text: ''
    },

    responsive: {
      rules: [{
        condition: {
        },
        chartOptions: {
          chart: {
            color: '#4c4c4c'
          },
          subtitle: {
            text: null
          },
          navigator: {
            enabled: false
          }
        }
      }]
    }
  };
  plotOptions = {
    stacking: 'normal',
    series: {
      allowPointSelect: true,
    },
    states: {
      inactive: {
        enabled: false
      },
      select: {
        color: null,
        borderWidth: 7,
        borderColor: 'rgb(170, 170, 170)'
      }
    }
  }
  selectOptions = {
    enabled: true,
    color: '',
    borderWidth: 2,
    borderColor: '#AAAAAA'
  }
  styleOptions = {
    fontFamily: 'Source Sans Pro,Regular',
    fontSize: '14px',
    color: '#1A1F22',
    fontStyle: "normal",
    lineHeight: '18px'
  }
  styleOptions_legendtext = {
    fontFamily: 'Source Sans Pro,Regular',
    fontSize: '14px',
    color: '#1A1F22',
    fontStyle: "normal",
    lineHeight: '18px'
  }
  styleOptions_xaxis = {
    fontFamily: 'Source Sans Pro,Regular',
    fontSize: '14px',
    color: '#1A1F22',
    fontStyle: "normal",
    lineHeight: '18px'
  }
  styleOptions_yaxis = {
    fontFamily: 'Source Sans Pro,Regular',
    fontSize: '14px',
    color: '#1A1F22',
    fontStyle: "normal",
  }
  styleOptions_tooltip =
    {
      fontFamily: 'Source Sans Pro,Regular',
      fontSize: '14px',
      color: '#1A1F22',
      fontStyle: "normal",
    }
  xAxisLabels = {
    style: {
      fontFamily: 'Source Sans Pro,Regular',
      fontSize: '14px',
      color: '#1A1F22',
      fontStyle: "normal",
    },
    autoRotationLimit: 40
  }
  linePlotOptions = {
    states: {
      inactive: {
        enabled: false
      }
    }
  }
  stackedSubsColors = ['#5ACFEA', '#FF8238', '#0027FF'];
  pieChartColurs = ['#84bbf8', '#a3a5ed', '#b3d974', '#fd9e4c', '#fc6784'];

  constructor() { }

  getSubscriberDataUsageChart(data: Map<string, number>, totalSubscribers: number): Chart {

    const dataSeries: any[] = [];
    data.forEach(m => dataSeries.push({ 'y': m }));

    return new Chart({
      ...this.commonHighChartOptions,
      colors: ['#0027FF'],
      chart: {
        type: 'column',
        inverted: false, // default
        style: {
          ...this.styleOptions
        },
        events: {

        }
      },
      title: {
        text: 'Active Subscribers: ' + totalSubscribers
      },
      xAxis: {
        categories: Array.from(data.keys()),
        crosshair: true,
        labels: {
          ...this.xAxisLabels,
          style: {
            ...this.styleOptions_xaxis
          },
          rotation: -25
        },
        title: {
          useHTML: true,
          text: `<p class="giga-text" id="giga" style="font-size:12px !important;margin-top:5px;">Usage</p>`,
          align: 'middle',

          style: {
            stacking: 'normal',
            ...this.styleOptions
          },

        },
      },
      yAxis: {
        min: 0,
        softMax: 1,
        allowDecimals: false,
        labels: {
          formatter: function () {
            var label = this.axis.defaultLabelFormatter.call(this);
            // Use thousands separator for four-digit numbers too
            if (/^[0-9]{4,}$/.test(label)) {
              //@ts-ignore
              return Highcharts.numberFormat(this.value, 0);
            }
            return label;
          },
          style: {
            ...this.styleOptions_yaxis
          },
        },
        reversedStacks: false,
        title: {
          style: {
            ...this.styleOptions_legendtext
          },
          text: 'Subscribers'
        },
        stackLabels: {
          enabled: true,
          allowOverlap: true,
          formatter: function () {
            try {
              let totalDivider = totalSubscribers / 100;
              return Highcharts.numberFormat(this.total / (totalDivider == 0 ? 1 : totalDivider), 1) + '%';
            } catch (err) {
              console.error(err);
            }
            return '';
          },
          style: {
            stacking: 'normal',
            ...this.styleOptions_legendtext
          }
        }
      },
      tooltip: {
        formatter: function () {
          //@ts-ignore
          return ` ${this.key}  Usage <br/> <b>${Highcharts.numberFormat(this.y, 0, '', ',')}  Subscribers ( ${Highcharts.numberFormat(this.total / (totalSubscribers / 100), 1) + '%'}) </b>`;
        },
        style: {
          ...this.styleOptions_tooltip
        },
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          //@ts-ignore
          maxPointWidth: 24,
          borderRadius: 0,
          cursor: 'pointer',
          point: {
            events: {

            }
          },
          states: {
            inactive: {
              enabled: false
            },
            select: {
              ...this.selectOptions,
            }
          },
        },
        column: {
          stacking: 'normal',
          minPointLength: 3,
          borderWidth: 0,
          dataLabels: {
            enabled: false
          }
        }
      },
      legend: {
        reversed: false,
        itemStyle: {
          ...this.styleOptions
        }
      },
      series: [{
        showInLegend: false,
        data: dataSeries,
        type: 'column'
      },
      ],
    });
  }

  getServiceTierChart(data: DataUsageTrendsModel): Chart {

    const totalsubs = Object.values(data.totals).reduce((a: any, b: any) => a + b, 0);

    return new Chart(
      {
        ...this.commonHighChartOptions,
        colors: this.stackedAqiteColors,
        chart: {
          type: 'column',
          style: {
            ...this.styleOptions
          },
        },
        xAxis: {
          categories: data.categories,
          labels: {
            ...this.xAxisLabels,
            style: {
              ...this.styleOptions_xaxis
            },
          },
        },
        legend: {
          reversed: false,
          itemStyle: {
            ...this.styleOptions
          }
        },
        tooltip: {
          formatter: function () {
            return this.series.xAxis.categories[this.point.x] + ' ' + 'Total' + ': ' + Highcharts.numberFormat(data.totals[this.key as unknown as string], 0, '', ',') +
              ' (' + Highcharts.numberFormat(data.totals[this.key as unknown as string] / (totalsubs / 100), 1) + '%' + ')<br>' +
              '<b>' + this.series.name + ': ' + Highcharts.numberFormat(this.point.y as number, 0, '', ',') + ' (' +
              Highcharts.numberFormat(this.point.y as number / (data.totals[this.key as unknown as string] / 100), 1) + '%)</b><br>';
          },
          style: {
            ...this.styleOptions_tooltip
          }
        },
        plotOptions: {
          series: {
            ...this.plotOptions,
            allowPointSelect: true,
            // @ts-ignore
            maxPointWidth: 24,
            cursor: 'pointer',
            point: {
              events: {}
            },
            states: {
              inactive: {
                enabled: false
              },

            },
          },
          column: {
            borderWidth: 0,
            minPointLength: 3,
          }
        },
        // @ts-ignore
        series: data.series,
        yAxis: {
          min: 0,
          softMax: 1,
          title: {
            text: 'Subscribers',
            style: {
              stacking: 'normal',
              ...this.styleOptions
            },
          },
          labels:
          {
            formatter: function () {
              var label = this.axis.defaultLabelFormatter.call(this);
              // Use thousands separator for four-digit numbers too
              if (/^[0-9]{4,}$/.test(label)) {
                return Highcharts.numberFormat(this.value as number, 0);
              }
              return label;
            },
            style: {
              ...this.styleOptions_yaxis
            },
          },
          gridLineColor: '#E6E6E6',
          stackLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function () {
              return Highcharts.numberFormat((this.total / (totalsubs / 100)), 1) + '%';
            },
            style: {
              ...this.styleOptions
            },
          },
          reversedStacks: false,
        },
      }

    );
  }
  getNewSubscribersChart(result: Map<string, Map<string, number[]>>): Chart {
    const featureTotal = Array.from(result.keys()).map(c => this.getFeatureTotal(result, c));
    const categories = Array.from(result.keys()).map(c => this.getMonthName(c));

    return new Chart(
      {
        ...this.commonHighChartOptions,
        chart: {
          type: 'line',
          style: {
            ...this.styleOptions
          }
        },
        colors: ['#0027ff'],
        xAxis: {
          categories: categories,
          labels: { ...this.xAxisLabels },
        },
        yAxis: {
          min: 0,
          softMax: 1,
          allowDecimals: false,
          title: {
            text: 'Subscribers',
            style: {
              stacking: 'normal',
              ...this.styleOptions_yaxis
            },
          },
          labels:
          {
            formatter: function () {
              var label: any = this.axis.defaultLabelFormatter.call(this);
              // Use thousands separator for four-digit numbers too
              if (/^[0-9]{4,}$/.test(label)) {
                return Highcharts.numberFormat(this.value as number, 0);
              }
              return label;
            },
            style: {
              ...this.styleOptions
            }
          },
        },
        legend: {
          reversed: false,
          itemStyle: {
            ...this.styleOptions
          }
        },
        plotOptions: {
          ...this.linePlotOptions,
          series: {
            marker: {
              enabled: false
            },
            states: {
              inactive: {
                enabled: false
              }
            },
            point: {
              events: {

              }
            }
          }
        },
        tooltip: {
          formatter: function () {
            return `${categories[this.point.x]}: <b>${Highcharts.numberFormat(this.point.y as number, 0, '', ',')} Subscribers</b> <br/>`;
          },
          style: {
            ...this.styleOptions_tooltip
          }
        },
        series: [{
          showInLegend: false,
          //@ts-ignore
          data: featureTotal
        }]

      }
    );
  }

  getSubscriberUsageDataTrendsChart(dataUsageTrendsData: DataUsageTrendsModel): Chart {

    dataUsageTrendsData.series.forEach(s => {
      s.data = s.data.map(d => d / 1024)
    })

    return new Chart({
      ...this.commonHighChartOptions,
      chart: {
        type: 'line',
        style: {
          ...this.styleOptions
        },
      },
      colors: this.stackedSubsColors,
      xAxis: {
        categories: dataUsageTrendsData.categories,
        labels: {
          ...this.xAxisLabels,
          style: {
            ...this.styleOptions_xaxis
          }
        },
      },
      yAxis: {
        min: 0,
        softMax: 1,
        allowDecimals: false,
        title: {
          text: 'Usage',
          style: {
            stacking: 'normal',
            ...this.styleOptions_yaxis
          },
        },
        labels:
        {
          formatter: function () {
            var label = this.axis.defaultLabelFormatter.call(this);
            // Use thousands separator for four-digit numbers too
            if (/^[0-9]{4,}$/.test(label)) {
              return Highcharts.numberFormat(parseFloat(this.value.toString()), 0);
            }
            return label;
          }
        },
        //@ts-ignore
        style: {
          ...this.styleOptions_yaxis
        },
      },
      legend: {
        reversed: false,
        itemStyle: {
          ...this.styleOptions
        }
      },
      plotOptions: {
        ...this.linePlotOptions,
        series: {
          marker: {
            enabled: false
          },
          states: {
            inactive: {
              enabled: false
            }
          },
          point: {
            events: {

            }
          }
        }
      },
      tooltip: {
        formatter: function () {
          //@ts-ignore
          return `${this.series.name} <br/><b>${dataUsageTrendsData.categories[this.point.x]}:${Highcharts.numberFormat(this.point.y, 0, '', ',')} TB</b> <br/>`;
        },
        style: {
          ...this.styleOptions_tooltip
        },
      },
      //@ts-ignore
      series: dataUsageTrendsData.series

    });
  }
  getservicesBlockedThreatsInsightsChart(data: [{ WG: number }, { AV: number }, { IPS: number }]): Chart {
    return new Chart({
      colors: this.pieChartColurs,
      chart: {
        type: 'pie',
        style: {
          ...this.styleOptions
        },
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: '',

      },
      accessibility: {
        announceNewData: {
          enabled: true
        },
        point: {
          valueSuffix: '%'
        }
      },
      legend: {
        reversed: false,
        itemStyle: {
          ...this.styleOptions_legendtext
        }
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          point: {
            events: {}
          },
          states: {
            inactive: {
              enabled: false
            },
            select: {
              ...this.selectOptions,
            }
          },

          dataLabels: {
            enabled: true,
            format: '{point.name}',

          },

        },
        pie: {
          size: '100%',
          allowPointSelect: true,
          cursor: 'pointer',
          //@ts-ignore
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            //useHTML: true,
            crop: false,
            distance: 10,
            overflow: "visible",
            style: {
              width: '100px',
              color: '#4c4c4c',
              fontSize: '12px',
            },

          },
        }
      },

      tooltip: {
        headerFormat: '{series.name}',
        pointFormat: '{point.key}<br><b>{point.name}: {point.percentage:.1f}%</b><br><b>{point.y}</b>',
        style: {
          ...this.styleOptions_tooltip
        }
      },

      series: [
        //@ts-ignore
        {
          name: 'Total Number of Threats',
          colorByPoint: true,
          data: [
            { name: 'Web Threats', y: data[0].WG },
            { name: 'Virus', y: data[1].AV },
            { name: 'Intrusions', y: data[2].IPS },
          ]
        }
      ],

    });
  }

  getusagebyApplicationTypeChart(data: Map<string, number>): Chart {
    return new Chart({
      colors: this.pieChartColurs,
      chart: {
        type: 'pie',
        style: {
          ...this.styleOptions
        },
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      accessibility: {
        announceNewData: {
          enabled: true
        },
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          point: {
            events: {}
          },
          states: {
            inactive: {
              enabled: false
            },
            select: {
              ...this.selectOptions,
            }
          },
          dataLabels: {
            enabled: true,
            format: '{point.name}'
          },
        },
        pie: {
          size: '80%',
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 0,
          //@ts-ignore
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            //useHTML: true,
            crop: false,
            distance: 2,
            overflow: "visible",
            style: {
              width: '70px',
              height: '100px',
              ...this.styleOptions_legendtext
            }
          },
        }
      },
      tooltip: {
        formatter: function () {
          let arrayofUsage: Array<any> = [];
          data.forEach(el => {
            arrayofUsage.push(el);
          });
          // let unscalled = true;
          let scaleUnit = 'TB'
          let usage = this.point.y;
          //@ts-ignore
          usage = usage / 1024 | 0;
          return ` Application Group <br/>
                      <b>${this.point.name}: ${arraysObjectsPercentageCalculator(arrayofUsage, data.get(this.point.name), 1)} % </b> <br/> 
                      <b> ${Highcharts.numberFormat(usage / 10, 1, '.', ',')} ${scaleUnit}</b>`;
        },
        style: {
          ...this.styleOptions_tooltip,
          opacity: 1
        }
      },
      legend: {
        reversed: false,
        align: 'center',
        itemStyle: {
          fontSize: '10px',
        }
      },
      series: [
        //@ts-ignore
        {
          // name: "",
          colorByPoint: true,
          // data: result
          //@ts-ignore
          data: Array.from(data.keys()).map(d => {
            return { name: d, y: data.get(d) };
          })
        }
      ],
    });

  }

  getheatMapChart(result: HeatMapModel): Chart {
    return new Chart(
      {
        ...this.commonHighChartOptions,
        chart: {
          plotBorderWidth: 1,
          style: {
            ...this.styleOptions
          },
        },
        className: 'heat-map',
        legend: {
          enabled: false,
          reversed: false,
          itemStyle: {
            ...this.styleOptions
          }
        },
        xAxis: {
          categories: ['00 AM', '02', '04', '06', '08', '10', '12 PM', '14', '16', '18', '20', '22', '24'],
          type: 'datetime',
          labels: {
            autoRotationLimit: 80,
            style: {
              ...this.styleOptions_xaxis
            }
          },
          title: {
            useHTML: true,
            text: `<p class="gmt-text gmttext-app-tz" id="gmt-text">Time <span>(${this.timezoneCreator()})</span></p>`,
            align: 'low',
            style: {
              stacking: 'normal',
              ...this.styleOptions_legendtext
            },
          }
        },
        yAxis: {
          categories: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday ', 'Friday ', 'Saturday'],
          reversed: true,
          labels: {
            align: 'left',
            reserveSpace: true,
            style: {
              ...this.styleOptions_yaxis,
            }
          },
          //@ts-ignore
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
        },
        colorAxis: {
          min: 0,
          max: 100,
          stops: [
            [0, '#fefefe'],
            [0.01, '#fafcfd'],
            [0.10, '#dcebf3'],
            [0.11, '#daeaf2'],
            [0.20, '#c7dbe9'],
            [0.21, '#d0dee8'],
            [0.30, '#b4cce0'],
            [0.31, '#b0c9df'],
            [0.40, '#a0bdd7'],
            [0.41, '#aec3d9'],
            [0.49, '#6984ba'],
            [0.50, '#f3df8f'],
            [0.51, '#f0e0a3'],
            [0.60, '#e9ba79'],
            [0.61, '#e9b672'],
            [0.70, '#df9257'],
            [0.71, '#de8f55'],
            [0.80, '#ce7a50'],
            [0.81, '#ca6a3a'],
            [0.90, '#b84822'],
            [0.99, '#b74620'],
            [1, '#b74620']
          ],

        },
        tooltip: {
          formatter: function () {
            return `<b> ${this.series.yAxis.categories[this.point.y as number]}<b> <br/> 
                        Hours  <b> ${this.series.xAxis.categories[this.point.x]} - ${this.series.xAxis.categories[this.point.x + 1]}</b> <br/>  
                        <b> ${this.point.value} % </b> of Subscribers  `;
          },
          style: {
            ...this.styleOptions_tooltip
          }
        },

        series: [{
          type: 'heatmap',
          //@ts-ignore
          animation: {
            defer: 1000
          },
          data: result.data,
          dataLabels: {
            enabled: false,
          }
        }],
        plotOptions: {
          series: {
            point: {
              events: {

              }
            }
          }
        },

      }
    );
  }

  timezoneCreator() {
    // attempt to get short Timezone, fallback to full name, extra fallback to UTC.
    let timeZone: any;
    let date = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' });
    // let date = 'Fri Dec 17 2021 14:59:07 GMT+0530'

    if (date && date.split(' ').length > 2) {
      if (date.split(' ')[2] == 'GMT-3:30') {
        timeZone = 'NST'
      } else {
        timeZone = date.split(' ')[2];
      }
      // console.log(timeZone, '11111****')
    } else if (Intl && Intl.DateTimeFormat() && Intl.DateTimeFormat().resolvedOptions() && Intl.DateTimeFormat().resolvedOptions().timeZone) {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // console.log(timeZone, '11222****')
    } else {
      timeZone = moment().format("Z");
    }
    return timeZone;
  }
  getchurnRateInsightsChart(result: Map<string, Map<string, number[]>>): Chart {

    const seriesNames = Array.from(new Set(Array.from(result.keys()).map(k =>
      //@ts-ignore
      Array.from(result.get(k).keys())
    ).flat()));

    const featureTotal = Array.from(result.keys()).map(c => this.getFeatureTotal(result, c));
    const existingTotal = Array.from(result.keys()).map(c => this.getExistingTotal(result, c));

    const series = seriesNames.map(s => this.getChurnSeries(result, s));
    const existingSeries = seriesNames.map(s => this.getExistingSeries(result, s));

    console.log(Array.from(result.keys()));

    return new Chart(
      {
        ...this.commonHighChartOptions,
        colors: this.stackedAqiteColors,
        chart: {
          type: 'column',
          style: {
            ...this.styleOptions
          },
        },
        xAxis: {
          categories: Array.from(result.keys()).map(c => this.getMonthName(c)),
          labels: {
            ...this.xAxisLabels,
            style: {
              ...this.styleOptions_xaxis
            },
          },
        },
        legend: {
          reversed: false,
          itemStyle: {
            ...this.styleOptions
          }
        },
        tooltip: {
          formatter: function () {
            let percent = existingTotal[this.point.x] != 0 ? ' (' + Highcharts.numberFormat((featureTotal[this.point.x] / existingTotal[this.point.x]) * 100, 2) + '%)' : '';
            return this.series.xAxis.categories[this.point.x] + ', ' + this.series.name + percent +
              '<br><b>' + "Churned subscribers" + ': ' + Highcharts.numberFormat(this.point.y as number, 0, '', ',') + '</b><br>' +
              '<b>' + "Existing subscribers" + ':' + Highcharts.numberFormat(existingSeries.find(s => s.name == this.series.name)?.data[this.point.index] as number, 0, '', ',') +
              '</b><br>';
          },
          style: {
            ...this.styleOptions_tooltip
          }
        },
        plotOptions: {
          series: {
            ...this.plotOptions,
            allowPointSelect: true,
            //@ts-ignore
            maxPointWidth: 16,
            cursor: 'pointer',
            point: {
              events: {}
            },
            states: {
              inactive: {
                enabled: false
              },
              select: {
                ...this.selectOptions,
              }
            },
          },
          column: {
            borderWidth: 0,
            minPointLength: 3,
          }
        },
        // series: data.series,
        //@ts-ignore
        series: series,
        //@ts-ignore
        yAxis: {
          min: 0,
          // softMax: 1,
          softMax: 10,
          title: {
            text: 'Subscribers',
            style: {
              stacking: 'normal',
              ...this.styleOptions
            },
          },
          labels:
          {
            formatter: function () {
              //@ts-ignore
              return this.value.toFixed(0) >= 1000 ? (this.value.toFixed(0) / 1000) + 'K' : this.value.toFixed(0);
            },
            style: {
              ...this.styleOptions_yaxis
            },
          },
          gridLineColor: '#E6E6E6',
          stackLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function () {
              return Highcharts.numberFormat((featureTotal[this.x] / existingTotal[this.x]) * 100, 2) + '%';
            },
            style: {
              ...this.styleOptions
            },
          },
          reversedStacks: false,
        }
      },
    )
  }

  getAcquisitionRateInsightsChart(result: Map<string, Map<string, number[]>>): Chart {

    const seriesNames = Array.from(new Set(Array.from(result.keys()).map(k =>
      //@ts-ignore
      Array.from(result.get(k).keys())
    ).flat()));

    const featureTotal = Array.from(result.keys()).map(c => this.getFeatureTotal(result, c));
    const existingTotal = Array.from(result.keys()).map(c => this.getExistingTotal(result, c));

    const series = seriesNames.map(s => this.getChurnSeries(result, s));
    const existingSeries = seriesNames.map(s => this.getExistingSeries(result, s));

    console.log(Array.from(result.keys()));

    return new Chart(
      {
        ...this.commonHighChartOptions,
        colors: this.stackedAqiteColors,
        chart: {
          type: 'column',
          style: {
            ...this.styleOptions
          },
        },
        xAxis: {
          categories: Array.from(result.keys()).map(c => this.getMonthName(c)),
          labels: {
            ...this.xAxisLabels,
            style: {
              ...this.styleOptions_xaxis
            },
          },
        },
        legend: {
          reversed: false,
          itemStyle: {
            ...this.styleOptions
          }
        },
        tooltip: {
          formatter: function () {
            return ` ${this.series.xAxis.categories[this.point.x]}, ${this.series.name} <br/><b>Acquired Subscribers:   ${Highcharts.numberFormat(this.point.y as number, 0, '', ',')}</b><br/> 
                            <b>Total Acquired Subscribers:  ${Highcharts.numberFormat(featureTotal[this.point.x], 0, '', ',')} </b> <br/> 
                            <b>Existing Subscribers:  ${Highcharts.numberFormat(existingSeries.find(s => s.name == this.series.name)?.data[this.point.index] as number, 0, '', ',')}  </b>    `;
          },
          style: {
            ...this.styleOptions_tooltip
          }
        },
        plotOptions: {
          series: {
            ...this.plotOptions,
            allowPointSelect: true,
            //@ts-ignore
            maxPointWidth: 16,
            cursor: 'pointer',
            point: {
              events: {}
            },
            states: {
              inactive: {
                enabled: false
              },
              select: {
                ...this.selectOptions,
              }
            },
          },
          column: {
            borderWidth: 0,
            minPointLength: 3,
          }
        },
        // series: data.series,
        //@ts-ignore
        series: series,
        //@ts-ignore
        yAxis: {
          min: 0,
          // softMax: 1,
          softMax: 10,
          title: {
            text: 'Subscribers',
            style: {
              stacking: 'normal',
              ...this.styleOptions
            },
          },
          labels:
          {
            formatter: function () {
              var label = this.axis.defaultLabelFormatter.call(this);
              // Use thousands separator for four-digit numbers too
              if (/^[0-9]{4,}$/.test(label)) {
                return Highcharts.numberFormat(this.value as number, 0);
              }
              return label;
            },
            style: {
              ...this.styleOptions_yaxis
            },
          },
          gridLineColor: '#E6E6E6',
          stackLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function () {
              return Highcharts.numberFormat(featureTotal[this.x], 0, '', ',');
            },
            style: {
              ...this.styleOptions
            },
          },
          reversedStacks: false,
        }
      },
    )
  }

  getFeatureTotal(result: Map<string, Map<string, number[]>>, key: string): number {
    let response = 0;

    const some = result.get(key);
    some?.forEach(r => {
      if (r && r.length) {
        response = response + r[0];
      }
    });

    return response;
  }
  getExistingTotal(result: Map<string, Map<string, number[]>>, key: string): number {
    let response = 0;

    const some = result.get(key);
    some?.forEach(r => {
      if (r && r.length) {
        response = response + r[1];
      }
    });

    return response;
  }
  getMonthName(ym: string): string {
    const y = ym.split('-')[0].substring(2, 4);
    const m = parseInt(ym.split('-')[1]);
    const mName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];

    return mName + '-' + y;
  }
  getChurnSeries(result: Map<string, Map<string, number[]>>, key: string): { name: string, data: number[] } {
    let response: { name: string, data: number[] } = { name: key, data: [] };
    result.forEach(r => {
      const numlist = r.get(key);
      if (numlist && numlist.length) {
        response.data.push(numlist[0]);
      }
    })

    return response;
  }
  getExistingSeries(result: Map<string, Map<string, number[]>>, key: string): { name: string, data: number[] } {
    let response: { name: string, data: number[] } = { name: key, data: [] };
    result.forEach(r => {
      const numlist = r.get(key);
      if (numlist && numlist.length) {
        response.data.push(numlist[1]);
      }
    })

    return response;
  }

  /* getAcquisitionRateInsightsChart(result: [{ [key: string]: [{ [key: string]: number[] }] }]): Chart {
    return new Chart({
      ...this.commonHighChartOptions,
      colors: this.stackedAqiteColors,
      chart: {
        type: 'column',
        style: {
          ...this.styleOptions
        },
      },
      xAxis: {
        categories: category,
        labels: {
          ...this.xAxisLabels,
          style: {
            ...this.styleOptions_xaxis
          }
        },
      },
      yAxis: {
        min: 0,
        softMax: 1,
        allowDecimals: false,
        reversedStacks: false,
        labels:
        {
          style: {
            ...this.styleOptions_yaxis
          },
        },
        title: {
          text: this.language.Subscribers,
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
          labels:
          {
            formatter: function () {
              var label = this.axis.defaultLabelFormatter.call(this);
              // Use thousands separator for four-digit numbers too
              if (/^[0-9]{4,}$/.test(label)) {
                return Highcharts.numberFormat(this.value, 0);
              }
              return label;
            },
            style: {
              ...this.styleOptions_yaxis
            }
          },
        },

        stackLabels: {
          enabled: true,
          allowOverlap: true,
          formatter: function () {
            return Highcharts.numberFormat(data.categoryFeatureTotal[this.x], 0, '', ',');
          },
          style: {
            stacking: 'normal',
            ...this.styleOptions
          }
        },
      },
      legend: {
        // width: 300,
        fontSize: '10px',
        reversed: false,
        align: 'center',
        itemStyle: {
          ...this.styleOptions
        }
      },
      tooltip: {
        formatter: function () {
          return ` ${category[this.point.x]}, ${this.series.name} <br/>                             <b>Acquired Subscribers:   ${Highcharts.numberFormat(this.point.y, 0, '', ',')}</b> <br/> 
                      <b>Total Acquired Subscribers:  ${Highcharts.numberFormat(data.categoryFeatureTotal[this.point.x], 0, '', ',')} </b> <br/> 
                      <b>Existing Subscribers:  ${Highcharts.numberFormat(data.totalObj[this.series.name][this.point.x], 0, '', ',')}  </b>    `;
        },
        style: {
          ...this.styleOptions_tooltip
        }
      },
      plotOptions: {
        series: {
          ...this.plotOptions,
          allowPointSelect: true,
          maxPointWidth: 16,
          cursor: 'pointer',
          point: {
            events: {}
          },
          states: {
            inactive: {
              enabled: false
            },
            select: {
              ...this.selectOptions,
            }
          },
        },
        column: {
          minPointLength: 3,
          borderWidth: 0,
        }
      },
      series: this.data_RateInsight_series
    }

    );
  }*/
  getsystemByModelChart(result: Map<string, number>[]): Chart {
    const categories = result.map(r => new Date(r.get('time') as number).toLocaleDateString('en-US')).reverse();
    result.forEach(r => r.delete('time'));
    const seriesNames = new Set(result.map(r => Array.from(r.keys())).flat());
    const series = Array.from(seriesNames).map(s => {
      return { name: s, data: result.map(r => r.get(s)).reverse() }
    });
    return new Chart({
      ...this.commonHighChartOptions,
      credits: {
        enabled: false
      },
      chart: {
        type: 'line',
        style: {
          fontFamily: 'Source Sans Pro,Regular',
          fontSize: '12px',
          color: '#4c4c4c'
        },
        plotBorderWidth: 1,
      },
      colors: ['#0027FF', '#5ACFEA', '#B926F0', '#FF8238', '#029A7C', '#F7C343', '#FF489D', '#F7500F'],
      title: {
        text: ''
      },
      xAxis: [{
        min: 0,
        gridLineWidth: 1,
        categories: categories,
        //tickInterval: 5,
        tickmarkPlacement: 'on',
        tickInterval: (function () {
          let sLength = result.length;
          let xCategLength = categories.length;
          let xAxisLen = Math.floor(xCategLength / sLength);
          let f = 1;
          if (xCategLength <= 6) {
            f = 1;
          } else if (xCategLength > 6 && xCategLength < 13) {
            f = 2;
          } else {
            f = Math.floor(xCategLength / 6) ? Math.floor(xCategLength / 6) : 1;
          }
          return f;
        })(),
        //crosshair: true,
        labels: {
          rotation: -25
        }
      }],
      yAxis: [
        { // Primary yAxis
          min: 0,
          softMax: 1,
          allowDecimals: false,

          title: {
            text: 'Systems',
            style: {
              color: '#727272'
            }
          },
          //@ts-ignore
          style: {
            fontFamily: 'Source Sans Pro,Regular',
            fontSize: '13px',
            color: '#4c4c4c'
          }
        }
      ],
      lang: {
        noData: "No Data Available"
      },
      legend: {
        squareSymbol: true,
        enabled: true
      },
      tooltip: {
        shared: true,
        //@ts-ignore
        crosshairs: true,
        outside: true,
      },
      //@ts-ignore
      series: series,
      plotOptions: {
        series: {
          // ...this.plotOptions,
          cursor: 'pointer',
          //pointPadding: 2, // Defaults to 0.1
          //@ts-ignore
          groupPadding: 0.1,
          marker: {
            enabled: false
          },
          pointPlacement: 'on',
          point: {
            events: {

            }
          }
        },
        states: {
          inactive: {
            enabled: false
          }
        }
      },
      responsive: {
        rules: [{
          condition: {
          },
        }]
      }
    }


    );
  }

}
function arraysObjectsPercentageCalculator(obj: any, value: any, digit?: any): string {
  let numbersArray = obj;
  if (typeof obj == 'object') {
    numbersArray = Object.values(obj);
  }
  const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
  let total: any = numbersArray.reduce(reducer, 0)
  return ((100 * value) / total).toFixed(digit ? digit : 2);
}
