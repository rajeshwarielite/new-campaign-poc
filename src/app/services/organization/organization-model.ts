export interface OrganizationModel {
    bypassCAP: boolean | null;
    capExpires: string | null;
    capOverride: string | null;
    capStatus: string | null;
    cloudGeography: string | null;
    country: string | null;
    createTime?: string | null;
    description: string | null;
    externalOrgRef: string | null;
    id?: string | null;
    inheritList: string | null;
    name: string | null;
    oracleId: string | null;
    parentId: string | null;
    parentOrgName: string | null;
    salesforceId: string | null;
    territory: string | null;
    updateTime?: string | null;
    endDate?: string | null;
    startDate?: string | null;
}
export interface AllEntitlementsModel {
    appType: string;
    name: string;
    status: string;
    endDate?: string | null;
    startDate?: string | null;
}
export interface EntitlementByIDModel {
    appType: string;
    contractNumber: string | null;
    createTime: string | null;
    customer: string | null;
    disabledFlag: boolean;
    endDate: string | null;
    entitlement: number;
    id: string | null;
    name: string;
    organizationId: string;
    overrideEndDate: string | null;
    partCategory: string | null;
    partDescription: string | null;
    partNumber: string | null;
    productFamily: string | null;
    qty: string | null;
    serviceEdition: string | null;
    serviceName: string | null;
    startDate: string | null;
    status: string;
    updateTime: string | null;
}
export interface UsersSizeModel {
    email: string;
    firstName: string;
    idpType: string;
    landingPage: string;
    language: string;
    lastName: string;
    orgId: string;
    username: string;
    _id: string;
    enable:boolean;
}
export interface RolesModel {
    apptype: string;
    description: string;
    name: string;
    orgDefault: boolean;
    orgId: string;
    permissions: permissionsModel[];
    users: UsersModel[];
    _id: string;
}
export interface permissionsModel {
    action: string;
    permName: string;
    scopeDisplayName: string;
}
export interface UsersModel {
    firstName: string;
    lastName: string;
    userId: string;
    username: string;
}