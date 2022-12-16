export interface TrafficLocation {
    address: string;
    geo: string;
    name: string;
    orgId: string;
    region: string;
    subnetsV4: string;
    subnetsV6: string;
    tenantId: number;
    _id: string;
}

export interface TrafficApplication {
    addressesV4: string;
    addressesV6: string;
    engineId: string;
    extAppEnum: string;
    extProtocolId: string;
    name: string;
    orgId: string;
    ports: string;
    protocol: string;
    rangePorts: string;
    tenantId: number;
    _id: string;
}