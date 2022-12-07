import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import more from 'highcharts/highcharts-more';
import StreamgraphModule from 'highcharts/modules/streamgraph';
more(Highcharts);
StreamgraphModule(Highcharts);


@Component({
  selector: 'app-stream-chart',
  templateUrl: './stream-chart.component.html',
  styleUrls: ['./stream-chart.component.scss']
})
export class StreamChartComponent implements OnInit {
  load = true;
  title = 'myHighchart';
  highcharts = Highcharts;
  // streamOptions: any;
  @Input() chartName = '';
  @Input() yAxixTitle: string = '';
  @Input() xAxix: any;
  interval: any;
  interval2: any;
  language: any;
  pageAvailable: boolean = false;
  upStream: string = '';
  downStream: string = '';
  originalData: any;

  @Input() data: any;
  @Input() windowLen: any = 5;
  @Input() selectedFilter: number = 1;
  @Input() selectedLocation: any = [];
  @Input() selectedApplication: any = [];

  @Input() selectedRegion: any = [];
  @Input() selectedSystem: any = [];

  @Input() monitorId: any;

  lastData: any = [0, 0];
  currentData: any;
  chartData: any = [0, 0];
  upRate: any;
  downRate: any;

  upRateUnit: any;
  downRateUnit: any;

  lastChartDataObj = {};
  triggerReloadChart = false;

  @Input() time: number = 0;
  @Input() history: any;
  streamOptions: any;
  minutes = [5, 10, 15, 20, 25, 30];;

  constructor(
  ) { }

  ngOnInit() {

    this.language = {};
    if (this.language) {
      this.pageAvailable = true
    }
  }

  msgLen = 0;
  ngOnChanges(changes: SimpleChanges) {
    let v1: any, v2: any;
    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    if (changes['data'] && changes['data'].currentValue && this.data) {
      this.msgLen++;
      this.yAxixTitle = this.getYAxisTitle(changes['data'].currentValue);
      this.originalData = changes['data'].currentValue;
      let upRate = this.bitsToSize(this.data[0]);
      let downRate = this.bitsToSize(this.data[1]);
      // console.log(this.data);
      if (this.chartName.toLowerCase() === 'rate') {
        // console.log('Up Rate - ', upRate);
        // console.log('Down Rate - ', downRate);
      } else {
        // console.log('Up Packet Rate - ', upRate);
        // console.log('Down Packer Rate - ', downRate);
      }

      if (this.currentData) {
        this.lastData = this.currentData;
        this.chartData = this.currentData;
      } else {
        this.lastData = [0, 0];
        this.chartData = [0, 0];
      }
      this.currentData = this.data;
    }

    if (changes['monitorId'] && changes['monitorId'].currentValue) {

      this.lastChartDataObj = {};
      this.lastData = [0, 0];
      this.currentData = [0, 0];
      //this.buildChart();
      this.buildNewChart()

    }

    if (changes['selectedFilter'] && changes['selectedFilter'].currentValue) {
      this.selectedFilter = changes['selectedFilter'].currentValue;

      if (window.location.pathname != '/cco/health/pon-utilization/realtime/realtime-basic') {
        //this.websocketService.setWindowLen(this.selectedFilter);
      }

      //this.buildChart();
      this.buildNewChart()

    }

    if (changes['selectedLocation'] && changes['selectedLocation'].currentValue) {
      this.selectedLocation = changes['selectedLocation'].currentValue;
      // this.buildChart();
      this.buildNewChart()
    }

    if (changes['selectedApplication'] && changes['selectedApplication'].currentValue) {
      this.selectedApplication = changes['selectedApplication'].currentValue;
      //this.buildChart();
      this.buildNewChart()

    }

    if (changes['selectedRegion'] && changes['selectedRegion'].currentValue) {
      this.selectedRegion = changes['selectedRegion'].currentValue;
      //this.buildChart();
      this.buildNewChart()

    }

    if (changes['selectedSystem'] && changes['selectedSystem'].currentValue) {
      this.selectedSystem = changes['selectedSystem'].currentValue;
      //this.buildChart();
      this.buildNewChart()

    }

    if ((changes['windowLen'] && changes['windowLen'].currentValue && this.data)) {
      //this.time = this.dateUtilsService.getCurrentUtcTime() * 1000;
      this.triggerReloadChart = false;
      this.load = true;
      this.yAxixTitle = (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
      this.lastChartDataObj = this.history ? this.history : {};

      if (Object.keys(this.lastChartDataObj).length) {
        this.lastData = this.data;
        this.chartData = this.data;
        this.rebuildData();
      } else {
        // console.log('intial call for load chart');
        this.buildNewChart();
      }
      //console.log('history', this.history);
    }

    if ((changes['history'] && changes['history'].currentValue)) {

      this.lastChartDataObj = this.history ? this.history : {};

      // console.log("receive history from component");

      if (Object.keys(this.lastChartDataObj).length) {
        this.lastData = this.data;
        this.chartData = this.data;
        this.rebuildData();
      } else {
        // console.log('intial call for load chart');
        this.buildNewChart();
      }
      //console.log('history', this.history);
    }

  }

  inc = 0;
  chartCallback() { // on complete
  }

  isDownStreamVisible = true;
  toggleDownStream(): void {
    if (this.streamOptions.series[1].visible) {
      this.streamOptions.series[1].visible = false;
      this.isDownStreamVisible = false;
    } else {
      this.streamOptions.series[1].visible = true;
      this.isDownStreamVisible = true;
    }
    this.rebuildData();
  }

  isUpStreamVisible = true;
  toggleUpStream(): void {
    if (this.streamOptions.series[0].visible) {
      this.streamOptions.series[0].visible = false;
      this.isUpStreamVisible = false;
    } else {
      this.streamOptions.series[0].visible = true;
      this.isUpStreamVisible = true;
    }
    this.rebuildData();
  }

  ngOnDestroy(): void {
    this.streamOptions = {};
    clearInterval(this.interval);
    clearInterval(this.interval2);
    this.interval = null;
    this.interval2 = null;
  }

  transformData(currentData: any, lastData: any, data: any): any {
    if (this.chartName.toLowerCase() === 'rate') {
      // console.log("last chart value", data);
    }

    if (!lastData || !lastData.length) {
      lastData = [0, 0];
    }

    let chartData = [];
    if (currentData && currentData.length > 0) {
      for (let i = 0; i < currentData.length; i++) {
        let delta = parseFloat(currentData[i]) - parseFloat(lastData[i]);

        if (!parseFloat(currentData[i]) && !parseFloat(lastData[i])) {
          data[i] = 0;
        }
        let deltaRate = delta / 15;
        let value = (parseFloat(data[i]) + deltaRate);
        chartData.push(value);
      }

      if ((!chartData[0] && !chartData[1]) && (currentData[0] || currentData[1]) && this.msgLen > 2) {
        chartData = currentData;
      }
    }
    return chartData;
  }

  bitsToSize(bits: any) {
    let bytes = parseFloat(bits);

    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    if (bytes == 0 && this.chartName.toLowerCase() === 'rate') return '0 bps';
    if (bytes == 0 && this.chartName.toLowerCase() === 'packet') return '0 pps';

    var i = (Math.floor(Math.log(bytes) / Math.log(1000)));
    return Highcharts.numberFormat(Math.abs(bytes / Math.pow(1000, i)), 2) + ' ' + sizes[i];
  }

  removeLast3Chars(str: any): any {
    str = str.toString();
    str = str.slice(0, -3);
    str = parseInt(str);
    return str;
  }

  removeOldKeys(): void {
    let keys = Object.keys(this.lastChartDataObj);
    let len = keys.length;
    if (len > 300 * 6) {
      let obj = this.lastChartDataObj;
      let removeLen = len - 300 * 6;
      for (let i = 0; i < removeLen; i++) {
        //@ts-ignore
        delete obj[keys[i]];
      }
      this.lastChartDataObj = obj;
      // console.log("removal of old chart length", Object.keys(this.lastChartDataObj).length);
    }
  }



  getPacketRate(bits: any) {
    let bytes = bits;
    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    if (bytes == 0 && this.chartName.toLowerCase() === 'rate') return '0 bps';
    if (bytes == 0 && this.chartName.toLowerCase() === 'packet') return '0 pps';

    var i = (Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1000, i)) + ' ' + sizes[i];
  }

  timezoneDetected() {
    var dtDate = new Date('1/1/' + (new Date()).getUTCFullYear());
    var intOffset = 10000;
    var intMonth;

    for (intMonth = 0; intMonth < 12; intMonth++) {
      dtDate.setUTCMonth(dtDate.getUTCMonth() + 1);

      if (intOffset > (dtDate.getTimezoneOffset() * -1)) {
        intOffset = (dtDate.getTimezoneOffset() * -1);
      }
    }
    //return intOffset * 60 * 1000;
    // return 0;
    // return -75 * 1000;

    return 200000;
  }

  conversions = {
    'bps': 1, 'Kbps': 1000, 'Mbps': 1000000, 'Gbps': 1000000000, 'Tbps': 1000000000000,
    'pps': 1, 'Kpps': 1000, 'Mpps': 1000000, 'Gpps': 1000000000, 'Tpps': 1000000000000
  }

  reloadChart = false;
  rebuildData() {
    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    let keys = Object.keys(this.lastChartDataObj);
    let length = keys.length;

    if (length) {

      let time = (new Date()).getTime() + this.timezoneDetected(),
        i;

      for (i = -299; i <= 0; i += 1) {
        let timeKey = time + i * 1000;
        let key = this.removeLast3Chars(timeKey);
        //@ts-ignore
        if (typeof this.lastChartDataObj[key] == 'undefined' && typeof this.lastChartDataObj[key - 1] !== 'undefined') {
          //@ts-ignore
          this.lastChartDataObj[key] = this.lastChartDataObj[key - 1];
          //@ts-ignore
        } else if (typeof this.lastChartDataObj[key] == 'undefined' && typeof this.lastChartDataObj[key - 2] !== 'undefined') {
          //@ts-ignore
          this.lastChartDataObj[key] = this.lastChartDataObj[key - 2];
        }

      }


      //console.log(this.lastChartDataObj);
      this.reloadChart = true;
      this.buildNewChart();
    }
  }

  sizes = {
    'bps': 1,
    'Kbps': 1000,
    'Mbps': 1000000,
    'Gbps': 1000000000,
    'Tbps': 1000000000000,
    'pps': 1,
    'Kpps': 1000,
    'Mpps': 1000000,
    'Gpps': 1000000000,
    'Tpps': 1000000000000,
  }

  buildNewChart() {
    //this.time = this.dateUtilsService.getCurrentUtcTime() * 1000;
    this.streamOptions = {};
    let timezoneDetected = this.timezoneDetected()
    //let timezoneDetected = 0;
    let loadTime = (new Date()).getTime();
    //var tickintervalMinutes = this.minutes[this.selectedFilter - 1] * 60 * 1000;
    var chartxaxis = {
      type: 'datetime',
      tickPixelInterval: 120,
      //categoreis: ['00:05', '00:10', '00:15', '00:20', '00:25', '00:30',]
    }
    var charcredits = {
      enabled: false
    }

    var chartyaxis = {
      gridLineDashStyle: 'longdash',
      opposite: false,
      startOnTick: false,
      endOnTick: false,
      // reversed: false,
      // events: {
      //   setExtremes: function (e) {
      //     var c = this;
      //     c.chart.yAxis[0].setExtremes(0, e.max);
      //   }
      // },
      title: {
        text: this.yAxixTitle,
        margin: 40,
        // style: {
        //   fontWeight: 'bold',
        //   textAlign: 'left'
        // }
      },
      labels: {
        align: 'left',
        x: -35,
        //@ts-ignore
        formatter: function () {//@ts-ignore
          return Math.abs(this.value);
          // var temp = that.bitsConversion(this.value);
          // return Math.abs(temp);
        }
      },
    }

    let that: any = this;

    this.streamOptions = {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
        //marginLeft: 100,
        height: 200,
        events: {
          load: function () {
            let sizes = (that.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
            //@ts-ignore
            var series = this.series;
            that.interval = setInterval(function () {
              that.inc++

              let data = that.transformData(that.currentData, that.lastData, that.chartData);
              that.chartData = data;
              if (!data[0]) {
                data[0] = 0;
              }
              if (!data[1]) {
                data[1] = 0;
              }
              let upRate = that.bitsToSize(data[0]);
              let downRate = that.bitsToSize(data[1]);
              let vArr1 = upRate.split(" ");
              let vArr2 = downRate.split(" ");
              let upRateValue = vArr1[0];
              let downRateValue = vArr2[0];
              let upRateUnit = vArr1[1] ? vArr1[1] : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
              let downRateUnit = vArr2[1] ? vArr2[1] : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
              let maxUnit = '';
              upRateUnit = (upRateUnit == 'undefined') ? (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps' : upRateUnit;
              downRateUnit = (downRateUnit == 'undefined') ? (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps' : downRateUnit;
              if (data[0] || data[1]) {
                if (data[0] > data[1]) {
                  maxUnit = vArr1[1];
                } else {
                  maxUnit = vArr2[1];
                }
              } else {
                maxUnit = that.yAxixTitle ? that.yAxixTitle : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
              }
              if (maxUnit == 'undefined') {
                maxUnit = that.yAxixTitle ? that.yAxixTitle : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
              }
              if ((maxUnit != undefined) && that.yAxixTitle != maxUnit && (data[0] || data[1])) {
                // console.log(`scale changed from ${that.yAxixTitle} to ${maxUnit}`);
                that.yAxixTitle = maxUnit;
                that.streamOptions.yAxis.title.text = that.yAxixTitle;
                // var time = (new Date()).getTime() + timezoneDetected;
                // let key = that.removeLast3Chars(time);
                //that.lastChartDataObj[key] = [data[0], data[1], that.yAxixTitle, upRateUnit, downRateUnit];
                that.rebuildData();
                return;
              }
              if (typeof maxUnit === 'string') {
                that.yAxixTitle = maxUnit;
              }
              let v1 = parseFloat(vArr1[0]);
              let v2 = parseFloat(vArr2[0]);
              if ((data[0] || data[1]) && (data[0] < data[1]) && vArr1[1] !== vArr2[1]) {
                let indexV1 = sizes.indexOf(vArr1[1]);
                let indexV2 = sizes.indexOf(vArr2[1]);
                let diff = indexV2 - indexV1;
                if (diff) {
                  for (let i = diff; i > 0; i--) {
                    v1 = v1 / 1000;
                  }
                }
              }
              if ((data[0] || data[1]) && (data[0] > data[1]) && vArr1[1] !== vArr2[1]) {
                let indexV1 = sizes.indexOf(vArr1[1]);
                let indexV2 = sizes.indexOf(vArr2[1]);
                let diff = indexV1 - indexV2;
                if (diff) {
                  for (let i = diff; i > 0; i--) {
                    v2 = v2 / 1000;
                  }
                }
              }
              if (data) {
                var time = (new Date()).getTime() + timezoneDetected;
                let num = parseFloat(Highcharts.numberFormat(Math.abs(v1), 2));
                if (num < 1) {
                  //num *= 1000;
                }
                that.upRate = `${upRateValue} ${upRateUnit ? upRateUnit : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps'}`;
                num = parseFloat(Highcharts.numberFormat(Math.abs(v2), 2));
                if (num < 1) {
                  //num *= 1000;
                }
                that.removeOldKeys();
                that.downRate = `${downRateValue} ${downRateUnit ? downRateUnit : (that.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps'}`;
                var x = time, y = v1;
                series[0].addPoint([x, y], true, true);
                var sx = time, sy = -v2;
                series[1].addPoint([sx, sy], true, true);
                let key = that.removeLast3Chars(time);
                that.lastChartDataObj[key] = [data[0], data[1], that.yAxixTitle, upRateUnit, downRateUnit];
                that.lastChartDataObj[key + 1] = [data[0], data[1], that.yAxixTitle, upRateUnit, downRateUnit];

                if (series[0].chart.resetZoomButton && series[0].xData.length) {
                  let range = series[0].chart.xAxis[0].getExtremes();
                  series[0].chart.xAxis[0].setExtremes(range.min + 1200, range.max + 1200);
                }

                // if (that.websocketService.shouldReflow) {
                //   series[0].chart.reflow();
                // }
              }
            }, 1000);
          }
        },

      },

      time: {
        useUTC: false
      },

      title: {
        text: ''
      },
      colors: ['#0027FF', '#5ACFEA'],
      //colors: ['#FF8238', '#836EE8'],
      xAxis: chartxaxis,
      yAxis: chartyaxis,
      credits: charcredits,
      plotOptions: {
        areaspline: {
          lineWidth: 1,
          marker: {
            enabled: false
          },
          fillOpacity: 0.75
        },
        spline: {
          animation: false,
          marker: {
            enabled: false,
            radius: 0.9,
            lineWidth: 0.7
          }
        },
        series: {
          turboThreshold: 1000000
        }
      },

      tooltip: {
        //@ts-ignore
        formatter: function () {
          //@ts-ignore
          let dateValue = this.point.x;
          //@ts-ignore
          var dateStr = '';
          //@ts-ignore
          let datakey = that.removeLast3Chars(this.point.x)
          let unit = that.lastChartDataObj[datakey] ? that.lastChartDataObj[datakey][2] : '';

          // return `<b> ${dateStr}  </b><br/>
          //        ${this.series.name}stream: ${Highcharts.numberFormat(Math.abs(this.point.y), 2)} ${that.yAxixTitle ? that.yAxixTitle : unit}`;
          //@ts-ignore
          if (this.series.name == 'up') {
            //@ts-ignore
            return `<b> ${dateStr}  </b><br/>            ${that.language.Upstream}: ${Highcharts.numberFormat(Math.abs(this.point.y), 2)} ${that.yAxixTitle}`;
          }
          //@ts-ignore
          if (this.series.name == 'down') {
            //@ts-ignore
            return `<b> ${dateStr}  </b><br/>            ${that.language.Downstream}: ${Highcharts.numberFormat(Math.abs(this.point.y), 2)} ${that.yAxixTitle}`;

          }
        }
      },

      legend: {
        enabled: false
      },

      exporting: {
        enabled: false
      },

      series: [
        {
          name: that?.language?.upStream ? that.language.upStream : 'up',
          data: (function () {
            var data = [],
              time = (new Date()).getTime() + timezoneDetected,
              i;

            for (i = -299 * that.selectedFilter; i <= 0; i += 1) {
              let timeKey = time + i * 1000;
              let key = that.removeLast3Chars(timeKey);

              let value = typeof that.lastChartDataObj[key] !== 'undefined' ? that.lastChartDataObj[key][0] : (that.lastChartDataObj[key - 1] && that.lastChartDataObj[key - 1][0]) ? that.lastChartDataObj[key - 1][0] : 0;
              if (that.reloadChart && !value) {
                value = typeof that.lastChartDataObj[key - 1] !== 'undefined' ? that.lastChartDataObj[key - 1][0] : (that.lastChartDataObj[key - 2] && that.lastChartDataObj[key - 2][0]) ? that.lastChartDataObj[key - 2][0] : 0;
              }

              if (value) {
                value = value / that.sizes[that.yAxixTitle];
              }

              data.push({
                x: timeKey,
                y: value
              });
            }
            return data;
          })()
        }, {
          name: that?.language?.downStream ? that.language.downStream : 'down',
          data: (function () {
            // generate an array of random data
            var data = [],
              time = (new Date()).getTime() + timezoneDetected,
              i;

            //console.log(" series", that.lastChartDataObj)

            for (i = -299 * that.selectedFilter; i <= 0; i += 1) {
              let timeKey = time + i * 1000
              let key = that.removeLast3Chars(timeKey);
              // let value = that.lastChartDataObj[key] ? that.lastChartDataObj[key][1] : 0;
              // if (that.reloadChart && !value) {
              //   value = that.lastChartDataObj[key - 1] ? that.lastChartDataObj[key - 1][0] : 0;
              // }

              let value = typeof that.lastChartDataObj[key] !== 'undefined' ? that.lastChartDataObj[key][1] : (that.lastChartDataObj[key - 1] && that.lastChartDataObj[key - 1][1]) ? that.lastChartDataObj[key - 1][1] : 0;
              if (that.reloadChart && !value) {
                value = typeof that.lastChartDataObj[key - 1] !== 'undefined' ? that.lastChartDataObj[key - 1][1] : (that.lastChartDataObj[key - 2] && that.lastChartDataObj[key - 2][1]) ? that.lastChartDataObj[key - 2][1] : 0;
              }

              if (that.lastChartDataObj[key]) {
                that.lastChartDataObj[key][1] = value;
              }




              if (value) {
                value = value / that.sizes[that.yAxixTitle];
              }


              value = value * -1;
              data.push({
                x: timeKey,
                y: value
              });
            }

            return data;
          })()
        }
      ]
    }

    this.streamOptions.series[0].visible = this.isUpStreamVisible;
    this.streamOptions.series[1].visible = this.isDownStreamVisible;
    this.streamOptions = Object.assign({}, this.streamOptions);


  };
  bitsConversion(bits: any) {
    let down = false;
    if (bits < 0) {
      bits = -bits;
      down = true;
    }
    let bytes = parseFloat(bits);
    if (bytes == 0) return 0;
    var i = (Math.floor(Math.log(bytes) / Math.log(1000)));
    var val = parseInt(Highcharts.numberFormat(Math.abs(bytes / Math.pow(1000, i)), 2));
    return down ? -1 * val : val;
  }

  getYAxisTitle(bits: any) {            // It returns YAxis title for latest data
    let bytes = bits;
    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    var i = (Math.floor(Math.log(bytes) / Math.log(1024)));
    return sizes[i];
  }

  removePrevious() {                    // Replace all previous values with 0,0
    //@ts-ignore
    this.lastChartDataObj = Object.keys(this.lastChartDataObj).reduce((acc, key) => { acc[key] = [0, 0, "bps", "bps", "bps"]; return acc; }, {});
    this.lastData = [0, 0];
    this.currentData = [0, 0];
    this.rebuildData();
  }
}
