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

  constructor(private realTimeTrafficService: RealTimeTrafficService) { }

  ngOnInit(): void {
    this.realTimeTrafficService.getSocketUrl().subscribe(result => {
      console.log(result);
      this.realTimeTrafficService.getSocketConnection(result.signedurl);
      this.realTimeTrafficService.netSocketStream$.subscribe(
        result => {
          this.data = result;
          console.log(result.confData.graphType);
          if (result.confData.graphType != 'TRF') {
            this.makeTEPEvents(result);
          }
        });
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

    console.log('up', this.topEndPointUpChartoptions);
    console.log('down', this.topEndPointDownChartoptions);
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
