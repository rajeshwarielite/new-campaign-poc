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
