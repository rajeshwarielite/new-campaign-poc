import { Component, OnInit } from '@angular/core';
import { RealTimeTrafficService } from 'src/app/services/real-time/real-time-traffic.service';

@Component({
  selector: 'app-real-time',
  templateUrl: './real-time.component.html',
  styleUrls: ['./real-time.component.scss']
})
export class RealTimeComponent implements OnInit {

  updateFlag = true;
  isCcoTraffic = false;

  data: any;
  topEndPointUpChartoptions: any;
  topEndPointDownChartoptions: any;
  topAppsUpChartoptions: any;
  topAppsDownChartoptions: any;
  topLocationsUpChartoptions: any;
  topLocationsDownChartoptions: any;

  windowOptions = [
    { id: 1, name: '5 Minutes window' },
    { id: 2, name: '10 Minutes window' },
    { id: 3, name: '15 Minutes window' },
    { id: 4, name: '20 Minutes window' },
    { id: 5, name: '25 Minutes window' },
    { id: 6, name: '30 Minutes window' }
  ];
  selectedWindow: number = 1;
  tAPrcntData = {
    downPercentage: '0',
    upPercentage: '0'
  };
  tLPrcntData = {
    downPercentage: '0',
    upPercentage: '0'
  };
  tEPrcntData = {
    downPercentage: '0',
    upPercentage: '0'
  };

  tAData = {
    upData: [],
    downData: []
  };
  tLData = {
    upData: [],
    downData: []
  };
  tEPData = {
    upData: [],
    downData: []
  };

  tepUpDataObj = {};
  tepDownDataObj = {};

  socketUrl = '';

  constructor(private realTimeTrafficService: RealTimeTrafficService) { }

  ngOnInit(): void {
    this.realTimeTrafficService.getSocketUrl().subscribe(result => {
      this.socketUrl = result.signedurl;
      this.connectToSocket();
    });
  }

  connectToSocket(): void {
    this.realTimeTrafficService.getSocketConnection(this.socketUrl, 'NET',
      {
        delay: 60, graphType: "TRF,TAPP,TLOC,TEP", monitorId: "12921722_0", monitorType: "NET", networkId: "12921722_0", orgId: "12921722", outputStartTimeDiffToCur: 135114, startTime: new Date().getTime(), windowLen: this.selectedWindow,
      });
    this.realTimeTrafficService.netSocketStream$.subscribe(
      result => {
        this.data = result;
        if (result.confData.graphType === 'TEP') {
          this.makeTEPEvents(result);
        }
        if (result.confData.graphType === 'TAPP') {
          this.makeTAPPEvents(result);
        }
        if (result.confData.graphType === 'TLOC') {
          this.makeTLOCEvents(result);
        }
      });
  }

  applyFilter() {
    this.connectToSocket();
  }

  clearFilter() {
    this.selectedWindow = 1;
    this.connectToSocket();
  }

  makeTEPEvents(data: any): any {
    //let data: any = this.tEPData;

    this.tEPrcntData = {
      downPercentage: data.downPercentage ? data.downPercentage : 0,
      upPercentage: data.upPercentage ? data.upPercentage : 0
    };

    // let len = (this.fsView && this.fsName === 'TEP') ? this.selectedTopLength : 5;
    let len = 5;
    let upLen = data['upData']?.length;
    let downLen = data['downData']?.length;
    if (upLen >= len) {
      upLen = len;
    }

    if (downLen >= len) {
      downLen = len;
    }

    this.tEPrcntData.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.tEPrcntData.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settepUpDataObj(data.upData);
    this.settepDownDataObj(data.downData)

    this.tEPData["upData"] = data.upData;
    this.tEPData["downData"] = data.downData;

    let topEndPointUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, '');
    let topEndPointDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, '');


    topEndPointUpChartoptions.chart.height = 160;

    topEndPointUpChartoptions.plotOptions.series.pointWidth = 14;

    topEndPointDownChartoptions.chart.height = 160;
    topEndPointDownChartoptions.plotOptions.series.pointWidth = 14;

    let that = this;
    let url = '/cco/traffic/endpoints/realtime';
    if (!this.isCcoTraffic) {
      url = '/organization-admin/flowAnalyze/traffic/endpoint/realtime';
    }
    topEndPointUpChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        click: function () {
          //@ts-ignore
          // window.sessionStorage.setItem('endpointName', this.axis.categories[this.pos]);
          // that.navigationByUrl(this.category = '', that.tepUpDataObj[this.axis.categories[this.pos]], 'Endpoints');
          // that.onclickCopy(this.value);
        },
        // dblclick: function (e) {
        // that.websocketservice.isUnmapped = false;
        // data.upData.forEach((element) => {
        //   if (element.id == element.name && element.name == that.tepDownDataObj[this.value]) {
        //     that.websocketservice.isUnmapped = true;
        //   }
        // });
        //   that.navigationByUrl(this.category = '', that.tepUpDataObj[this.value], 'Endpoints');
        // },
        contextmenu: function (e: { preventDefault: () => void; }) {
          e.preventDefault();
          // that.navigationByUrl(this.category = '', that.tepUpDataObj[this.value], 'Endpoints');
          // window.sessionStorage.removeItem('endpointName');
          // let newTabUrl = window.location.origin + url + '?id=' + that.tepUpDataObj[this.axis.categories[this.pos]];
          // window.open(newTabUrl, '_blank');
        }
      }

    }
    topEndPointUpChartoptions['plotOptions'].series.point.events = {
      click: function () {
        window.sessionStorage.setItem('endpointName', this.category);
        // that.navigationByUrl(this.category, that.tepUpDataObj[this.category], 'Endpoints');
      }
    };
    topEndPointDownChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        click: function () {
          // window.sessionStorage.setItem('endpointName', this.axis.categories[this.pos]);
          // that.navigationByUrl(this.category = '', that.tepDownDataObj[this.axis.categories[this.pos]], 'Endpoints');
          // that.onclickCopy(this.value);
        },
        // dblclick: function (e) {
        // that.websocketservice.isUnmapped = false;
        // data.downData.forEach((element) => {
        //   if (element.id == element.name && element.name == that.tepDownDataObj[this.value]) {
        //     that.websocketservice.isUnmapped = true;
        //   }
        // });
        //   that.navigationByUrl(this.category = '', that.tepDownDataObj[this.value], 'Endpoints');
        // },
        contextmenu: function (e: any) {
          e.preventDefault();
          // that.navigationByUrl(this.category = '', that.tepDownDataObj[this.value], 'Endpoints');
          window.sessionStorage.removeItem('endpointName');
          // let newTabUrl = window.location.origin + url + '?id=' + that.tepDownDataObj[this.axis.categories[this.pos]];
          // window.open(newTabUrl, '_blank');
        }
      }
    }
    topEndPointDownChartoptions.plotOptions.series.point.events = {
      click: function () {
        window.sessionStorage.setItem('endpointName', this.category);
        // that.navigationByUrl(this.category, that.tepDownDataObj[this.category], 'Endpoints');
        //that.realTimeCommonFunctionService.nagigationByUrl(this.category, that.tepDownDataObj[this.value], 'Endpoints');
      }
    };

    topEndPointDownChartoptions.plotOptions.series.color = '#5ACFEA';

    topEndPointUpChartoptions = Object.assign({}, topEndPointUpChartoptions);
    topEndPointDownChartoptions = Object.assign({}, topEndPointDownChartoptions);

    this.topEndPointUpChartoptions = topEndPointUpChartoptions;
    this.topEndPointDownChartoptions = topEndPointDownChartoptions;
  }

  makeTAPPEvents(data?: any): any {

    //let data: any = this.tAData;
    this.tAPrcntData = {
      downPercentage: data.downPercentage ? data.downPercentage : 0,
      upPercentage: data.upPercentage ? data.upPercentage : 0
    };

    let len = 5;
    let upLen = data['upData'].length;
    let downLen = data['downData'].length;
    if (upLen >= len) {
      upLen = len;
    }

    if (downLen >= len) {
      downLen = len;
    }

    this.tAPrcntData.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.tAPrcntData.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settepUpDataObj(data.upData);
    this.settepDownDataObj(data.downData);

    this.tAData["upData"] = data.upData;
    this.tAData["downData"] = data.downData;

    let topAppsUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, false);
    let topAppsDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, false);

    topAppsUpChartoptions.chart.height = 160;
    delete topAppsUpChartoptions.chart.width;
    topAppsUpChartoptions.plotOptions.series.pointWidth = 14;

    topAppsDownChartoptions.chart.height = 160;
    delete topAppsDownChartoptions.chart.width;
    topAppsDownChartoptions.plotOptions.series.pointWidth = 14;


    let that = this;
    let url = '/cco/traffic/applications/realtime';
    if (!this.isCcoTraffic) {
      url = '/organization-admin/flowAnalyze/traffic/application/realtime';
    }
    topAppsUpChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        click: function () {
          // if (that.hasApplicationAccess) {
          //   that.router.navigate([url], { queryParams: { id: that.tapUpDataObj[this.axis.categories[this.pos]] } });
          // }
        },
        contextmenu: function () {
          // if (that.hasApplicationAccess) {
          //   event.preventDefault();
          //   // that.router.navigate(['/cco/traffic/applications/realtime'], { queryParams: { id: that.tapUpDataObj[this.value] } });
          //   let newTabUrl = window.location.origin + url + '?id=' + that.tapUpDataObj[this.axis.categories[this.pos]];
          //   window.open(newTabUrl, '_blank');
          // }
        }
      }
    }
    topAppsUpChartoptions.plotOptions.series.point.events = {
      click: function () {
        // if (that.hasApplicationAccess) {
        //   that.router.navigate([url], { queryParams: { id: that.tapUpDataObj[event.point.category] } })
        // }
      }
    }
    topAppsDownChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        click: function () {
          // if (that.hasApplicationAccess) {
          //   that.router.navigate([url], { queryParams: { id: that.tapDownDataObj[this.axis.categories[this.pos]] } });
          // }
        },
        contextmenu: function () {
          // if (that.hasApplicationAccess) {
          //   event.preventDefault();
          //   // that.router.navigate(['/cco/traffic/applications/realtime'], { queryParams: { id: that.tapDownDataObj[this.value] } });
          //   let newTabUrl = window.location.origin + url + '?id=' + that.tapDownDataObj[this.axis.categories[this.pos]];
          //   window.open(newTabUrl, '_blank');
          // }
        }
      }
    }
    topAppsDownChartoptions.plotOptions.series.point.events = {
      click: function () {
        // if (that.hasApplicationAccess) {
        //   that.router.navigate([url], { queryParams: { id: that.tapDownDataObj[event.point.category] } })
        // }
      }

    }

    topAppsDownChartoptions.plotOptions.series.color = '#5ACFEA';

    this.topAppsUpChartoptions = { ...topAppsUpChartoptions };
    this.topAppsDownChartoptions = { ...topAppsDownChartoptions };

  }

  makeTLOCEvents(data: any): any {
    //let data: any = this.tAData;
    this.tLPrcntData = {
      downPercentage: data.downPercentage ? data.downPercentage : 0,
      upPercentage: data.upPercentage ? data.upPercentage : 0
    };

    let len = 5;
    let upLen = data['upData'].length;
    let downLen = data['downData'].length;
    if (upLen >= len) {
      upLen = len;
    }

    if (downLen >= len) {
      downLen = len;
    }

    this.tLPrcntData.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.tLPrcntData.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settepUpDataObj(data.upData);
    this.settepDownDataObj(data.downData);

    this.tLData["upData"] = data.upData;
    this.tLData["downData"] = data.downData;

    let topLocationsUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, false);
    let topLocationsDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, false);

    topLocationsUpChartoptions.chart.height = 160;
    delete topLocationsUpChartoptions.chart.width;
    topLocationsUpChartoptions.plotOptions.series.pointWidth = 14;

    topLocationsDownChartoptions.chart.height = 160;
    delete topLocationsDownChartoptions.chart.width;
    topLocationsDownChartoptions.plotOptions.series.pointWidth = 14;



    let that = this;
    let url = '/cco/traffic/locations/realtime';
    if (!this.isCcoTraffic) {
      url = '/organization-admin/flowAnalyze/traffic/location/realtime';
    }
    topLocationsUpChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        // click: function (event) {
        //   if (that.hasLocationAccess) {
        //     that.router.navigate([url], { queryParams: { id: that.tlocUpDataObj[this.axis.categories[this.pos]] } })
        //   }
        // },
        // contextmenu: function (event) {
        //   if (that.hasLocationAccess) {
        //     event.preventDefault();
        //     // that.router.navigate(['/cco/traffic/locations/realtime'], { queryParams: { id: that.tlocUpDataObj[this.value] } })
        //     let newTabUrl = window.location.origin + url + '?id=' + that.tlocUpDataObj[this.axis.categories[this.pos]];
        //     window.open(newTabUrl, '_blank');
        //   }
        // }
      }

    }
    topLocationsUpChartoptions.plotOptions.series.point.events = {
      // click: function (event) {
      //   if (that.hasLocationAccess) {
      //     that.router.navigate([url], { queryParams: { id: that.tlocUpDataObj[event.point.category] } })
      //   }
      // }

    };
    topLocationsDownChartoptions.xAxis.labels = {
      useHTML: true,
      style: {
        color: '#007bff',
        cursor: 'pointer',
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: '13px',
        fontWeight: 500
      },
      formatter: function () {
        return `<span  class="text-primary axis_label" title="${this.value}" style="cursor:pointer">${this.value}</span>`;
        // return `${this.value}`
      },
      events: {
        // click: function (event) {
        //   if (that.hasLocationAccess) {
        //     that.router.navigate([url], { queryParams: { id: that.tlocDownDataObj[this.axis.categories[this.pos]] } })
        //   }
        // },
        // contextmenu: function (event) {
        //   if (that.hasLocationAccess) {
        //     event.preventDefault();
        //     // that.router.navigate(['/cco/traffic/locations/realtime'], { queryParams: { id: that.tlocDownDataObj[this.value] } })
        //     let newTabUrl = window.location.origin + url + '?id=' + that.tlocDownDataObj[this.axis.categories[this.pos]];
        //     window.open(newTabUrl, '_blank');
        //   }
        // }
      }
    }

    topLocationsDownChartoptions.plotOptions.series.point.events = {
      // click: function (event) {
      //   if (that.hasLocationAccess) {
      //     that.router.navigate([url], { queryParams: { id: that.tlocDownDataObj[event.point.category] } })
      //   }
      // }
    };

    topLocationsDownChartoptions.plotOptions.series.color = '#5ACFEA';


    this.topLocationsUpChartoptions = { ...topLocationsUpChartoptions };
    this.topLocationsDownChartoptions = { ...topLocationsDownChartoptions };
  }

  public settepUpDataObj(data: any): any {
    let obj = {};
    data?.forEach((element: any) => {
      //@ts-ignore
      obj[element.name] = element.id;
    });

    this.tepUpDataObj = obj;
  }

  public settepDownDataObj(data: any): any {
    let obj = {};
    data?.forEach((element: any) => {
      //@ts-ignore
      obj[element.name] = element.id;
    });

    this.tepDownDataObj = obj;
  }

}
