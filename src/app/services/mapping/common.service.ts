import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public currentPageData = new Subject<any>();
  public currentOrgData = new Subject<any>();
  public scrollTop = new Subject<any>();
  public closeAlerts = new Subject<any>();
  public successAlert = new Subject<any>();
  public errorAlert = new Subject<any>();
  recordView = {
    show: false
  }
  errorInfo: any;
  scopeMapping = {
    //csc
    apps: 'Applications',
    experienceiq: 'ExperienceIQ',
    protectiq: 'ProtectIQ ',
    cpe: 'Router',
    backup_restore: 'Backup/Restore',
    calloutcome: 'Call Outcome',
    call_avoidance: "Call Avoidance",
    call_outcome: "Call Outcome Report",
    audit_Report: "Audit Report",
    comm_logs: "Communication Logs",
    config: "Configuration",
    config_files: "Configuration files",
    configuration: "Configuration",
    connect_device: "Connect To Device",
    dashboards: "Dashboard",
    data: "Data",
    data_model: "Data Model",
    device_group: "System Groups",
    device_logs: "Device Logs",
    devices: "Devices",
    devices_delete: "Delete Device",
    dial_plan: "Dial Plan",
    enablement: "Enablement",
    event_history: "Event History",
    ext_file_server: "External File Server",
    factory_reset: "Factory Reset",
    gfast: "GFAST",
    inv_report: "Inventory Report",
    l2security: "Security",
    mgmt: "Subscriber Mgmt",
    netops: "NetOps",
    operations: "Operations",
    perf_testing: "Performance Testing",
    ping: "Ping",
    profiles: "Profiles",
    reboot: "Reboot",
    reports: "Reports",
    search: "Subscriber Search",
    secure_onboarding: "Secure Onboarding",
    self_heal: "Self Healing",
    services: "Services",
    site_scan: "SiteScan",
    speed_test: "Run Speed Test",
    stale_purge: "Stale System Purge",
    subnet_config: "Subnet Configuration",
    subscribers: "Subscriber Records",
    sw_images: "Software Images",
    trace_route: "Traceroute",
    trafficreports: "Traffic Reports",
    unassociated_devices: "Unassociated Devices",
    update_image: "Update Software",
    video: "Video",
    voice: "Voice",
    websitecheck: "Website Check",
    wifi: "WiFi",
    workflow: "Workflows",
    xdsl: "XDSL",

    //cmc
    exploredata: "Explored Data",

    //shad
    service: "SHAD Service Access",
    networktrends: "Network Trends",
    "subscribersystems": "Subscriber Systems",
    "activealarm": "Active Alarms",
    "activepons": "Active PONs",
    "biperrors": "BIP Errors",
    "subscriberimpacted": "Subscriber Impacted",
    "cmndiqstatus": "Command IQ Status",
    "revedgesuitestatus": "Subscribers by Revenue EDGE Suite",
    "systemmodel": "Systems by Model",
    "systemstatus": "Systems Status",
    "systemtype": "Systems by Type",
    "historyalarm": "Historical Reports",
    "calloutcomereports": "Call Outcome",
    "epcountbymapper": "Endpoint Count By Mapper",
    "invreports": "Inventory Reports",
    "mappedeplists": "Mapped Endpoint Lists",
    "ontdevices": "ONT Systems",
    "unassociatedsystems": "Unassociated Systems",
    "unmappedips": "UnMapped IPs",
    "nwdelete": "Network Delete",
    "nwdisconnect": "Network Disconnect",
    "pon": "PON",
    "ont": "ONT",
    "edgesuitesbulkprovisioning": "EDGE Suites Bulk Provisioning",
    "wan_status": "WAN Status",
    "ae": "Active Ethernet",/* CCL-46149 */
    "alarmnotifications": "Alarm Notifications",
    "transformalarmrules": "Transform Alarm Rules",
    "subscriber": "Subscriber Operations",
    "realtime": "Real Time",
    "mycommunityiq": "MyCommunityIQ",
    "revedgesuiteecosystemstatus": "Subscribers with Revenue EDGE Ecosystem Suites",
    "revenue": "Revenue",
    "auditreport": "Audit Report"
  };

  constructor() {

  }

  pageScrollTop() {
    this.scrollTop.next('');
  }

  closeAlert() {
    this.closeAlerts.next('');
  }

  pageInvalidRqstErrorHandle(err: HttpErrorResponse) {
    let errorResp = err.error;
    let infoBody = '';
    if (errorResp.hasOwnProperty('error_code')) {
      infoBody = `${errorResp.error_code}`;
    } else if (typeof errorResp.error == 'string') {
      infoBody = `${errorResp.error}`;
    } else if (err.status && err.status == 401) {
      this.errorInfo = "User Unauthorized";
    } else {
      infoBody = `${err.message}`;
    }
    return (infoBody != 'undefined' && infoBody.length) ? infoBody : Object.values(this.flatten(err)).join(' - ');
  }

  pageErrorHandle(err: HttpErrorResponse) {
    if (err.error != undefined && err.error != null && typeof err.error == 'string') {
      // this.errorInfo = `${err.error}`;
      if (this.IsJsonString(err.error)) {
        let error = JSON.parse(err.error);
        this.errorInfo = error.message ? error.message : `${err.error}`;
      } else {
        this.errorInfo = `${err.error}`;
      }
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.message != undefined && typeof err.error.message == 'string') {
      this.errorInfo = `${err.error.message}`;
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.errorDesc != undefined && typeof err.error.errorDesc == 'string') {
      this.errorInfo = `${err.error.errorDesc}`;
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.error != undefined && typeof err.error.error == 'string') {
      this.errorInfo = `${err.error.error}`;
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.error_code != undefined && typeof err.error.error_code == 'string') {
      this.errorInfo = `${err.error.error_code}`;
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.fault != undefined && typeof err.error.fault == 'string') {
      this.errorInfo = `${err.error.fault}`;
    } else if (err.error != undefined && typeof err.error == 'object' && err.error.fault != undefined && typeof err.error.fault == 'object' && err.error.fault.faultstring != undefined && typeof err.error.fault.faultstring == 'string') {
      this.errorInfo = `${err.error.fault.faultstring}`;
    } else if (err.error && err.error.errorMessage) {
      this.errorInfo = `${err.error.errorMessage}`;
    } else if (err.error && err.error.message) {
      this.errorInfo = `${err.error.message}`;
    } else if (err.status === 500) {
      this.errorInfo = `Internal Server Error`;
    } else if (err.statusText == 'Unknown Error' && err.status == 0) {
      this.errorInfo = "Unknown Error - Please refresh the page";
    } else if (err.status && err.status == 401) {
      this.errorInfo = "User Unauthorized";
    } else {
      this.errorInfo = `${err.message}`;
    }
    return (this.errorInfo != 'undefined' && this.errorInfo.length) ? this.errorInfo : Object.values(this.flatten(err)).join(' - ');
  }

  openErrorAlert(info: string) {
    this.errorAlert.next(info);
  }

  flatten(obj: HttpErrorResponse) {
    let flattenedObject = {};
    try {
      this.traverseAndFlatten(obj, flattenedObject);
    } catch (ex) {
      flattenedObject = {};
    }
    return flattenedObject;
  }

  traverseAndFlatten(currentNode: any, target: { [x: string]: any; }, flattenedKey?: string | undefined) {
    for (var key in currentNode) {
      if (currentNode.hasOwnProperty(key)) {
        var newKey;
        if (flattenedKey === undefined) {
          newKey = key;
        } else {
          newKey = flattenedKey + '.' + key;
        }

        var value = currentNode[key];
        if (typeof value === "object") {
          this.traverseAndFlatten(value, target, newKey);
        } else {
          target[newKey] = value;
        }
      }
    }
  }

  IsJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
