import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EndpointMappingSourceService {

  orgId: any;
  baseUrl = 'https://stage.api.calix.ai/v1/fa/';

  constructor(
    private http: HttpClient,
  ) {
  }

  getList(orgId: string): any {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.get(url);
  }

  save(params: any, orgId: string): any {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.post(url, params);
  }

  update(params: any, orgId: string): any {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.put(url, params);
  }

  delete(orgId: string): any {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.delete(url);
  }

  patchUpdate(params: any, orgId: string): any {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.patch(url, params);
  }

  createOrg(orgId: string, params: any) {
    let url = `${this.baseUrl}config/organization?org-id=${orgId}`;
    return this.http.post(url, params);
  }

  getDHCPKeyConfiguration(orgId: string) {
    let url = `${this.baseUrl}config/dhcpkey?org-id=${orgId}`;
    return this.http.get(url);
  }

  addDHCPKeyConfiguration(orgId: string, params: any) {
    let url = `${this.baseUrl}config/dhcpkey?org-id=${orgId}`;
    return this.http.post(url, params);
  }

  updateDHCPKeyConfiguration(orgId: string, params: any) {
    let url = `${this.baseUrl}config/dhcpkey?org-id=${orgId}`;
    return this.http.put(url, params);
  }

  deleteDHCPKeyConfiguration(orgId: string) {
    let url = `${this.baseUrl}config/dhcpkey?org-id=${orgId}`;
    return this.http.delete(url);
  }
}
