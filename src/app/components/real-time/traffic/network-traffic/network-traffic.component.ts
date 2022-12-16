import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { RealTimeTrafficService } from 'src/app/services/real-time/real-time-traffic.service';
import { TrafficApplication, TrafficLocation } from 'src/app/services/real-time/real-time-traffix.model';

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
  disableApply = false;

  data: any;
  topEndPointUpChartoptions: any;
  topEndPointDownChartoptions: any;
  topApplicationsUpChartoptions: any;
  topApplicationsDownChartoptions: any;
  topLocationsUpChartoptions: any;
  topLocationsDownChartoptions: any;

  timeFrameOptions = [
    { id: 1, name: '5 Minutes window' },
    { id: 2, name: '10 Minutes window' },
    { id: 3, name: '15 Minutes window' },
    { id: 4, name: '20 Minutes window' },
    { id: 5, name: '25 Minutes window' },
    { id: 6, name: '30 Minutes window' }
  ];
  selectedTimeFrame: number = 1;

  percentTAPP = {
    downPercentage: '0',
    upPercentage: '0'
  };
  percentTLOC = {
    downPercentage: '0',
    upPercentage: '0'
  };
  percentTEP = {
    downPercentage: '0',
    upPercentage: '0'
  };

  streamTAPP = {
    upData: [],
    downData: []
  };
  streamTLOC = {
    upData: [],
    downData: []
  };
  streamTEP = {
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

  // locations
  locationItems: TrafficLocation[] = [];
  locationsSelected: any = ['All'];

  // applications
  applicationItems: TrafficApplication[] = [];
  applicationsSelected: any = ['All'];

  // comparitive
  metricItems = [
    {
      name: 'Rate',
      value: 'Rate'
    },
    {
      name: 'Packet',
      value: 'Packet'
    }
  ];

  metricSelected = 'Rate';
  isMultiple = false;
  loadedMultipleChart: any = [];

  constructor(private realTimeTrafficService: RealTimeTrafficService, private dialogService: NgbModal) { }
  ngOnDestroy(): void {
    this.realTimeTrafficService.closeSocketConnection();
  }

  ngOnInit(): void {
    const socketUrl$ = this.realTimeTrafficService.getSocketUrl();
    switch (this.trafficType) {
      case 'Network':
        socketUrl$.subscribe(result => {
          this.socketUrl = result.signedurl;
          this.connectToSocket();
        });
        this.getCount();
        break;
      case 'Locations':
        socketUrl$.subscribe(result => {
          this.socketUrl = result.signedurl;
        });
        this.getLocations();
        break;
      case 'Applications':
        socketUrl$.subscribe(result => {
          this.socketUrl = result.signedurl;
        });
        this.getLocations();
        this.getApplications();
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
    if (this.isMultiple) {
      this.loadMultipleChart();
      return;
    }
    switch (this.trafficType) {
      case 'Network':
        this.showRealTime = true;
        this.realTimeTrafficService.openSocketConnection(this.socketUrl, 'NET',
          {
            delay: 60, graphType: "TRF,TAPP,TLOC,TEP",
            monitorId: "12921722_0", monitorType: "NET",
            networkId: "12921722_0", orgId: "12921722",
            outputStartTimeDiffToCur: 135114,
            startTime: new Date().getTime(),
            windowLen: this.selectedTimeFrame,
          });
        break;
      case 'Locations':
        this.showRealTime = false;
        this.realTimeTrafficService.pushMessage('remove', 'LOC');
        this.realTimeTrafficService.openSocketConnection(this.socketUrl, 'LOC',
          {
            delay: 60, graphType: "TRF,TAPP,TEP",
            monitorId: this.getLocationMonitorIds(),
            monitorType: "LOC", networkId: "12921722_0",
            orgId: "12921722", startTime: new Date().getTime(),
          });
        setTimeout(() => this.showRealTime = true, 500);
        break;
      case 'Applications':
        this.showRealTime = false;
        this.realTimeTrafficService.pushMessage('remove', 'APP');
        this.realTimeTrafficService.openSocketConnection(this.socketUrl, 'APP',
          {
            delay: 60, graphType: "TRF,TLOC,TEP",
            monitorId: this.getApplicationMonitorIds() + '@@' + this.getLocationMonitorIds(),
            monitorType: "APP", networkId: "12921722_0",
            orgId: "12921722", startTime: new Date().getTime(),
          });
        setTimeout(() => this.showRealTime = true, 500);
        break;
    }
    this.clearCacheData();
    this.realTimeTrafficService.socketStream$.subscribe(
      result => {
        this.data = result;
        if (result.confData.graphType === 'TEP') {
          this.listenMessageTEP(result);
        }
        if (result.confData.graphType === 'TAPP') {
          this.listenMessageTAPP(result);
        }
        if (result.confData.graphType === 'TLOC') {
          this.listenMessageTLOC(result);
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
    this.realTimeTrafficService.openSocketConnection(this.socketUrl, "RECORDING", request);
    this.closeAllModal();
  }

  applyFilter() {
    this.connectToSocket();
  }

  clearFilter() {
    this.selectedTimeFrame = 1;
    this.locationsSelected = ['All'];
    this.applicationsSelected = ['All'];
    this.loadedMultipleChart = [];
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

  listenMessageTEP(data: any): any {

    this.percentTEP = {
      downPercentage: data.downPercentage ? data.downPercentage : 0,
      upPercentage: data.upPercentage ? data.upPercentage : 0
    };

    let len = 5;
    let upLen = data['upData']?.length;
    let downLen = data['downData']?.length;
    if (upLen >= len) {
      upLen = len;
    }

    if (downLen >= len) {
      downLen = len;
    }

    this.percentTEP.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.percentTEP.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settUpData(data.upData);
    this.setDownData(data.downData)

    this.streamTEP["upData"] = data.upData;
    this.streamTEP["downData"] = data.downData;

    let topEndPointUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, '');
    let topEndPointDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, '');


    topEndPointUpChartoptions.chart.height = 160;

    topEndPointUpChartoptions.plotOptions.series.pointWidth = 14;

    topEndPointDownChartoptions.chart.height = 160;
    topEndPointDownChartoptions.plotOptions.series.pointWidth = 14;

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
      },
      events: {
      }
    }
    topEndPointUpChartoptions['plotOptions'].series.point.events = {

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
      },
      events: {

      }
    }
    topEndPointDownChartoptions.plotOptions.series.point.events = {

    };

    topEndPointDownChartoptions.plotOptions.series.color = '#5ACFEA';

    topEndPointUpChartoptions = Object.assign({}, topEndPointUpChartoptions);
    topEndPointDownChartoptions = Object.assign({}, topEndPointDownChartoptions);

    this.topEndPointUpChartoptions = topEndPointUpChartoptions;
    this.topEndPointDownChartoptions = topEndPointDownChartoptions;
  }

  listenMessageTAPP(data?: any): any {
    this.percentTAPP = {
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

    this.percentTAPP.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.percentTAPP.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settUpData(data.upData);
    this.setDownData(data.downData);

    this.streamTAPP["upData"] = data.upData;
    this.streamTAPP["downData"] = data.downData;

    let topAppsUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, false);
    let topAppsDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, false);

    topAppsUpChartoptions.chart.height = 160;
    delete topAppsUpChartoptions.chart.width;
    topAppsUpChartoptions.plotOptions.series.pointWidth = 14;

    topAppsDownChartoptions.chart.height = 160;
    delete topAppsDownChartoptions.chart.width;
    topAppsDownChartoptions.plotOptions.series.pointWidth = 14;

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
      },
      events: {
      }
    }
    topAppsUpChartoptions.plotOptions.series.point.events = {
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
      },
      events: {
      }
    }
    topAppsDownChartoptions.plotOptions.series.point.events = {
    }

    topAppsDownChartoptions.plotOptions.series.color = '#5ACFEA';

    this.topApplicationsUpChartoptions = { ...topAppsUpChartoptions };
    this.topApplicationsDownChartoptions = { ...topAppsDownChartoptions };

  }

  listenMessageTLOC(data: any): any {
    this.percentTLOC = {
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

    this.percentTLOC.upPercentage = this.realTimeTrafficService.calculatePercentage(data.upTotal, data.upData, len);
    this.percentTLOC.downPercentage = this.realTimeTrafficService.calculatePercentage(data.downTotal, data.downData, len);

    this.settUpData(data.upData);
    this.setDownData(data.downData);

    this.streamTLOC["upData"] = data.upData;
    this.streamTLOC["downData"] = data.downData;

    let topLocationsUpChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'upData', len, false);
    let topLocationsDownChartoptions = this.realTimeTrafficService.makeOptionsForRTBC(data, 'bar', 'downData', len, false);

    topLocationsUpChartoptions.chart.height = 160;
    delete topLocationsUpChartoptions.chart.width;
    topLocationsUpChartoptions.plotOptions.series.pointWidth = 14;

    topLocationsDownChartoptions.chart.height = 160;
    delete topLocationsDownChartoptions.chart.width;
    topLocationsDownChartoptions.plotOptions.series.pointWidth = 14;

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

  public settUpData(data: any): any {
    let obj = {};
    data?.forEach((element: any) => {
      //@ts-ignore
      obj[element.name] = element.id;
    });

    this.tepUpDataObj = obj;
  }

  public setDownData(data: any): any {
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
    if (this.isMultiple) {

    } else {
      if (this.locationsSelected.length > 1 && this.locationsSelected.includes('All')) {
        if (this.locationsSelected[0] === 'All') {
          this.locationsSelected = this.locationsSelected.filter((l: any) => l !== 'All');
        }
        else if (this.locationsSelected.pop() === 'All') {
          this.locationsSelected = ['All'];
        }
      }
    }
  }

  getLocations() {
    this.realTimeTrafficService.getLocations().subscribe(result => {
      result.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      this.locationItems = result;
      if (!this.isMultiple) {
        this.locationItems.unshift({
          name: 'All', _id: 'All',
          address: '',
          geo: '',
          orgId: '',
          region: '',
          subnetsV4: '',
          subnetsV6: '',
          tenantId: 0
        });
      }
    });
  }

  getLocationMonitorIds(): string {
    return (this.locationsSelected.length === 1 && this.locationsSelected[0] === 'All')
      ? this.locationItems.filter(l => l._id !== 'All').map(l => l._id).join(',')
      : this.locationsSelected.join(',');
  }

  clearCacheData() {
    this.topEndPointUpChartoptions = null;
    this.topEndPointDownChartoptions = null;
    this.topApplicationsUpChartoptions = null;
    this.topApplicationsDownChartoptions = null;
    this.topLocationsUpChartoptions = null;
    this.topLocationsDownChartoptions = null;
  }

  // Applications

  getApplications() {
    this.realTimeTrafficService.getApplications().subscribe(result => {
      result.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      this.applicationItems = result;
      if (!this.isMultiple) {
        this.applicationItems.unshift({
          name: 'All', _id: 'All',
          addressesV4: '',
          addressesV6: '',
          engineId: '',
          extAppEnum: '',
          extProtocolId: '',
          orgId: '',
          ports: '',
          protocol: '',
          rangePorts: '',
          tenantId: 0
        });
      }
    });
  }

  changeApplication() {
    if (this.isMultiple) {

    } else {
      if (this.applicationsSelected.length > 1 && this.applicationsSelected.includes('All')) {
        if (this.applicationsSelected[0] === 'All') {
          this.applicationsSelected = this.applicationsSelected.filter((l: any) => l !== 'All');
        }
        else if (this.applicationsSelected.pop() === 'All') {
          this.applicationsSelected = ['All'];
        }
      }
    }
  }

  getApplicationMonitorIds(): string {
    return (this.applicationsSelected.length === 1 && this.applicationsSelected[0] === 'All')
      ? this.applicationItems.filter(l => l._id !== 'All').map(l => l._id).join(',')
      : this.applicationsSelected.join(',');
  }

  // comparitive

  setMultiple(mutiple: boolean): void {
    this.isMultiple = mutiple;
    this.applicationItems = this.applicationItems.filter(a => a.name !== 'All');
    this.locationItems = this.locationItems.filter(a => a.name !== 'All');
    //this.clearFilter();
  }

  clearChartContainer(values: any) {
    var findindex = this.loadedMultipleChart.findIndex((x: any) => x.monitorId === values.monitorId && x.Type === values.Type && x.Position === values.Position);
    if (findindex > -1) {
      this.loadedMultipleChart.splice(findindex, 1);
    }
    if (this.loadedMultipleChart.length <= 9) {
      this.disableApply = false;
    }
  }

  loadMultipleChart() {
    let IsDuplicate = false;
    let doWSCall = true;
    let position = 0;
    let monitorId = this.constructMultipleMonitorId(this.applicationsSelected, this.locationsSelected);
    if (this.loadedMultipleChart.length > 0) {
      this.loadedMultipleChart.forEach((element: any) => {
        if (element.monitorId === monitorId) {
          doWSCall = false;
        }
        if (element.monitorId === monitorId && element.selectedTime === this.selectedTimeFrame && element.Type === this.metricSelected) {
          IsDuplicate = true;
        }
        if (element.monitorId === monitorId && element.Type === this.metricSelected) {
          position = position + 1;
        }
      });
    }
    let multipleLocationName = this.locationItems.find(l => l._id === this.locationsSelected)?.name + ' - ';
    let multipleApplicationName = this.applicationItems.find(l => l._id === this.applicationsSelected)?.name + ' - ';

    if (!IsDuplicate) {
      this.loadedMultipleChart.push({
        monitorId: monitorId,
        Type: this.metricSelected,
        Name: this.trafficType === 'Applications' ? multipleApplicationName + multipleLocationName : multipleLocationName,
        windowLen: this.selectedTimeFrame,
        IsDuplicate: IsDuplicate,
        Position: position,
        doWSCall: doWSCall,
        replay: false,
        startTime: (new Date()).getTime(),
        selectedTime: this.selectedTimeFrame
      });
      this.loadedMultipleChart = [...this.loadedMultipleChart];
    }

    if (this.loadedMultipleChart.length > 8) {
      this.disableApply = true;
    } else {
      this.disableApply = false;
    }
  }

  constructMultipleMonitorId(applicationid: any, locationid: any) {
    let monitorId = "";

    if (this.trafficType === 'Locations') {
      monitorId = locationid;
    }
    else {
      monitorId = applicationid + '@@' + locationid
    }
    return monitorId;
  }
}
