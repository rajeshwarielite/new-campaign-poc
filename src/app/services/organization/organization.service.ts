import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { AllEntitlementsModel, EntitlementByIDModel, OrganizationModel, RolesModel, UsersSizeModel } from './organization-model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = " https://stage.api.calix.ai/v1/";


  constructor(private httpClient: HttpClient) { }

  saveOrganization(organizationModel: OrganizationModel): Observable<OrganizationModel> {
    return this.httpClient.post<OrganizationModel>(this.apiUrl + 'org/admin/organizations', organizationModel);
  }
  getAllEntitlements(): Observable<AllEntitlementsModel[]> {
    return this.httpClient.get<AllEntitlementsModel[]>(this.apiUrl + 'org/admin/entitlements/cloud/all');
  }
  entitlementByID(orgId: string): Observable<EntitlementByIDModel[]> {
    return this.httpClient.get<EntitlementByIDModel[]>(this.apiUrl + 'org/admin/entitlements/' + orgId);
  }
  saveEntitlement(saveEntitlementData: EntitlementByIDModel): Promise<EntitlementByIDModel> {
    if (saveEntitlementData.id) {
      return lastValueFrom(this.httpClient.put<EntitlementByIDModel>(this.apiUrl + 'org/admin/entitlements/' + saveEntitlementData.id, saveEntitlementData));
    } else {
      return lastValueFrom(this.httpClient.post<EntitlementByIDModel>(this.apiUrl + 'org/admin/entitlements/', saveEntitlementData));
    }
  }
  getAllOrganizations(): Observable<OrganizationModel[]> {
    return this.httpClient.get<OrganizationModel[]>(this.apiUrl + 'org/admin/organizations');
  }
  getUsersSize(orgId: string, count: number): Observable<UsersSizeModel[]> {
    return this.httpClient.get<UsersSizeModel[]>(this.apiUrl + 'admin/org/' + orgId + '/users?size=' + count);
  }
  getUsersCount(orgId: string): Observable<number> {
    return this.httpClient.get<number>(this.apiUrl + 'admin/org/' + orgId + '/users/_count');
  }
  getRoles(orgId: string): Observable<RolesModel[]> {
    return this.httpClient.get<RolesModel[]>(this.apiUrl + 'admin/org/' + orgId + '/roles');
  }
  getRolesByID(id: string): Observable<RolesModel> {
    return this.httpClient.get<RolesModel>(this.apiUrl + '/admin/role/' + id);
  }
  saveUser(users: string[], id: string): Observable<any> {
    return this.httpClient.post(this.apiUrl + 'admin/role/' + id + '/users', users);
  }
}
