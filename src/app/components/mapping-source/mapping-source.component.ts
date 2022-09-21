import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var require: any;
const $: any = require('jquery');
import * as _ from 'lodash';
import { EndpointMappingSourceService } from 'src/app/services/mapping/endpoint-mapping-source.service';
import { CommonService } from 'src/app/services/mapping/common.service';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';

@Component({
  selector: 'app-mapping-source',
  templateUrl: './mapping-source.component.html',
  styleUrls: ['./mapping-source.component.scss']
})
export class MappingSourceComponent implements OnInit, OnDestroy {

  pageAvailable: boolean = false;
  load: boolean = false;

  public selectList: any = [];
  public unselectList: any = [];
  public edit: boolean = false;
  public showTab: boolean = false;
  currentRuleData: any;
  sbscbrCurrentRuleData: any;
  ruleName: any;

  mpngRuleObj: any = {};
  mpnPrcdnce: any = [];
  sbscbrRuleObj: any = {};
  sbscbrselectList: any = [];
  unsbscbrselectList: any = [];
  aggregationRuleObj: any = {};
  aggregationRuleFields: any = [];
  aggregationCurrentRuleData: any;
  aggregationMatchRules: any = {
    DHCP: [],
    AA: [],
    CUSTOM: [],
    SMx: [],
    DHCP_DELIMITER: '',
    AA_DELIMITER: '',
    CUSTOM_DELIMITER: '',
    SMx_DELIMITER: ''
  };
  aggregationRuleFieldsLength = 0;

  mappingRuleFields: any = [
    'MAC Address', 'Serial Number', 'Registration Id', 'Phone', 'account', 'Region', 'Network AID', 'Port Type', 'Subscriber Info', 'Subscriber Description', 'Additional Info', 'B-RAS IP', 'Router Interface', 'VLAN', 'DSLAM Node', 'DSLAM Vendor'
  ];

  customMappingRules = ['Name'];

  mpngRuleObjDefault: any = {
    "DHCP": ["dhcpCircuitId", "dhcpRemoteId", "dhcpClientHostName", 'macAddress', "dhcpSubscriberId"],
    "RADIUS": ["radiusUserName"],
    "CC": ["serialNumber", "subscriberName", "registrationId", "subscriberAccount"],
    "AA": ["macAddress", "cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["cmSerialNumber", "cmRegistrationId", "cmAccount", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "RDNS": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "MAC": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "ASSIGNED": ["assignedName"], // changed from 'assigned_name' to  'assignedName' to fix CCL-31439
    "CMS": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "STATIC": [],
    "FA": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "AXOS": ["ipAddress", "macAddress", "cmSerialNumber"], //CCL-41677
    "EXA": ["ipAddress", "macAddress", "cmSerialNumber"], //CCL-41677
    "SMx": ["cmSerialNumber", "cmRegistrationId", "cmAccount", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"]
  };


  aggregationRuleObjDefault: any = {
    //"DHCP": ["dhcpCircuitId", "dhcpRemoteId", "dhcpClientHostName", "dhcpSubscriberId"], // commented to fix CCL-34094
    "AA": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "SMx": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"]
  };

  delimiters = [
    '_',
    '-',
    '/',
    '~',
    '#'
  ];
  delimiterSelected = '_';
  aggregationdelimiterSelected = '_';

  //allPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "CMS", "FA", "STATIC"];
  //allPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "FA", "STATIC"]; // removed CMS to fix CCL-25481
  //allPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "STATIC", "AXOS", "EXA"]; // removed FA to fix CCL-32885
  allPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "STATIC", "AXOS", "EXA", "SMx"]; // Added "AXOS", "EXA" to fix CCL-41677

  mappingRuleFieldsLength = 0;
  sbscbrRuleFieldsLength = 0;
  subscriberMatchRules: any = [];

  sbscbrRuleFields: any = [
    'MAC Address', 'Serial Number', 'Registration Id', 'Phone', 'account', 'Region', 'Network AID', 'Port Type', 'Subscriber Info', 'Subscriber Description', 'Additional Info', 'B-RAS IP', 'Router Interface', 'VLAN', 'DSLAM Node', 'DSLAM Vendor'
  ];

  sbscbrRuleObjDefault: any = {
    "DHCP": ["ip_address", "mac_address", "dhcp_circuit_id", "dhcp_client_host_name", "dhcp_remote_id", "dhcp_subscriber_id"],
    "RADIUS": ["ip_address", "mac_address", "radius_user_name"],
    "CC": ["ip_address", "mac_address", "cc_server_info_id", "cc_cpe_id", "serial_number", "registration_id", "provisioning_code", "persistent_data", "subscriber_type", "subscriber_name", "subscriber_account", "sxa_cc_subscriber_id", "subscriber_phone", "email"],
    "AA": ["ip_address", "mac_address", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "vlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "RDNS": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "MAC": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "ASSIGNED": ["ip_address", "mac_address", "assigned_name"],
    "CMS": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "STATIC": ["ip_address", "mac_address",],
    "FA": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "SMx": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"]
  };

  sbscbrallPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "CMS", "FA", "STATIC"];

  title: any = {
    "cmSerialNumber": "Serial Number",
    "dhcp_circuit_id": "DHCP Circuit Id",
    "dhcp_client_host_name": "DHCP Client Hostname",
    "dhcp_remote_id": "DHCP Remote Id",
    "dhcp_subscriber_id": "DHCP Subscriber Id",
    "serial_number": "Serial Number",
    "dhcpCircuitId": "DHCP Circuit Id",
    "dhcpRemoteId": "DHCP Remote Id",
    "dhcpClientHostName": "DHCP Client Hostname",
    "dhcpSubscriberId": "DHCP Subscriber Id",
    "radiusUserName": "Radius Username",
    "serialNumber": "Serial Number",
    "subscriberName": "SubscriberName",
    "registrationId": "Registration Id",
    "subscriberAccount": "Location_ID",
    "cmRegistrationId": "Registration Id",
    "cmPhone": "Phone",
    "cmRegion": "Region",
    "cmMappedName": "Mapped Name",
    "cmNetworkName": "Network Name",
    "cmDeviceType": "Device Type",
    "cmNetworkAid": "Network AID",
    "cmPortType": "Port Type",
    "cmSubscriberInfo": "Subscriber Info",
    "cmSubscriberDesc": "Subscriber Description",
    "cmBrasIp": "B-RAS IP",
    "cmRouterIf": "Router Interface",
    "cmOrgSpecific": "Org Specific",
    "vlan": "VLAN",
    "cmDslamNode": "DSLAM Node",
    "cmDslamVendor": "DSLAM Vendor",
    "assigned_name": "Assigned Name",
    "DHCP": "DHCP",
    "RADIUS": "RADIUS",
    "CC": "Consumer Connect",
    "AA": "Access Analyze",
    "CUSTOM": "Custom",
    "RDNS": "RDNS",
    "MAC": "MAC",
    "ASSIGNED": "ASSIGNED",
    "CMS": "CMS",
    "FA": "FLOW ANALYZE",
    "STATIC": "",
    "ip_address": "Ip Address",
    "mac_address": "MAC Address",
    "cm_serial_number": "Serial Number",
    "cm_registration_id": "Registration Id",
    "cm_mapped_name": "Mapped Name",
    "cm_address": "Address",
    "cm_phone": "Phone",
    "cm_email": "Email",
    "cm_account": "Account",
    "cm_region": "Region",
    "cm_network_name": "Network Name",
    "cm_device_type": "Device Type",
    "cm_network_aid": "Network Aid",
    "cm_port_type": "Port Type",
    "cm_subscriber_info": "Subscriber Info",
    "cm_subscriber_desc": "Subscriber Desc",
    "cm_org_specific": "Org Specific",
    "cm_alt_title": "Alt Title",
    "cm_bras_ip": "B-RAS IP",
    "cm_router_intf": "Router Interface",
    "cm_vlan": "VLAN",
    "cm_dslam_node": "DSLAM Node",
    "cm_dslam_vendor": "DSLAM Vendor",
    "radius_user_name": "Radius User Name",
    "cc_server_info_id": "Server Info Id",
    "cc_cpe_id": "CPE Id",
    "registration_id": "Registration Id",
    "provisioning_code": "Provisioning Code",
    "persistent_data": "Persistent Data",
    "subscriber_type": "Subscriber Type",
    "subscriber_name": "Subscriber Name",
    "subscriber_account": "Location_ID",
    "sxa_cc_subscriber_id": "Subscriber Id",
    "subscriber_phone": "Subscriber Phone",
    "email": "Email",
    "macAddress": "MAC Address",
    "cmVlan": "VLAN",
    "assignedName": "Assigned Name",
    "cmAccount": "Account",
    "AXOS": "AXOS",
    "EXA": "EXA",
    "ipAddress": "Ip Address"
  };

  ORG_ID: string;
  loaded: boolean = false;
  @ViewChild('infoModal', { static: true }) private infoModal: any;
  @ViewChild('aggregWarningModal', { static: true }) private aggregWarningModal: any;
  infoTitle: any;
  infoBody: any;

  emptyRule: any = [
    {
      attrs: [],
      delimiter: ""
    }
  ];
  loading: boolean = true;
  modalRef: any;
  translateSubscribe: any;
  getListSubs: any;
  saveSubs: any;
  createOrgSubs: any;
  updateSubs: any;
  deleteSubs: any;
  latestAggreData: any;
  latestAggreDataDeLimit: string = '';

  showKeyConfig: boolean = false;
  keyConfigDefaultObj: any = {
    macAddress: false,
    remoteId: false,
    circuitId: false,
    subscriberId: false,
    clientHostName: false
  };

  keyConfigEditObj: any = {};
  keyConfigEditBFRObj: any = {};
  keyConfigLoading: boolean = false;
  keyConfigSubs: any;
  keyConfigs: any = {};
  addKeyConfigSusbs: any;
  showSubsRule: boolean = false;
  isDev: boolean;
  private isProd = false;
  private module: string
  constructor(
    private service: EndpointMappingSourceService,
    private router: Router,
    private dialogService: NgbModal,
    private commonOrgService: CommonService,
    private loginProviderService: LoginProviderService,
  ) {
    this.loginProviderService.getToken();
    let url = this.router.url;
    this.ORG_ID = '12944972';
    this.pageAvailable = true;

    this.commonOrgService.closeAlert();//*Imp
    this.isDev = false;
    this.isProd = true;
    this.module = 'organization-admin';
    if (this.module !== 'systemAdministration') {
      let entitlement = window.localStorage.getItem('calix.entitlements') ? JSON.parse(window.localStorage.getItem('calix.entitlements') ?? '') : [];
      if (entitlement && !entitlement[102]) {
        this.allPrcdns = this.allPrcdns.filter(ele => !["AXOS", "EXA"].includes(ele)); /* CCL-49687 */ /* CCL-50408 */
      }
    }

  }

  ngOnInit() {
    this.getData();
  }

  ngAfterViewInit(): void {
    this.loaded = true;
  }

  ngOnDestroy(): void {
    if (this.translateSubscribe) {
      this.translateSubscribe.unsubscribe();
    }

    if (this.getListSubs) {
      this.getListSubs.unsubscribe();
    }
    if (this.saveSubs) {
      this.saveSubs.unsubscribe();
    }
    if (this.createOrgSubs) {
      this.createOrgSubs.unsubscribe();
    }
    if (this.updateSubs) {
      this.updateSubs.unsubscribe();
    }
    if (this.deleteSubs) {
      this.deleteSubs.unsubscribe();
    }
    if (this.keyConfigSubs) this.keyConfigSubs.unsubscribe();
    if (this.addKeyConfigSusbs) this.addKeyConfigSusbs.unsubscribe();
  }

  doEdit(): void {
    this.edit = true;


  }

  addItemTolist(item: any): void {
    this.selectList.push(item);

    let myArray = this.unselectList.filter(function (obj: any) {
      return obj.id !== item.id;
    });

    this.unselectList = myArray;
  }

  deleteItemFromList(): void { }

  cancel(): void {
    this.edit = false;
  }

  cancelWithGet(): void {
    this.selectList = []
    this.cancel();
    this.getData();
  }

  submit(): void {
    this.edit = false;
  }

  addItemToMappingRule(name: string, index?: any, field?: any): void {
    if (!this.mpngRuleObj[name]) {
      this.mpngRuleObj[name] = {
        data: [],
        key: name,
        name: name,
        rules: [
          { attrs: [], delimiter: '' }
        ]
      };
    } else if (this.mpngRuleObj[name] && !this.mpngRuleObj[name]?.rules?.length) {
      this.mpngRuleObj[name].rules.push({ attrs: [], delimiter: '' });
    }
    let data = this.mpngRuleObj[name];

    data.rules[index].attrs.push(field);
    if (data.rules[index].attrs && data.rules[index].attrs.length == 2) {
      data.rules[index].delimiter = '_';
    }

    this.mpngRuleObj[name] = data;
    this.currentRuleData = data;

    let fields = this.mappingRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  addItemToSbscbrMappingRule(name: string, index?: any, field?: any): void {
    let data = this.sbscbrRuleObj[name];

    data.rules[index].attrs.push(field);

    this.sbscbrRuleObj[name] = data;
    this.sbscbrCurrentRuleData = data;

    let fields = this.sbscbrRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.sbscbrRuleFields = fields;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;

    if (field && this.subscriberMatchRules.indexOf(field) === -1) {
      this.subscriberMatchRules.push(field);
    }

  }


  addItemToAggregationMappingRule(name: string, index?: any, field?: any): void {
    let data = this.aggregationRuleObj[name];

    data.rules[index].attrs.push(field);

    if (data.rules[index].attrs && data.rules[index].attrs.length == 2) {
      this.aggregationdelimiterSelected = '_';
    }

    this.aggregationRuleObj[name] = data;
    this.sbscbrCurrentRuleData = data;

    let fields = this.aggregationRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.aggregationRuleFields = fields;

    this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;

    if (field && this.aggregationMatchRules[name].indexOf(field) === -1) {
      this.aggregationMatchRules[name].push(field);
    }

    this.aggregationMatchRules[`${name}_DELIMITER`] = this.aggregationdelimiterSelected;

  }

  changeAggregationDelimiter(name: string) {
    this.aggregationMatchRules[`${name}_DELIMITER`] = this.aggregationdelimiterSelected;
  }


  showAggregation = false;
  getCurrentRule(key: any): void {

    if (!this.mpngRuleObj[key]) {
      this.mpngRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: [], delimiter: '' }
        ]
      };
    }
    this.currentRuleData = this.mpngRuleObj[key];
    //this.mappingRuleFields = this.mpngRuleObjDefault[key];

    this.showTab = true;

    this.ruleName = key;

    let el = document.getElementById('sxa-color-gold-' + key) as HTMLElement;
    el.style.display = 'block';

    let rules = this.currentRuleData.rules;
    let fields = [...this.mpngRuleObjDefault[key]];

    for (let i = 0; i < rules.length; i++) {
      let attrs = rules[i].attrs;
      let delimit = rules[i].delimiter;
      if (delimit && !this.delimiters.includes(delimit)) {
        rules[i].delimiter = '_';
      }
      if (attrs.length) {
        for (let j = 0; j < attrs.length; j++) {
          let fI = fields.indexOf(attrs[j]);

          if (fI !== -1) {
            fields.splice(fI, 1);
          }

        }
      }

    }

    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

    //adding deafult rules to the mappings
    // if (!rules.length || (rules.length == 1 && !rules[0]?.attrs?.length)) {
    //   if (key == 'RADIUS') {
    //     this.addItemToMappingRule('RADIUS', 0, "radiusUserName");
    //   } else if (key == 'CC') {
    //     this.addItemToMappingRule('CC', 0, "serialNumber");
    //   } else if (key == 'DHCP') {
    //     this.addItemToMappingRule('DHCP', 0, "macAddress");
    //   } else if (key == 'CUSTOM') {
    //     //this.addItemToMappingRule('DHCP', 0, "serialNumber");
    //   }
    // }

    /** subscriber match rules */

    let attrs = [];
    fields = [];
    let sbscbrRuleFields = this.sbscbrRuleObjDefault[key] ? this.sbscbrRuleObjDefault[key] : [];
    this.showSubsRule = false;
    if (this.sbscbrRuleObjDefault[key]) {
      this.showSubsRule = true;
    }
    for (let i = 0; i < sbscbrRuleFields.length; i++) {
      if (this.subscriberMatchRules.indexOf(sbscbrRuleFields[i]) !== -1) {
        attrs.push(sbscbrRuleFields[i]);
      } else {
        fields.push(sbscbrRuleFields[i]);
      }
    }

    if (!this.sbscbrRuleObj[key]) {
      this.sbscbrRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: attrs, delimiter: '' }
        ]
      };
    } else {
      this.sbscbrRuleObj[key].rules[0].attrs = attrs;
    }
    this.sbscbrCurrentRuleData = this.sbscbrRuleObj[key];

    this.sbscbrRuleFields = fields;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;


    /** aggregation  match rules */

    attrs = [];
    fields = [];

    /* CCL-43855 */
    Object.keys(this.aggregationRuleObjDefault).forEach(key => {
      this.aggregationRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: this.aggregationMatchRules[key], delimiter: '' }
        ]
      }
    })
    /* CCL-43855 */

    let aggregationRuleFields = this.aggregationRuleObjDefault[key]?.slice(0);
    if (aggregationRuleFields) {
      //debugger
      this.showAggregation = true;
      // for (let i = 0; i < aggregationRuleFields.length; i++) {
      //   if (this.aggregationMatchRules[key].indexOf(aggregationRuleFields[i]) !== -1) {
      //     attrs.push(aggregationRuleFields[i]);
      //   } else {
      //     fields.push(aggregationRuleFields[i]);
      //   }
      // }

      let rules = this.aggregationMatchRules[key] ? this.aggregationMatchRules[key] : [];
      fields = aggregationRuleFields;
      for (let i = 0; i < rules.length; i++) {
        if (fields.includes(rules[i])) {
          attrs.push(rules[i]);
          //setTimeout(() => {
          fields = fields.filter(el => el !== rules[i]);
          //}, 0);

        }
      }



      if (!this.aggregationRuleObj[key] && aggregationRuleFields) {
        this.aggregationRuleObj[key] = {
          data: [],
          key: key,
          name: key,
          rules: [
            { attrs: attrs, delimiter: '' }
          ]
        };
      } else {
        this.aggregationRuleObj[key].rules[0].attrs = attrs;
      }

      this.aggregationdelimiterSelected = this.aggregationMatchRules[`${key}_DELIMITER`] ? this.aggregationMatchRules[`${key}_DELIMITER`] : '_';

      this.aggregationCurrentRuleData = this.aggregationRuleObj[key];
      this.latestAggreData = this.aggregationCurrentRuleData ? _.cloneDeep(this.aggregationCurrentRuleData) : {};
      this.latestAggreDataDeLimit = this.aggregationdelimiterSelected;
      this.aggregationRuleFields = fields;

      this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;
    } else {
      this.showAggregation = false;
      this.latestAggreData = undefined;
    }


    this.showTab = true;

    this.ruleName = key;

    if (key == 'DHCP') {

      if (this.keyConfigEditObj && !Object.keys(this.keyConfigEditObj).length) {
        this.keyConfigEditObj = _.cloneDeep(this.keyConfigDefaultObj);
      }
      this.keyConfigEditBFRObj = _.cloneDeep(this.keyConfigEditObj);
      this.showKeyConfig = true;
    } else {
      this.showKeyConfig = false;
    }



  }

  deleteAttr(ruleItem: any, index: any): any {
    let data = this.currentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    if (data.rules[index].attrs && data.rules[index].attrs.length < 2) {
      data.rules[index].delimiter = '_';
    }

    this.currentRuleData = data;
    this.mpngRuleObj[this.ruleName] = data;

    this.mappingRuleFields.push(ruleItem);
    this.mappingRuleFields = Object.assign([], this.mappingRuleFields);

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  deleteSbscbrAttr(ruleItem: any, index: any): any {
    let data = this.sbscbrCurrentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    this.sbscbrCurrentRuleData = data;
    this.sbscbrRuleObj[this.ruleName] = data;

    this.sbscbrRuleFields.push(ruleItem);
    this.sbscbrRuleFields = Object.assign([], this.sbscbrRuleFields);

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;

    let smrIndex = this.subscriberMatchRules.indexOf(ruleItem);
    if (smrIndex > -1) {
      this.subscriberMatchRules.splice(smrIndex, 1);
    }


  }


  deleteAggregationAttr(ruleItem: any, index: any): any {
    let data = this.aggregationCurrentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    if (data.rules[index].attrs && data.rules[index].attrs.length < 2) {
      this.aggregationdelimiterSelected = '_';
    }
    this.aggregationCurrentRuleData = data;
    this.aggregationRuleObj[this.ruleName] = data;

    this.aggregationRuleFields.push(ruleItem);
    this.aggregationRuleFields = Object.assign([], this.aggregationRuleFields);

    this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;

    let smrIndex = this.aggregationMatchRules[data.name].indexOf(ruleItem);
    if (smrIndex > -1) {
      this.aggregationMatchRules[data.name].splice(smrIndex, 1);
    }


  }

  deleteRule(ruleName: any, index: any): any {
    let data = this.currentRuleData;
    let fields = [];
    if (data.rules[index].attrs) {
      for (let i = 0; i < data.rules[index].attrs.length; i++) {
        fields.push(data.rules[index].attrs[i]);
      }
    }

    this.mappingRuleFields = [...this.mappingRuleFields, ...fields];
    //this.mappingRuleFields = Object.assign([], this.mappingRuleFields);
    data.rules.splice(index, 1);

    this.currentRuleData = data;
    this.mpngRuleObj[this.ruleName] = data;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  deleteSbscbrRule(ruleName: any, index: any): any {
    let data = this.sbscbrCurrentRuleData;
    let fields = [];
    if (data.rules[index].attrs) {
      for (let i = 0; i < data.rules[index].attrs.length; i++) {
        fields.push(data.rules[index].attrs[i]);
      }
    }

    this.sbscbrRuleFields = Array.prototype.push.apply(this.sbscbrRuleFields, fields);
    this.sbscbrRuleFields = Object.assign([], this.sbscbrRuleFields);
    data.rules.splice(index, 1);

    this.sbscbrCurrentRuleData = data;
    this.sbscbrRuleObj[this.ruleName] = data;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;

  }

  deleteMapping(item: any): any {
    let selectList = this.selectList;

    selectList = selectList.filter(function (obj: any) {
      return obj.name !== item.name;
    });

    this.selectList = selectList;

    let unselectList = this.unselectList;
    unselectList.push(item);
    this.unselectList = unselectList;
    if (this.mpngRuleObj[item.key]) delete this.mpngRuleObj[item.key];
  }

  openTab(): void {
    this.showTab = true;
  }

  closeTab(): void {
    // this.showTab = false;
    // let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
    // if (el) {
    //   el.style.display = 'none';
    // }
    // this.aggregationCurrentRuleData = _.cloneDeep(this.latestAggreData);
    this.cancelAggregationRuleApply();

  }

  applyAggregationRuleModalOpen(): void {

    if (this.aggregationCurrentRuleData && this.latestAggreData && (JSON.stringify(this.latestAggreData) !== JSON.stringify(this.aggregationCurrentRuleData) || (this.latestAggreDataDeLimit && this.latestAggreDataDeLimit !== this.aggregationdelimiterSelected))) {
      // open warning model
      this.closeModal();
      this.modalRef = this.dialogService.open(this.aggregWarningModal);
    } else if (this.ruleName && this.ruleName == 'DHCP' && !_.isEqual(this.keyConfigEditBFRObj, this.keyConfigEditObj) && this.mpnPrcdnce.includes('DHCP')) {
      // open warning model
      this.closeModal();
      this.modalRef = this.dialogService.open(this.aggregWarningModal);
    } else {
      this.showTab = false;
      let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
      if (el) {
        el.style.display = 'none';
      }
    }


  }

  confirmAggregationRuleApply(): void {
    this.showTab = false;
    let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
    if (el) {
      el.style.display = 'none';
    }
    this.closeModal();
  }

  cancelAggregationRuleApply() {
    //cancel btn near apply button

    let key = '';
    if (this.aggregationCurrentRuleData) {
      key = this.aggregationCurrentRuleData.key ? this.aggregationCurrentRuleData.key : '';
      if (key && this.latestAggreData) {
        this.aggregationCurrentRuleData.rules[0].attrs = this.latestAggreData.rules[0].attrs;
        this.aggregationMatchRules[key] = this.latestAggreData.rules[0].attrs;
        this.aggregationMatchRules[`${key}_DELIMITER`] = this.latestAggreDataDeLimit;
      }

      this.closeModal();
      setTimeout(() => {
        this.aggregationCurrentRuleData = undefined;
      }, 0);
    }


    if (this.ruleName && this.ruleName == 'DHCP') {
      this.keyConfigEditObj = _.cloneDeep(this.keyConfigEditBFRObj);
    }

    this.showTab = false;
    let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
    if (el) {
      el.style.display = 'none';
    }
  }

  addRule(name: any, item: any): void {
    let data = this.mpngRuleObj[name];

    data.rules.push({
      attrs: [item],
      delimiter: ''
    });

    this.mpngRuleObj[name] = data;

    this.currentRuleData = this.mpngRuleObj[name];

    let fields = this.mappingRuleFields;
    let fI = fields.indexOf(item);
    fields.splice(fI, 1);
    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;
  }

  addSbscbrRule(name: any, item: any): void {
    let data = this.sbscbrRuleObj[name];

    data.rules.push({
      attrs: [item],
      delimiter: ''
    });

    this.sbscbrRuleObj[name] = data;

    this.sbscbrCurrentRuleData = this.sbscbrRuleObj[name];

    let fields = this.sbscbrRuleFields;
    let fI = fields.indexOf(item);
    fields.splice(fI, 1);
    this.sbscbrRuleFields = fields;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;
  }

  dropMappingSource(event: any) {
    moveItemInArray(this.selectList, event.previousIndex, event.currentIndex);
  }

  dropCurrentRuleData(event: any) {
    moveItemInArray(this.currentRuleData.rules, event.previousIndex, event.currentIndex);
  }

  dropFiledToCurrentRuleData(event: any, index: number) {
    moveItemInArray(this.currentRuleData.rules[index].attrs, event.previousIndex, event.currentIndex);
  }

  dropFieledToCurrentAggreRuleData(event: any, index: number) {
    moveItemInArray(this.aggregationCurrentRuleData.rules[index].attrs, event.previousIndex, event.currentIndex);
  }

  changeDelimiter(event: any, index: number) {
    let data = this.currentRuleData;

    // data.rules[index].delimiter = event;
  }


  checkFieldsLength(name: string, index?: any, field?: any) {

    let data = this.mpngRuleObj[name];

    if (data.rules[index].attrs.length > 1) {
      return true;
    }

    return false;
  }

  checkSbscbrFieldsLength(name: string, index?: any, field?: any) {

    let data = this.sbscbrRuleObj[name];

    if (data.rules[index].attrs.length > 1) {
      return true;
    }

    return false;
  }

  checkAggreFieldsLength(name: string, index?: any, field?: any) {

    let data = this.aggregationRuleObj[name];

    if (data && data?.rules[index]?.attrs.length > 1) {
      return true;
    }

    return false;
  }

  new: boolean = true;
  getData(): any {
    let slctPrcdnc: any[] = [];
    let selectList: any[] = [];
    let unselectList: any[] = [];
    this.resetKeyConfigurations();
    this.getListSubs = this.service.getList(this.ORG_ID).subscribe((json: any) => {
      this.new = false;
      this.mpnPrcdnce = json.mappingPrecedence ? json.mappingPrecedence.split(',') : [];
      if (json && Object.keys(json)) {
        if (this.module !== 'systemAdministration') {
          let entitlement = window.localStorage.getItem('calix.entitlements') ? JSON.parse(window.localStorage.getItem('calix.entitlements') ?? '') : [];
          if (entitlement && !entitlement[102]) {
            this.mpnPrcdnce = this.mpnPrcdnce.filter((ele: any) => !["AXOS", "EXA"].includes(ele)); /* CCL-49687 */ /* CCL-50408 */
          }
        }
        this.mpnPrcdnce = this.mpnPrcdnce.filter((el: any) => el && el.toUpperCase() != 'CMS'); // to fix CCL-25481
        this.mpnPrcdnce = this.mpnPrcdnce.filter((el: any) => el && el.toUpperCase() != 'FA'); // to fix CCL-32885
        this.mpnPrcdnce = this.mpnPrcdnce.filter((el: any) => el && (el.toUpperCase() != 'AXOS' || el.toUpperCase() != 'EXA')); // CCL-41677
        let isDHCPAvail = this.mpnPrcdnce.filter((el: any) => el && el.toUpperCase() == 'DHCP').length;
        if (isDHCPAvail) {
          this.getKeyConfigurations();
        } else {
          this.resetKeyConfigurations();
        }
        if (json.nameFormat) {
          let data = JSON.parse(json.nameFormat);
          if (this.module !== 'systemAdministration') {
            let entitlement = window.localStorage.getItem('calix.entitlements') ? JSON.parse(window.localStorage.getItem('calix.entitlements') ?? '') : [];
            if (entitlement && !entitlement[102]) {
              data = data.filter((ele: any) => !["AXOS", "EXA"].includes(ele.name)); /* CCL-49687 */ /* CCL-50408 */
            }
          }
          for (let i = 0; i < data.length; i++) {
            // to fix CCL-25481
            if (data[i].name && data[i].name == 'CMS') continue;

            // to fix CCL-32885
            if (data[i].name && data[i].name == 'FA') continue;

            // to fix CCL-41677
            // if (!this.isDev && data[i].name && (data[i].name == 'AXOS' || data[i].name == 'EXA')) continue;

            data[i].data = [];
            for (let j = 0; j < data[i].rules.length; j++) {
              let idata = [];
              for (let k = 0; k < data[i].rules[j].attrs.length; k++) {
                //idata.push(this.language[this.title[data[i].rules[j].attrs[k]]] || this.title[data[i].rules[j].attrs[k]]);
                //todo
                idata.push(this.title[data[i].rules[j].attrs[k]]);
              }
              data[i].data.push(idata.join(data[i].rules[j].delimiter));
            }

            data[i].key = data[i].name;

            this.mpngRuleObj[data[i].name] = data[i];

            selectList.push(data[i]);

            slctPrcdnc.push(data[i].name);
          }

          let format = json.nameFormat ? JSON.parse(json.nameFormat) : [];
          let mpnPrcdnce = this.mpnPrcdnce;
          if (mpnPrcdnce.length && !format.length) {
            for (let i = 0; i < mpnPrcdnce.length; i++) {
              selectList.push({
                name: mpnPrcdnce[i],
                rules: this.emptyRule,
                key: mpnPrcdnce[i],
                data: []
              });
              slctPrcdnc.push(mpnPrcdnce[i]);
            }
          } else if (mpnPrcdnce.length && format.length && mpnPrcdnce.length != format.length) {
            let srcs = mpnPrcdnce;
            for (let x = 0; x < mpnPrcdnce.length; x++) {
              if (format.filter((el: any) => el.name == mpnPrcdnce[x]).length) {
                srcs = srcs.filter((src: any) => src !== mpnPrcdnce[x]);
              }
            }

            if (srcs.length) {
              for (let y = 0; y < srcs.length; y++) {
                selectList.push({
                  name: srcs[y],
                  rules: this.emptyRule,
                  key: srcs[y],
                  data: []
                });
                slctPrcdnc.push(srcs[y]);
              }
            }
          } else if (!mpnPrcdnce.length && !format.length) {
            this.resetMappingRuleObj();
          }

        } else {
          let mpnPrcdnce = this.mpnPrcdnce;
          if (mpnPrcdnce.length) {
            for (let i = 0; i < mpnPrcdnce.length; i++) {
              selectList.push({
                name: mpnPrcdnce[i],
                rules: this.emptyRule,
                key: mpnPrcdnce[i],
                data: []
              });
              slctPrcdnc.push(mpnPrcdnce[i]);
            }
          } else {
            this.resetMappingRuleObj();

          }
        }
        if (selectList && selectList.length) {
          selectList = this.makeOrderByMapPrecedence(selectList, this.mpnPrcdnce);
        }
        this.selectList = selectList;

        this.selectList = [...this.selectList];

        if (selectList.length) {
          this.new = false;
        }
debugger;
        for (let i = 0; i < this.allPrcdns.length; i++) {
          if (slctPrcdnc.indexOf(this.allPrcdns[i]) === -1) {
            unselectList.push({
              id: i + 1,
              name: this.allPrcdns[i],
              data: [
                'Name'
              ],
              key: this.allPrcdns[i]
            });
          }
        }

        this.unselectList = unselectList;
        /** subscriber match rule code */

        let sdata = [];

        if (json.subscriberMatchRule) {
          sdata = json.subscriberMatchRule.split(',');
        } else {
          sdata = [];
        }

        this.subscriberMatchRules = sdata;

        if (!selectList.length) {
          for (let i = 0; i < this.allPrcdns.length; i++) {
            unselectList.push({
              id: i + 1,
              name: this.allPrcdns[i],
              data: [
                'Name'
              ],
              key: this.allPrcdns[i]
            });
          }

          this.unselectList = unselectList;
          // console.log('this.unselectList',JSON.stringify(this.unselectList));
          this.unselectList = this.unselectList.filter((tag: any, index: any, array: any) => array.findIndex((t: any) => t.id == tag.id) == index);

        }

        /** aggregation match rule code */

        if (json.aggregationRules) {
          let data = JSON.parse(json.aggregationRules);

          data = data.filter((el: any) => el.name != 'DHCP'); // to fix CCL-34094
          for (let i = 0; i < data.length; i++) {

            data[i].data = [];
            let idata = [];
            for (let k = 0; k < data[i].attrs.length; k++) {
              idata.push(data[i].attrs[k]);
            }

            this.aggregationMatchRules[data[i].name] = idata;
            this.aggregationMatchRules[`${data[i].name}_DELIMITER`] = data[i].delimiter ? data[i].delimiter : '';

          }
          /* CCL-43855 */
          if (!data.length) {
            Object.keys(this.aggregationRuleObjDefault).forEach(key => {
              this.aggregationMatchRules[key] = []
            });
          }
          Object.keys(this.aggregationRuleObjDefault).forEach(key => {
            this.aggregationRuleObj[key] = {
              data: [],
              key: key,
              name: key,
              rules: [
                { attrs: this.aggregationMatchRules[key], delimiter: '' }
              ]
            }
          })
          /* CCL-43855 */
        }
      } else {
        for (let i = 0; i < this.allPrcdns.length; i++) {
          unselectList.push({
            id: i + 1,
            name: this.allPrcdns[i],
            data: [
              'Name'
            ],
            key: this.allPrcdns[i]
          });
        }

        this.unselectList = unselectList;
        this.new = true;

      }



      //this.createData();
      setTimeout(() => {
        this.loading = false;
      }, 1000);

debugger;
    }, (err: HttpErrorResponse) => {
      if (err.status == 404) {
        this.new = true;
        this.loading = false;
      } else {
        this.pageErrorHandle(err);
      }


    });

  }

  save(): any {

    let mpngPrcdnc = [];
    let nameFormat: any[] = [];
    let sbscrbrMR = [];
    let noRuleMSCounts = 0;
    let noRuleMSources: any = [];

    for (let i = 0; i < this.selectList.length; i++) {
      mpngPrcdnc.push(this.selectList[i].name);
      let nData = _.cloneDeep(this.mpngRuleObj[this.selectList[i].name]);
      if (nData) {
        delete nData.data;
        delete nData.key;
        if (nData && nData.rules.length) {
          nData.rules = nData.rules.filter((rule: any) => (rule.attrs && rule.attrs.length));
          if (nData.rules.length) nameFormat.push(nData);
        }
      }

      let sData = this.sbscbrRuleObj[this.selectList[i].name];
      if (sData) {
        delete sData.data;
        delete sData.key;
        sbscrbrMR.push(sData);
      }

    }

    // nameFormat.map((el) => {
    //   if (!el.rules?.length || (el.rules?.length && !el.rules?.attr?.length)) {
    //     if (el.name == 'RADIUS') {
    //       el.rules[0]['attr'].push("radiusUserName");
    //     }
    //   }
    // });

    mpngPrcdnc.forEach((el) => {
      const matchMS = nameFormat.filter(nf => (nf.name && el && nf.name === el));
      if (!matchMS.length) {
        // if (el === 'RADIUS') {
        //   nameFormat.push(this.setDefaultRule(el, "radiusUserName"));
        // } else if (el === 'CC') {
        //   nameFormat.push(this.setDefaultRule(el, "serialNumber"));
        // } else if (el === 'DHCP') {
        //   nameFormat.push(this.setDefaultRule(el, "macAddress"));
        // } else if (el === 'CUSTOM') {
        //   //nameFormat.push(this.setDefaultRule(el, "macAddress"));
        // } else {
        //   noRuleMSources.push(el);
        //   noRuleMSCounts++;
        // }
        noRuleMSources.push(el);
        noRuleMSCounts++;

      }
    });

    if (noRuleMSCounts && !(noRuleMSCounts === 1 && noRuleMSources[0] === 'STATIC')) {
      this.infoBody = "Please select at least one Mapping Rule for selected Mapping Sources";
      this.infoTitle = 'Invalid Request';
      this.openInfoModal();
      return;
    }

    let aggregationKeys = Object.keys(this.aggregationRuleObj);
    let aggregationRules = [];
    if (aggregationKeys) {
      for (let i = 0; i < aggregationKeys.length; i++) {
        let data = {
          name: aggregationKeys[i],
          attrs: this.aggregationRuleObj[aggregationKeys[i]].rules[0].attrs,
          delimiter: this.aggregationMatchRules[`${aggregationKeys[i]}_DELIMITER`] ? this.aggregationMatchRules[`${aggregationKeys[i]}_DELIMITER`] : ''
        }
        if (data.attrs && data.attrs.length) aggregationRules.push(data);

      }
    }

    let data = {
      mappingPrecedence: mpngPrcdnc.join(','),
      nameFormat: JSON.stringify(nameFormat),
      //orgId: this.sso.getOrgId(),
      orgId: this.ORG_ID,
      //realtimeLateflowDelay: 60,
      subscriberMatchRule: this.subscriberMatchRules ? this.subscriberMatchRules.join(',') : '',
      aggregationRules: JSON.stringify(aggregationRules),
      tenantId: 0
    };

    //return;
    this.loading = true;
    if (this.new) {
      let newDt = data;
      if (!nameFormat.length) {
        //todo
        newDt.nameFormat;
        // delete newDt.nameFormat;
      }
      if (newDt.subscriberMatchRule == '') {
        delete newDt.subscriberMatchRule;
      }

      // if (data.mappingPrecedence == '') {
      //   this.cancelWithGet();
      //   return;
      // }

      this.saveSubs = this.service.save(newDt, this.ORG_ID).subscribe((json: any) => {
        if (data.mappingPrecedence.indexOf('DHCP') !== -1) {
          let config = (this.keyConfigEditObj && Object.keys(this.keyConfigEditObj).length) ? this.keyConfigEditObj : this.keyConfigDefaultObj;
          let params = {
            macAddress: config.macAddress ? config.macAddress : false,
            remoteId: config.remoteId ? config.remoteId : false,
            circuitId: config.circuitId ? config.circuitId : false,
            subscriberId: config.subscriberId ? config.subscriberId : false,
            clientHostName: config.clientHostName ? config.clientHostName : false
          }
          this.addKeyConfigSusbs = this.service.addDHCPKeyConfiguration(this.ORG_ID, params).subscribe((resp: any) => {
            this.closeTab();
            this.cancel();
            this.getData();
          }, (err: HttpErrorResponse) => {
            if (err.error && err.error.error_code) {
              this.pageErrorHandle(err);
            }
          });
        } else {
          this.closeTab();
          this.cancel();
          this.getData();
        }

      }, (err: HttpErrorResponse) => {
        if (err.status == 409 && err.error && err.error.error_code && err.error.error_code.indexOf('already exists') > -1) {
          this.updatePatchMappingSource(data);
        } else if (err.error && err.error.error_code) {
          this.pageErrorHandle(err);
        }
      });
    } else {
      this.updatePatchMappingSource(data);

    }
  }

  updatePatchMappingSource(data: any) {

    const patches: Observable<any>[] = [];
    patches.push(this.service.patchUpdate({ mappingPrecedence: data.mappingPrecedence }, this.ORG_ID));
    patches.push(this.service.patchUpdate({ nameFormat: data.nameFormat }, this.ORG_ID));

    if (data.subscriberMatchRule != '') {
      patches.push(this.service.patchUpdate({ subscriberMatchRule: data.subscriberMatchRule }, this.ORG_ID));
    }

    if (data.aggregationRules) {
      patches.push(this.service.patchUpdate({ aggregationRules: data.aggregationRules }, this.ORG_ID));
    }

    if (data.mappingPrecedence.indexOf('DHCP') !== -1) {
      let config = (this.keyConfigEditObj && Object.keys(this.keyConfigEditObj).length) ? this.keyConfigEditObj : this.keyConfigDefaultObj;
      let params: any = {
        macAddress: config.macAddress ? config.macAddress : false,
        remoteId: config.remoteId ? config.remoteId : false,
        circuitId: config.circuitId ? config.circuitId : false,
        subscriberId: config.subscriberId ? config.subscriberId : false,
        clientHostName: config.clientHostName ? config.clientHostName : false
      }
      if (this.keyConfigs && Object.keys(this.keyConfigs).length) {
        //Both DHCP & KeyConfig already available
        params['_id'] = this.keyConfigs._id;
        patches.push(this.service.updateDHCPKeyConfiguration(this.ORG_ID, params));
      } else {
        //add KeyConfig
        patches.push(this.service.addDHCPKeyConfiguration(this.ORG_ID, params));
      }

    } else if (data.mappingPrecedence.indexOf('DHCP') === -1 && this.keyConfigs && Object.keys(this.keyConfigs).length) {
      //No DHCP & KeyConfig already available - Delete
      patches.push(this.service.deleteDHCPKeyConfiguration(this.ORG_ID));
    }


    forkJoin(patches).subscribe(
      resultArray => {
        this.closeTab();
        this.cancel();
        this.getData();
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.pageErrorHandle(err);
      }
    );

  }

  getTitle(key: any): any {
    return this.title[key] ? this.title[key] : key;
  }

  public trackItem(index: number, item: any) {
    return item.name;
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  pageErrorHandle(err: HttpErrorResponse) {
    let errorInfo = '';
    if (err.status == 400) {
      this.infoBody = this.commonOrgService.pageInvalidRqstErrorHandle(err);
      this.infoTitle = 'Error';
      this.openInfoModal();
      this.loading = false;
    } else {
      if (err.status == 401) {
        errorInfo = 'Access Denied';
      } else {
        errorInfo = this.commonOrgService.pageErrorHandle(err);
      }
      this.commonOrgService.openErrorAlert(errorInfo);
      this.commonOrgService.pageScrollTop();
      this.loading = false;
    }

  }

  openInfoModal() {
    this.closeModal();
    this.modalRef = this.dialogService.open(this.infoModal);
  }

  aggregationRuleNames(name: any) {
    let rules: any[] = [];
    this.aggregationMatchRules[name].forEach((e: string | number) => {
      if (this.title[e]) {
        rules.push(this.title[e]);
      } else {
        rules.push(e);
      }
    });;
    let delimiter = this.aggregationMatchRules[`${name}_DELIMITER`] ? this.aggregationMatchRules[`${name}_DELIMITER`] : '_';
    let names = '';
    names = rules.join(delimiter);
    return names;
  }

  makeOrderByMapPrecedence(list: any[], orderBy: string | any[]) {
    const sorted = list.sort((a, b) => {
      if (orderBy.indexOf(a.name) < orderBy.indexOf(b.name)) {
        return -1;
      }
      if (orderBy.indexOf(a.name) > orderBy.indexOf(b.name)) {
        return 1;
      }
      return 0;
    })
    return sorted;
  }


  changeKeyConfig() {

  }

  resetKeyConfigurations() {
    this.keyConfigDefaultObj = {
      macAddress: false,
      remoteId: false,
      circuitId: false,
      subscriberId: false,
      clientHostName: false
    }
    this.keyConfigEditObj = {};
    this.keyConfigs = {};
  }

  getKeyConfigurations() {
    this.keyConfigLoading = true;
    this.keyConfigSubs = this.service.getDHCPKeyConfiguration(this.ORG_ID).subscribe((res: any) => {
      this.keyConfigs = res ? res : {};
      if (res && Object.keys(res).length) {
        this.keyConfigDefaultObj = {
          macAddress: res.macAddress ? res.macAddress : false,
          remoteId: res.remoteId ? res.remoteId : false,
          circuitId: res.circuitId ? res.circuitId : false,
          subscriberId: res.subscriberId ? res.subscriberId : false,
          clientHostName: res.clientHostName ? res.clientHostName : false
        }
      } else {
        this.keyConfigDefaultObj = {
          macAddress: false,
          remoteId: false,
          circuitId: false,
          subscriberId: false,
          clientHostName: false
        }
      }

    },
      (err: HttpErrorResponse) => {

      })
  }

  checkKeyConfigStatus(returnData?: any) {
    if (returnData) {
      let uniqueKey = [];
      if (this.keyConfigDefaultObj.macAddress) {
        uniqueKey.push('MAC Address');
      }

      if (this.keyConfigDefaultObj.remoteId) {
        uniqueKey.push('DHCP Remote Id');
      }

      if (this.keyConfigDefaultObj.circuitId) {
        uniqueKey.push('DHCP Circuit Id');
      }

      if (this.keyConfigDefaultObj.subscriberId) {
        uniqueKey.push('DHCP Subscriber Id');
      }

      if (this.keyConfigDefaultObj.clientHostName) {
        uniqueKey.push('DHCP Client Hostname');
      }
      return uniqueKey.join(', ');

    } else if (this.keyConfigDefaultObj.macAddress || this.keyConfigDefaultObj.remoteId || this.keyConfigDefaultObj.circuitId || this.keyConfigDefaultObj.subscriberId || this.keyConfigDefaultObj.clientHostName) {
      return true;
    }
    return false;
  }

  resetMappingRuleObj() {
    let keys = Object.keys(this.mpngRuleObj);
    if (keys) {
      keys.forEach(key => {
        this.mpngRuleObj[key] = {
          data: [],
          key: key,
          name: key,
          rules: [
            { attrs: [], delimiter: '' }
          ]
        };
      });
    }
  }

  setDefaultRule(mpKey: any, attrName: any) {

    return {
      name: mpKey,
      rules: [
        {
          attrs: [attrName],
          delimiter: ""
        }
      ]
    };

  }
}
