import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { DataUsageTrendsModel } from '../explore-data/models/explore-data-model';

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
  stackedSubsColors = ['#5ACFEA', '#FF8238', '#0027FF']

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
          return `${this.series.name} <br/> 
                      <b>${dataUsageTrendsData.categories[this.point.x]}: ${Highcharts.numberFormat(
            //@ts-ignore
            this.value, 0, '', ',')} TB</b> <br/>`;
        },
        style: {
          ...this.styleOptions_tooltip
        },
      },
      series: dataUsageTrendsData.series

    });
  }
}
