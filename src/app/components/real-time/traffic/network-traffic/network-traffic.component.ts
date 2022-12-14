import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { RealTimeTrafficService } from 'src/app/services/real-time/real-time-traffic.service';
import { TrafficLocation } from 'src/app/services/real-time/real-time-traffix.model';

@Component({
  selector: 'app-network-traffic',
  templateUrl: './network-traffic.component.html',
  styleUrls: ['./network-traffic.component.scss']
})
export class NetworkTrafficComponent implements OnInit, OnDestroy {

  @Input() trafficType = 'Network';

  @ViewChild('recordingModal', { static: true }) private recordingModal: TemplateRef<any> = TemplateRef.prototype;

  updateFlag = true;
  isCcoTraffic = false;
  showRealTime = false;

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

  discoveredCount = 0;
  mappedCount = 0;
  mappedPercentage = 0;

  recordingStatus: boolean = false;
  selectedDuration: any = "1";
  isNow: boolean = true;
  recordingName: any = "";
  description: any = ""
  isvalid: boolean = true;
  showDate: boolean = true;
  minDate = new Date();
  date: any = new Date();
  items: any = [
    {
      name: "0.5 Hour",
      value: '1'
    },
    {
      name: "1 Hour",
      value: '2'
    },
    {
      name: "1.5 Hour",
      value: '3'
    },
    {
      name: "2 Hour",
      value: '4'
    }
  ];

  //locations
  locationItems: TrafficLocation[] = [];
  locationsSelected: string[] = ['All'];

  constructor(private realTimeTrafficService: RealTimeTrafficService, private dialogService: NgbModal) { }
  ngOnDestroy(): void {
    this.realTimeTrafficService.closeSocketConnection();
  }

  ngOnInit(): void {
    switch (this.trafficType) {
      case 'Network':
        this.realTimeTrafficService.getSocketUrl().subscribe(result => {
          this.socketUrl = result.signedurl;
          this.connectToSocket();
        });
        this.getCount();
        break;
      case 'Locations':
        this.realTimeTrafficService.getSocketUrl().subscribe(result => {
          this.socketUrl = result.signedurl;
        });
        this.realTimeTrafficService.getLocations().subscribe(result => {
          result.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
          this.locationItems = result;
          this.locationItems.unshift({
            name: 'All', _id: 'All',
            address: '',
            geo: '',
            orgId: '',
            region: '',
            subnetsV4: '',
            subnetsV6: '',
            tenantId: 0
          })
        });
        break;
      case 'Applications':
        break;
    }
    setTimeout(() => {
      this.getRecordingStatus();
      const recordId = sessionStorage.getItem('recordId');
      if (recordId) {
        this.getgetrafficRecordDetails(recordId);
      }
    }, 1000);
  }

  connectToSocket(): void {
    switch (this.trafficType) {
      case 'Network':
        this.showRealTime = true;
        this.realTimeTrafficService.getSocketConnection(this.socketUrl, 'NET',
          {
            delay: 60, graphType: "TRF,TAPP,TLOC,TEP",
            monitorId: "12921722_0", monitorType: "NET",
            networkId: "12921722_0", orgId: "12921722",
            outputStartTimeDiffToCur: 135114,
            startTime: new Date().getTime(),
            windowLen: this.selectedWindow,
          });
        break;
      case 'Locations':
        this.showRealTime = false;
        this.realTimeTrafficService.pushMessage('remove', 'LOC');
        this.realTimeTrafficService.getSocketConnection(this.socketUrl, 'LOC',
          {
            delay: 60, graphType: "TRF,TAPP,TEP",
            monitorId: this.getLocationMonitorIds(),
            monitorType: "LOC", networkId: "12921722_0",
            orgId: "12921722", startTime: new Date().getTime(),
          });
        setTimeout(() => this.showRealTime = true, 500);
        break;
      case 'Applications':
        break;
    }
    this.clearCacheData();
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

  createRecording() {
    let startTime = (new Date()).getTime();
    let length = parseInt(this.selectedDuration) * 30 * 60 * 1000;
    if (!this.isNow) {
      startTime = (new Date(this.date)).getTime();
    }
    const request = {
      "orgId": "12921722",
      "monitorType": "NET",
      "graphType": "TRF,TAPP,TLOC,TEP",
      "startTime": startTime,
      "name": this.recordingName,
      "description": this.description,
      "length": length,
      "status": "New",
      "userId": '2689898083412557049',
      "recordingType": "traffic",
      "trigger": "Manual",
      "monitorId": '12921722_0'
    };
    this.realTimeTrafficService.recordStream$.subscribe(recordId => {
      sessionStorage.setItem('recordId', recordId);
      this.getRecordingStatus();
      this.getgetrafficRecordDetails(recordId);
    })
    this.realTimeTrafficService.getSocketConnection(this.socketUrl, "RECORDING", request);
    this.closeAllModal();
  }

  applyFilter() {
    this.connectToSocket();
  }

  clearFilter() {
    this.selectedWindow = 1;
    this.locationsSelected = [];
    this.connectToSocket();
  }

  getCount() {
    forkJoin([this.realTimeTrafficService.getDiscoveredCount(), this.realTimeTrafficService.getMappedCount()])
      .subscribe(result => {
        this.mappedCount = result[0];
        this.discoveredCount = result[0] + result[1];
        this.mappedPercentage = (this.mappedCount / this.discoveredCount) * 100;
      });
  }

  getRecordingStatus() {
    this.realTimeTrafficService.getTrafficRecording().subscribe((res: any) => {
      if (res) {
        res.forEach((element: { monitorType: string; status: string; id: any; }) => {
          if (element.monitorType === "NET" && element.status === "Recording") {
            this.recordingStatus = true;
            this.isNow = false;
            this.showDate = false;
          } else {
            this.recordingStatus = false;
            this.isNow = true;
            this.showDate = true;
          }
        });
      }
    })
  }

  getgetrafficRecordDetails(recordId: string) {
    this.realTimeTrafficService.getrafficRecordDetails(recordId).subscribe(() => {
      this.recordingStatus = true;
      this.isNow = false;
      this.showDate = false;
    });
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
      }

    }
    topLocationsUpChartoptions.plotOptions.series.point.events = {

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
      }
    }

    topLocationsDownChartoptions.plotOptions.series.point.events = {
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

  createRecordingModal() {
    let pipe = new DatePipe('en-US');
    this.recordingName = "Network_" + (pipe.transform(new Date(), "yyyy-MM-dd")) + "_" + new Date().toTimeString().substr(0, 8)
    this.dialogService.open(this.recordingModal, { size: 'lg', centered: true, windowClass: 'custom-modal', backdrop: 'static', keyboard: false });
  }

  changeNowAndLater() {
    this.showDate = !this.showDate
  }

  closeAllModal(): void {
    this.dialogService.dismissAll();
  }

  // location

  changeLocation() {
    if (this.locationsSelected.length > 1 && this.locationsSelected.includes('All')) {
      if (this.locationsSelected[0] === 'All') {
        this.locationsSelected = this.locationsSelected.filter(l => l !== 'All');
      }
      else if (this.locationsSelected.pop() === 'All') {
        this.locationsSelected = ['All'];
      }
    }
  }

  getLocationMonitorIds(): string {
    return (this.locationsSelected.length === 1 && this.locationsSelected[0] === 'All')
      ? this.locationItems.filter(l => l._id !== 'All').map(l => l._id).join(',')
      : this.locationsSelected.join(',');
  }

  clearCacheData() {
    this.topEndPointUpChartoptions = null;
    this.topEndPointDownChartoptions = null;
    this.topAppsUpChartoptions = null;
    this.topAppsDownChartoptions = null;
    this.topLocationsUpChartoptions = null;
    this.topLocationsDownChartoptions = null;
  }

}
