import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { ChannelNameSizeModel, SubscriberRevenueDataModel } from './new-campaign/models/new-campaign-models';
import { saveAs } from 'file-saver'

@Injectable({
  providedIn: 'root'
})
export class ChartCampaignService {

  private styleOptions = {
    fontFamily: 'Source Sans Pro,Regular',
    fontSize: '12px',
    color: '#4c4c4c'
  };

  private colors = ['#0027FF', '#5ACFEA'];

  private xAxisLabels = {
    style: {
      fontSize: '13px'
    },
    autoRotationLimit: -30
  }

  private plotOptions = {
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
  };

  private linePlotOptions = {
    states: {
      inactive: {
        enabled: false
      }
    }
  };

  constructor() { }

  createCampaignChannelsChart(channelNameSizeModels: ChannelNameSizeModel[]): Chart {
    return new Chart({
      chart: {
        type: 'column',
        animation: false,
        style: this.styleOptions
      },
      colors: this.colors,
      title: {
        text: ''
      },
      xAxis: {
        title: {
          text: 'Channel(s)',
          style: {
            stacking: 'normal',
            ...this.styleOptions
          }
        },
        labels: {
          ...this.xAxisLabels,
          rotation: -30,
          style: {
            ...this.styleOptions
          },
        },
        categories: channelNameSizeModels.map(c => c.channelName)
      },
      yAxis: {
        min: 0,
        softMax: 1,
        allowDecimals: false,
        title: {
          text: 'Segment Members',
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
        },
        labels:
        {
          style: {
            ...this.styleOptions
          },
        },
        gridLineColor: '#E6E6E6',
        stackLabels: {
          enabled: true,
          allowOverlap: true,
          style: {
            ...this.styleOptions
          },
        },

        reversedStacks: false,
      },
      legend: {
        reversed: false,
        itemStyle: {
          ...this.styleOptions
        }
      },
      plotOptions: {
        series: {
          ...this.plotOptions,
          allowPointSelect: false,
          //@ts-ignore
          maxPointWidth: 24,
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
      series: [{
        showInLegend: false,
        //@ts-ignore
        data: channelNameSizeModels.map(c => c.channelSize),
        name: ''
      }],
      tooltip: {
        formatter: function () {
          return `${channelNameSizeModels.map(c => c.channelName)[this.point.x]}: <b>${Highcharts.numberFormat(
            //@ts-ignore
            this.point.y,
            0, '', ',')}</b> <br/>`;
        },
        style: {
          ...this.styleOptions
        }
      },
    });
  }

  createSegmentRevenuePerformanceChart(subscriberRevenueDataModels: SubscriberRevenueDataModel[]): Chart {
    return new Chart({
      chart: {
        type: 'line',
        animation: false,
        style: this.styleOptions
      },
      colors: this.colors,
      title: {
        text: ''
      },
      xAxis: {
        labels: {
          rotation: -30,
        },
        categories: subscriberRevenueDataModels.map(c => this.formatDate(c.timestamp)),
      },
      yAxis: {
        title: {
          text: 'Revenue ($)',
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
        },
        min: 0,
        softMax: 1,
        allowDecimals: false,
        labels:
        {
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
      series: [
        {
          //@ts-ignore
          data: subscriberRevenueDataModels.map(c => c.totalRevenue),
          name: 'Campaign Segment Revenue',
          zoneAxis: 'x',
          lineWidth: 0,
          marker: {
            enabled: true,
            radius: 2
          },
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        },
        {
          //@ts-ignore
          data: subscriberRevenueDataModels.map(c => c.totalNonOptOutRevenue),
          name: 'Campaign Segment Revenue - Not Opted Out',
          zoneAxis: 'x',
          lineWidth: 0,
          marker: {
            enabled: true,
            radius: 2
          },
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        }
      ],
      tooltip: {
        //@ts-ignore
        lang: {
          decimalPoint: '.',
          thousandsSep: ','
        }
      },
    });
  }

  createTotalRevenuePerformanceChart(subscriberRevenueDataModels: SubscriberRevenueDataModel[]): Chart {
    return new Chart({
      chart: {
        type: 'line',
        animation: false,
        style: this.styleOptions
      },
      colors: this.colors,
      title: {
        text: ''
      },
      xAxis: {
        labels: {
          rotation: -30,
        },
        categories: subscriberRevenueDataModels.map(c => this.formatDate(c.timestamp)),
      },
      yAxis: {
        title: {
          text: 'Revenue ($)',
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
        },
        min: 0,
        softMax: 1,
        allowDecimals: false,
        labels:
        {
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
      series: [
        {
          //@ts-ignore
          data: subscriberRevenueDataModels.map(c => c.totalRevenue),
          name: 'Total Revenue',
          zoneAxis: 'x',
          lineWidth: 0,
          marker: {
            enabled: true,
            radius: 2
          },
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        },
        {
          //@ts-ignore
          data: subscriberRevenueDataModels.map(c => c.potentialRevenue),
          name: 'Max Potential Revenue',
          zoneAxis: 'x',
          lineWidth: 0,
          marker: {
            enabled: true,
            radius: 2
          },
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        }
      ],
      tooltip: {
        //@ts-ignore
        lang: {
          decimalPoint: '.',
          thousandsSep: ','
        }
      },
    });
  }

  createSubscribersPerformanceChart(subscriberRevenueDataModels: SubscriberRevenueDataModel[], type: string): Chart {
    return new Chart({
      chart: {
        type: 'line',
        animation: false,
        style: this.styleOptions
      },
      colors: this.colors,
      title: {
        text: ''
      },
      xAxis: {
        labels: {
          rotation: -30,
        },
        categories: subscriberRevenueDataModels.map(c => this.formatDate(c.timestamp)),
      },
      yAxis: {
        title: {
          text: 'Subscribers',
          style: {
            stacking: 'normal',
            ...this.styleOptions
          },
        },
        min: 0,
        softMax: 1,
        allowDecimals: false,
        labels:
        {
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
      series: [
        {
          //@ts-ignore
          data: subscriberRevenueDataModels.map(c => c.totalSubscribers),
          name: type + 'Subscribers',
          zoneAxis: 'x',
          lineWidth: 0,
          marker: {
            enabled: true,
            radius: 2
          },
          states: {
            hover: {
              lineWidthPlus: 0
            }
          }
        }
      ],
      tooltip: {
        //@ts-ignore
        lang: {
          decimalPoint: '.',
          thousandsSep: ','
        }
      },
    });
  }

  private formatDate(input: string): string {
    const date = new Date(input);
    return '' + date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear() + '';
  }

  public downloadCsvFile(data: any, fileName: string) {
    if (data.length > 0) {
      const replacer = (key: any, value: any) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n').replaceAll('"', '');

      var blob = new Blob([csvArray], { type: 'text/csv' })
      saveAs(blob, fileName + ".csv");
    }
  }
}

