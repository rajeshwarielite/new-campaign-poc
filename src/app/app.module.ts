import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefineCampaignComponent } from './components/campaign/define-campaign/define-campaign.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiInterceptor } from './services/api.interceptor';
import { ChannelCampaignComponent } from './components/campaign/channel-campaign/channel-campaign.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CampaignContainerComponent } from './components/campaign-container/campaign-container.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DeployCampaignComponent } from './components/campaign/deploy-campaign/deploy-campaign.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ResultCampaignComponent } from './components/campaign/result-campaign/result-campaign.component';
import { MobileCampaignComponent } from './components/campaign/mobile-campaign/mobile-campaign.component';
import { ChartModule } from 'angular-highcharts';
import { ChartCampaignComponent } from './components/campaign/result-campaign/chart-campaign/chart-campaign.component';
import { CalendarModule } from 'primeng/calendar';
import { ExploreBasicComponent } from './components/explore-data/explore-basic/explore-basic.component';
import { SubscriberChartComponent } from './components/explore-data/explore-basic/explore-chart/subscriber-chart/subscriber-chart.component';
import { ServicesChartComponent } from './components/explore-data/explore-basic/explore-chart/services-chart/services-chart.component';
import { ApplicationsChartComponent } from './components/explore-data/explore-basic/explore-chart/applications-chart/applications-chart.component';
import { RetentionChartComponent } from './components/explore-data/explore-basic/explore-chart/retention-chart/retention-chart.component';
import { AcquisitionInsightsChartComponent } from './components/explore-data/explore-basic/explore-chart/acquisition-insights-chart/acquisition-insights-chart.component';
import { SystemChartComponent } from './components/explore-data/explore-basic/explore-chart/system-chart/system-chart.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { EntitlementsComponent } from './components/entitlements/entitlements.component';
import { OrganizationListComponent } from './components/organization-list/organization-list.component';
import { DataTablesModule } from 'angular-datatables';
import { Route, RouterModule } from '@angular/router';
import { MappingSourceComponent } from './components/mapping-source/mapping-source.component';

const routes: Route[] = [
  {
    path: '',
    component: OrganizationListComponent
  },
  {
    path: 'organizations',
    component: OrganizationListComponent
  },
  {
    path: 'organizations/add',
    component: OrganizationComponent,
    pathMatch: 'full'
  },
  {
    path: 'organizations/:orgId',
    component: EntitlementsComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DefineCampaignComponent,
    ChannelCampaignComponent,
    CampaignContainerComponent,
    DeployCampaignComponent,
    ResultCampaignComponent,
    MobileCampaignComponent,
    ChartCampaignComponent,
    ExploreBasicComponent,
    SubscriberChartComponent,
    ServicesChartComponent,
    ApplicationsChartComponent,
    RetentionChartComponent,
    AcquisitionInsightsChartComponent,
    SystemChartComponent,
    HomePageComponent,
    OrganizationComponent,
    EntitlementsComponent,
    OrganizationListComponent,
    MappingSourceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgbDropdownModule,
    NgSelectModule,
    ModalModule.forRoot(),
    ChartModule,
    CalendarModule,
    DataTablesModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
