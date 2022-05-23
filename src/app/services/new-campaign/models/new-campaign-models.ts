export interface SegmentModel {
    segmentId: string,
    segmentName: string,
    segmentType: string,
    subscriberCount: number,
    createdDateSec: Date,
    campaignsInProgress: number,
    campaignDetail: any
}

export interface ZipcodeModel {
    item_id: number,
    item_text: string
}
export interface LocationModel {
    Location: string
}

export interface RegionModel {
    Region: string
}

export interface ServiceModel {
    Service: string
}
export interface PropensityModel {
    Propensity: string
}

export interface SaveCampaignModel {
    application: string,
    budget: number,
    campaignId: string,
    channels: string,
    conversionResult: string,
    conversionTarget: number,
    created: Date,
    csvDownloadOnly: boolean,
    endDate: Date,
    location: string,
    name: string,
    notificationSent: number,
    orgId: number,
    propensity: string,
    region: string,
    segmentCategory: string,
    segmentId: string,
    segmentMobileAppSize: number,
    segmentName: string,
    segmentSize: number,
    segmentType: string,
    subscriberCount: number,
    service: string,
    startDate: Date,
    status: string,
    system: string,
    zipPlusFour?: string[],
    zipcode?: string[],
}

export interface ChannelCampaignModel {
    available: boolean,
    completedCampaigns: number,
    costPerSubscriber: number,
    description: string,
    inprogressCampaigns: number,
    marketingChannel: string,
    marketingChannelId: string,
    scheduleCampaigns: number
}
export interface SaveChannelRequestModel {
    campaignId: string,
    includeInChannel: string,
    marketingChannelId: string,
    marketingChannelName: string,
    notificationNam: string,
    orgId: string,
    scheduleType: string,
}
export interface SaveChannelResponseModel {
    applicableSubscriber: number
    campaignId: string,
    content: string,
    errorReason: string,
    estimatedCost: number,
    eventDriven: string,
    eventThreshold: string,
    id: string,
    includeInChannel: string,
    link: string,
    marketingChannelId: string,
    marketingChannelName: string,
    notificationName: string,
    notificationTime: string,
    notificationTimeZone: string,
    orgId: number,
    scheduleType: string,
    scheduledDateTime: string,
    status: string,
}