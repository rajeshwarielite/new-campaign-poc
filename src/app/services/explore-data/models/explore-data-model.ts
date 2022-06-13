export interface ExploreDataModel {

    createdOn: string,
    location: string,
    orgId: string,
    period: string,
    region: string,
    timezone: string,
    updatedOn: string,
    userId: string,
    userName: null,
    _id: string,
}
export interface SubscriberExploreDataModel {
    activesubscribers: number
}
export interface StreamingGamingWfhUsersExploreDataModel {
    streamingUsers: number; gamingUsers: number; wfhUsers: number;
}

export interface AreaFilterModel {
    region: string;
    location: string;
    timeFrame: string;
}
export interface DataUsageTrendsModel {
    categories: string[];
    series: [{ name: string, data: number[] }];
}
export interface HeatMapModel {
    column: [string];
    data: [number[]];
}

