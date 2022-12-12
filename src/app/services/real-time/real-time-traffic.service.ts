import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Highcharts from 'highcharts';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RealTimeTrafficService {

  private socketSubject = new ReplaySubject<any>();

  public netSocketStream$ = this.socketSubject.asObservable();

  private apiUrl = 'https://stage.api.calix.ai/v1/';

  constructor(private httpClient: HttpClient) { }

  getSocketUrl(): Observable<{ signedurl: string }> {
    return this.httpClient.get<{ signedurl: string }>(this.apiUrl + 'realtime/signed-url');
  }

  getSocketConnection(socketUrl: string) {

    // const subject = webSocket({
    //   url:socketUrl,
    //   protocol:['websocket'],      
    // });

    // subject.subscribe({
    //   next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
    //   error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
    //   complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    // });

    // subject.next({
    //   delay: 60, graphType: "TRF,TAPP,TLOC,TEP", monitorId: "12921722_0", monitorType: "NET", networkId: "12921722_0", orgId: "12921722", outputStartTimeDiffToCur: 135114, startTime: new Date().getTime(), windowLen: 1,
    // });

    const socket = io(socketUrl, {
      transports: ['websocket'],
      path: '/calix/socket-io/',
      autoConnect: false,
      reconnection: false
    });

    socket.open();

    socket.on("connect", () => {
      console.log('connect');
    });

    socket.on("ping", () => {
      console.log('ping');
    });

    socket.on("error", (error) => {
      console.log('error', error);
    });

    socket.on("reconnect", (attempt) => {
      console.log('reconnect', attempt);
    });

    socket.on("NET", (data) => {
      const result = JSON.parse(data);
      console.log(result);
      this.socketSubject.next(result);
    });

    socket.on("REPLAY", (data) => {
      console.log('REPLAY', data);
    });

    socket.emit('NET', {
      delay: 60, graphType: "TRF,TAPP,TLOC,TEP", monitorId: "12921722_0", monitorType: "NET", networkId: "12921722_0", orgId: "12921722", outputStartTimeDiffToCur: 135114, startTime: new Date().getTime(), windowLen: 1,
    });

    setTimeout(() => {
      this.getTrafficRecording();
    }, 1000);
  }

  getTrafficRecording() {
    this.httpClient.post(this.apiUrl + 'record/job/status/Recording', {
      monitorType: 'NET',
      monitorId: '12921722_0'
    }).subscribe(result => console.log('Record', result));
  }

  makeOptionsForRTBC(data: any, type: any, dataType?: any, sliceNum?: any, fsView?: any): any {
    let that = this;
    sliceNum = sliceNum ? sliceNum : 5;
    let categories: any[] = [];
    let seriesData1 = [];
    let tickAmount = fsView ? 6 : 3;

    let options: any = {
      chart: {
        type: 'bar',
        zoomType: "xy",
        height: 180,
        renderTo: 'container',

      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        startOnTick: false,
        endOnTick: false,
        labels: {
          style: {
            color: '#007bff'
          },
          events: {

          }
        },

      },
      yAxis: {
        title: {
          text: ''
        },
        opposite: true,
        tickLength: 2,
        tickAmount: tickAmount,
        startOnTick: false,
        endOnTick: false,
        labels: {
          //@ts-ignore
          formatter: function () {
            //@ts-ignore
            let ret = `${that.bitsToSize(this.value, false)}`
            return ret;
          },
          events: {

          },
          rotation: 0
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
        series: {
          color: '#0027FF',
          cursor: 'pointer',
          point: {
            events: {

            }
          }
        }
      },
      series: [],
      tooltip: {
        //@ts-ignore
        formatter: function () {
          //@ts-ignore
          let ret = `${this.x} <br/> ${that.bitsToSize(this.y, false)}`
          return ret;
        }
      },
      lang: {
        noData: "No Data Available",
      },
    };
    let xData = [], ids = [];
    if (type === 'bar') {
      if (dataType === 'upData') {
        data.upData = data.upData.slice(0, sliceNum);
        for (let i = 0; i < data.upData.length; i++) {
          categories.push(data.upData[i].name);
          seriesData1.push(data.upData[i].value);
          xData.push(data.upData[i].name);
          ids.push(data.upData[i].id);
        }
      } else {
        data.downData = data.downData.slice(0, sliceNum);
        for (let i = 0; i < data.downData.length; i++) {
          categories.push(data.downData[i].name);
          seriesData1.push(data.downData[i].value);
          xData.push(data.downData[i].name);
          ids.push(data.downData[i].id);
        }
      }
      options.series = [{
        data: seriesData1,
        // xData: xData,
        // id: ids
      }];
    }

    options.xAxis['categories'] = categories;


    return options;
  }

  bitsToSize(bits: any, round?: any) {
    let bytes = bits;

    let sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
    if (bytes == 0) return '0';

    var i = (Math.floor(Math.log(bytes) / Math.log(1000)));
    if (round) {
      return Math.round(bytes / Math.pow(1000, i)) + ' ' + sizes[i];
    }

    if (i < 0) {
      i = 0;
    }
    let n = 1;
    if (Number.isInteger(+Highcharts.numberFormat(Math.abs(bytes / Math.pow(1000, i)), 1))) {
      n = 0;
    }

    return Highcharts.numberFormat(Math.abs(bytes / Math.pow(1000, i)), n) + ' ' + sizes[i];
  }

  calculatePercentage(total: any, data: any, length: any) {
    if (!total || data.length === 0) {
      return 0;
    }
    let filterData = data.slice(0, length);
    let filterTotal = filterData.reduce((filterTotal: any, item: { value: any; }) => filterTotal + item.value, 0);
    let percentage: any = ((filterTotal / total) * 100).toFixed(2);
    if (!percentage || percentage === 'NaN') {
      return 0;
    }
    if (percentage && parseFloat(percentage) > 100) {
      return 100;
    }
    return percentage;
  }
}
