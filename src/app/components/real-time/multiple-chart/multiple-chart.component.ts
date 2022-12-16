import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Subscription } from 'rxjs';
import more from 'highcharts/highcharts-more';
import StreamgraphModule from 'highcharts/modules/streamgraph';
more(Highcharts);
StreamgraphModule(Highcharts);
import { RealTimeTrafficService } from 'src/app/services/real-time/real-time-traffic.service';

@Component({
  selector: 'app-multiple-chart',
  templateUrl: './multiple-chart.component.html',
  styleUrls: ['./multiple-chart.component.scss']
})
export class MultipleChartComponent implements OnInit {

  @Input() monitorId: string = "";
  @Input() EventName: string = "";
  @Input() Name: string = "";
  @Input() Type: string = "";
  @Input() windowLen: any;
  @Input() selectedTime: any;
  @Input() Position: any;
  @Input() doWSCall: any;
  @Input() replay: any;
  @Input() startTime: any;
  @Input() socketUrl: any;
  @Output() valueChange = new EventEmitter();

  highcharts = Highcharts;
  selectedOption: number = 1;
  orgId: any;
  orgid_tenantid: any;
  streamSubscription: Subscription = new Subscription;
  multipleStreamSubscription: Subscription = new Subscription;
  showRealTime: boolean = true;
  data: any = {};
  yAxixTitle = "bps";
  chartName: string = "";
  cachePacketData: any = {};
  cacheRateData: any = {};
  applicationWSRequestObj = {
    "orgId": "",
    "networkId": "",
    "monitorType": "",
    "monitorId": "",
    "graphType": "TRF"
  }
  LocationName: any;

  load = true;
  interval: any;
  pageAvailable: boolean = false;
  lastData: any = [0, 0];
  currentData: any = [0, 0];
  chartData: any = [0, 0];
  upRate: any;
  downRate: any;
  upRateUnit: any;
  downRateUnit: any;

  lastChartDataObj = {};
  streamOptions: any;
  time: number = 0;
  msgLen = 0;
  reloadChart = false;
  inc = 0;
  renderOnce: boolean = false;
  ddoptions = [
    { id: 1, name: '5 Minutes' },
    { id: 2, name: '10 Minutes' },
    { id: 3, name: '15 Minutes' },
    { id: 4, name: '20 Minutes' },
    { id: 5, name: '25 Minutes' },
    { id: 6, name: '30 Minutes' }
  ];
  windowType = "5 Minutes"
  yATitle = "bps";

  constructor(private realTimeTrafficService: RealTimeTrafficService
  ) { }

  ngOnInit(): void {
    this.checkLastSubscriptiontime();
    this.ddoptions.forEach(element => {
      if (element.id === this.selectedTime) {
        this.windowType = element.name;
      }
    });

    this.pageAvailable = true

    this.load = true;
    this.chartName = this.Type;
    this.yAxixTitle = (this.Type === "Rate" ? "bps" : "pps");
    // this.orgId = this.sso.getOrgId();
    this.orgId = "12921722";
    this.orgid_tenantid = this.orgId + '_' + '0';
    this.applicationWSRequestObj.orgId = this.orgId;
    this.applicationWSRequestObj.monitorType = this.EventName;
    this.applicationWSRequestObj.networkId = this.orgid_tenantid;
    this.applicationWSRequestObj.monitorId = this.monitorId;
    // @ts-ignore
    this.applicationWSRequestObj['delay'] = 60;
    // @ts-ignore
    this.applicationWSRequestObj['startTime'] = this.startTime;
    this.yATitle = this.Type === "Rate" ? "bps" : "pps";
    this.buildNewChart();

    let that = this;
    document.addEventListener("visibilitychange", function () {
      that.rebuildData();
    });
    if (!this.replay) {
      if (!this.doWSCall) {
        this.getRtData();
      } else {
        this.getRtData();
        this.send(this.EventName, this.applicationWSRequestObj);
        this.realTimeTrafficService.listenMultiple(this.EventName);
      }
    } else if (this.replay) {
      this.getRtData();
      // @ts-ignore
      this.applicationWSRequestObj['replay'] = 'true';
      // @ts-ignore
      this.applicationWSRequestObj['endTime'] = (new Date()).getTime();
      this.send(this.EventName, this.applicationWSRequestObj);
      this.realTimeTrafficService.listenMultiple('REPLAY');
      this.realTimeTrafficService.listenMultiple(this.EventName);
    }

    this.reConnectWebSocket();
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log("changes", changes);
  }

  ngOnDestroy(): void {
    this.streamOptions = {};
    clearInterval(this.interval);
    this.interval = null;
    clearInterval(this.lastSubscriptionInterval);
    this.lastSubscriptionInterval = null;
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    if (this.multipleStreamSubscription) {
      this.multipleStreamSubscription.unsubscribe();
    }
    if (this.reConnectSubscription) {
      this.reConnectSubscription.unsubscribe();
    }
  }


  send(eventname: string, data: any) {
    this.realTimeTrafficService.getSocketConnection(this.socketUrl, eventname, data);
  }

  lastSubscriptionTime: any;
  getRtData() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    if (this.multipleStreamSubscription) {
      this.multipleStreamSubscription.unsubscribe();
    }

    this.multipleStreamSubscription = this.realTimeTrafficService.multiSocketStream$.subscribe((cdata: any) => {
      this.cacheRateRTDataObj = {};
      this.cachePacketRTDataObj = {};

      if (cdata && cdata.length) {
        cdata = cdata.slice();
        if (cdata[0].includes(this.monitorId)) {
          cdata.forEach((element: any) => {
            let data: any;

            if (this.IsJsonString(element)) {
              data = JSON.parse(element);
            } else {
              data = element;
            }
            this.cacheRTData(data, this.Type);
            if (this.Type === 'Rate') {
              this.data = data.maxRate;
            } else {
              this.data = data.packet;
            }
          });
          this.lastChartDataObj = this.getCachedata(this.Type);
          this.lastData = this.data;
          this.chartData = this.data;
          this.currentData = this.data;
          setTimeout(() => {
            this.rebuildData();
          }, 500)
        }
      }
    })

    this.streamSubscription = this.realTimeTrafficService.socketStream$.subscribe((data: any) => {
      console.log('data', data)

      this.showRealTime = true;
      if (data.confData.monitorId === this.monitorId) {
        if (data.confData.graphType === 'TRF') {
          this.lastSubscriptionData = data
          this.lastSubscriptionTime = new Date().getTime();
          if (this.Type === "Rate") {
            this.data = data.maxRate;
          } else {
            this.data = data.packet;
          }
          this.time = data.sendTime
          this.showRealTime = true;
          if (this.data) {
            this.yAxixTitle = this.getYAxisTitle(this.data);
            this.yAxixTitle = this.yAxixTitle ? this.yAxixTitle : (this.Type === "Rate" ? "bps" : "pps");
            if (this.currentData) {
              this.lastData = Object.assign([], this.currentData);
              this.chartData = Object.assign([], this.currentData);
            } else {
              this.lastData = [0, 0];
              this.chartData = [0, 0];
            }
            setTimeout(() => {
              this.currentData = Object.assign([], this.data);
            }, 100)
          } else {
            this.currentData = [0, 0]
            this.lastData = [0, 0];
            this.chartData = [0, 0];
          }
          if (this.count === 1) {
            this.buildNewChart()
          }
        }
      }
    });

  }

  closeChart() {
    let obj = {
      "monitorId": this.monitorId,
      "Type": this.Type,
      "Position": this.Position
    }
    this.valueChange.emit(obj);
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

  transformData(currentData: any, lastData: any, data: any): any {
    if (this.chartName.toLowerCase() === 'rate') {
    }

    if (!lastData || !lastData.length) {
      lastData = [0, 0];
    }

    let chartData = [];
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

    return chartData;
  }


  cacheRateRTDataObj: any = {};
  currentDataPacket: any;
  lastDataPacket: any;
  chartDataPacket: number[] = [];
  currentDataRate: any;
  lastDataRate: any;
  chartDataRate: number[] = [];
  yAxixTitlePacket: string = '';
  cachePacketRTDataObj: any = {};

  cacheRTData(data: any, type: any) {

    if (type === 'Rate') {
      if (this.currentDataRate) {
        this.lastDataRate = this.currentDataRate;
      } else {
        this.chartDataRate = [0, 0];
      }
      this.currentDataRate = data.maxRate ? data.maxRate : [0, 0];
      this.yAxixTitle = 'bps';
      let loadTime = data.sendTime ? data.sendTime : 0;

      for (let i = 1; i <= 15; i++) {
        var time = loadTime + (i * 1000);
        let key = this.removeLast3Chars(time);
        this.cacheRateRTDataObj[key] = this.generateRTforCache(this.currentDataRate, this.lastDataRate, this.chartDataRate);
        this.removeReplayOldKeys(this.cacheRateRTDataObj, type);
      }
    } else {
      if (this.currentDataPacket) {
        this.lastDataPacket = this.currentDataPacket;
      } else {
        this.chartDataPacket = [0, 0];
      }
      this.currentDataPacket = data.packet ? data.packet : [];
      this.yAxixTitlePacket = 'pps';
      let loadTime = data.sendTime ? data.sendTime : 0;

      for (let i = 1; i <= 15; i++) {
        var time = loadTime + (i * 1000);
        let key = this.removeLast3Chars(time);
        this.cachePacketRTDataObj[key] = this.generateRTforCache(this.currentDataPacket, this.lastDataPacket, this.chartDataPacket);
        this.removeReplayOldKeys(this.cachePacketRTDataObj, type);
      }
    }
  }

  getCachedata(chartName: string) {
    if (chartName === 'Rate') {
      return this.cacheRateRTDataObj;
    } else {
      return this.cachePacketRTDataObj
    }
  }


  removeReplayOldKeys(lastChartDataObj: {}, chartName: string): void {
    let keys = Object.keys(lastChartDataObj);
    let len = keys.length;
    let windowLen = this.selectedTime * 300;

    if (len > windowLen) {
      let obj = lastChartDataObj;

      let removeLen = len - windowLen;

      for (let i = 0; i < removeLen; i++) {
        // @ts-ignore
        delete obj[keys[i]];
      }

      if (chartName === 'rate') {
        this.cacheRateRTDataObj = obj;
      } else {
        this.cachePacketRTDataObj = obj;
      }
    }
  }

  generateRTforCache(currentData: any, lastData: any, chartData: number[]): any {

    let data = this.transformData(currentData, lastData, chartData);
    if (this.chartName === 'Rate') {
      this.chartDataRate = data;
    } else {
      this.chartDataPacket = data;
    }

    if (!data[0]) {
      data[0] = 0;
    }

    if (!data[1]) {
      data[1] = 0;
    }

    let upRate = this.bitsToSize(data[0]);
    let downRate = this.bitsToSize(data[1]);
    let vArr1 = upRate.split(" ");
    let vArr2 = downRate.split(" ");
    let upRateUnit = vArr1[1] ? vArr1[1] : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
    let downRateUnit = vArr2[1] ? vArr2[1] : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
    let maxUnit = '';

    if (data[0] || data[1]) {
      if (data[0] > data[1]) {
        maxUnit = vArr1[1];
      } else {
        maxUnit = vArr2[1];
      }
    } else {
      if (this.chartName.toLowerCase() === 'rate') {
        maxUnit = this.yAxixTitle ? this.yAxixTitle : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
      } else {
        maxUnit = this.yAxixTitlePacket ? this.yAxixTitlePacket : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
      }

    }

    if (maxUnit == 'undefined') {
      //maxUnit = this.yAxixTitle ? this.yAxixTitle : (chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';

      if (this.chartName.toLowerCase() === 'rate') {
        maxUnit = this.yAxixTitle ? this.yAxixTitle : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
      } else {
        maxUnit = this.yAxixTitlePacket ? this.yAxixTitlePacket : (this.chartName.toLowerCase() === 'rate') ? 'bps' : 'pps';
      }
    }

    if (typeof maxUnit === 'string') {
      //this.yAxixTitle = maxUnit;

      if (this.chartName.toLowerCase() === 'rate') {
        this.yAxixTitle = maxUnit;
      } else {
        this.yAxixTitlePacket = maxUnit;
      }
    }

    if (data) {
      if (this.chartName.toLowerCase() === 'rate') {
        return [data[0], data[1], this.yAxixTitle, upRateUnit, downRateUnit];
      } else {
        return [data[0], data[1], this.yAxixTitlePacket, upRateUnit, downRateUnit];
      }

    }

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
    if (len > 300 * this.selectedTime) {
      let obj = this.lastChartDataObj;
      let removeLen = len - 300 * this.selectedTime;
      for (let i = 0; i < removeLen; i++) {
        // @ts-ignore
        delete obj[keys[i]];
      }
      this.lastChartDataObj = obj;
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

    return parseInt('1');
    // return -75 * 1000;
    // return 0;
    //return intOffset * 60 * 1000;
  }

  conversions = {
    'bps': 1, 'Kbps': 1000, 'Mbps': 1000000, 'Gbps': 1000000000, 'Tbps': 1000000000000,
    'pps': 1, 'Kpps': 1000, 'Mpps': 1000000, 'Gpps': 1000000000, 'Tpps': 1000000000000
  }


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
        // @ts-ignore
        if (typeof this.lastChartDataObj[key] == 'undefined' && typeof this.lastChartDataObj[key - 1] !== 'undefined') {
          // @ts-ignore
          this.lastChartDataObj[key] = this.lastChartDataObj[key - 1];
          // @ts-ignore
        } else if (typeof this.lastChartDataObj[key] == 'undefined' && typeof this.lastChartDataObj[key - 2] !== 'undefined') {
          // @ts-ignore
          this.lastChartDataObj[key] = this.lastChartDataObj[key - 2];
        }

      }

      this.reloadChart = true;
      this.buildNewChart();
    }
  }


  chartCallback(chart: any) { // on complete
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

  count = 0;
  buildNewChart() {
    this.count = this.count + 1;
    this.renderOnce = true;
    this.time = new Date().getTime() * 1000;
    this.streamOptions = {};
    let timezoneDetected = this.timezoneDetected()
    let loadTime = (new Date()).getTime();
    var chartxaxis = {
      type: 'datetime',
      tickPixelInterval: 120,
    }
    var charcredits = {
      enabled: false
    }

    var chartyaxis = {
      gridLineDashStyle: 'longdash',
      opposite: false,
      startOnTick: false,
      endOnTick: false,
      title: {
        text: this.yAxixTitle,
        margin: 40,
      },
      labels: {
        align: 'left',
        x: -35,
        // @ts-ignore
        formatter: function () {
          // @ts-ignore
          return Math.abs(this.value);
        }
      },
    }

    let that: any = this;

    this.streamOptions = {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
        height: 170,
        events: {
          load: function () {
            let sizes = (that.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
            // @ts-ignore
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
                that.yAxixTitle = maxUnit;
                that.streamOptions.yAxis.title.text = that.yAxixTitle;
                that.rebuildData();
                return;
              }
              if ((maxUnit != undefined) && that.yATitle != maxUnit && (data[0] || data[1])) {
                that.yATitle = maxUnit;
                that.streamOptions.yAxis.title.text = that.yATitle;
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
              }

              if (series[0].chart.resetZoomButton && series[0].xData.length) {
                let range = series[0].chart.xAxis[0].getExtremes();
                series[0].chart.xAxis[0].setExtremes(range.min + 1200, range.max + 1200);
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
        // @ts-ignore
        formatter: function () {
          // @ts-ignore
          let dateValue = this.point.x;
          // @ts-ignore
          var dateStr = new Date(dateValue).toString().split('GMT')[0];
          // @ts-ignore
          let datakey = that.removeLast3Chars(this.point.x)
          let unit = that.lastChartDataObj[datakey] ? that.lastChartDataObj[datakey][2] : '';
          // @ts-ignore
          if (this.series.name == 'up') {
            // @ts-ignore
            return `<b> ${dateStr}  </b><br/>            Upstream: ${Highcharts.numberFormat(Math.abs(this.point.y), 2)} ${that.yAxixTitle}`;
          }
          // @ts-ignore
          if (this.series.name == 'down') {
            // @ts-ignore
            return `<b> ${dateStr}  </b><br/>           Downstream: ${Highcharts.numberFormat(Math.abs(this.point.y), 2)} ${that.yAxixTitle}`;

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
          name: 'up',
          data: (function () {
            var data = [],
              time = (new Date()).getTime() + timezoneDetected,
              i;

            for (i = -299 * that.selectedTime; i <= 0; i += 1) {
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
          name: 'down',
          data: (function () {
            var data = [],
              time = (new Date()).getTime() + timezoneDetected,
              i;

            for (i = -299 * that.selectedTime; i <= 0; i += 1) {
              let timeKey = time + i * 1000
              let key = that.removeLast3Chars(timeKey);

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
    let bytes = bits[0] > bits[1] ? bits[0] : bits[1];
    let sizes = (this.chartName.toLowerCase() === 'rate') ? ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'] : ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps'];
    var i = (Math.floor(Math.log(bytes) / Math.log(1024)));
    return sizes[i];
  }


  lastSubscriptionInterval: any;
  lastSubscriptionData: any = {}
  checkLastSubscriptiontime() {
    this.lastSubscriptionInterval = setInterval(() => {
      let diff = new Date().getTime() - this.lastSubscriptionTime;
      if (diff >= 30000) {
        this.lastSubscriptionData.maxRate = [0, 0];
        this.lastSubscriptionData.packet = [0, 0];
        // to-do
        //this.realTimeTrafficService.multiSocketStream$.next(this.lastSubscriptionData);
        if (this.currentData) {
          this.lastData = Object.assign([], this.currentData);
          this.chartData = Object.assign([], this.currentData);
        } else {
          this.lastData = [0, 0];
          this.chartData = [0, 0];
        }
        this.currentData = [0, 0];
      }
    }, 15000)
  }

  IsJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }


  reConnectSubscription: any;
  reConnectWebSocket() {
    if (this.reConnectSubscription) {
      this.reConnectSubscription.unsubscribe();
    }
    // to-do
    // this.realTimeTrafficService.socketStream$.subscribe((res: any) => {
    //   if (res && this.realTimeTrafficService.WebSocketServer.hasDisconnectedOnce) {
    //     this.getRtData();
    //     this.send(this.EventName, this.applicationWSRequestObj);
    //     this.applicationWSRequestObj['replay'] = 'true';
    //     this.applicationWSRequestObj['endTime'] = (new Date()).getTime();
    //     this.send(this.EventName, this.applicationWSRequestObj);
    //     this.realTimeTrafficService.listenMultiple(this.EventName);
    //     this.realTimeTrafficService.listenMultiple('REPLAY');
    //   }
    // });
  }


}
