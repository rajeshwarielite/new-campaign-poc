import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HighchartsChartModule } from 'highcharts-angular';
import { TranslateService } from 'src/app-services/translate.service';
import { WebsocketService } from 'src/app/cco/shared/services/websocket.service';
import { DateUtilsService } from 'src/app/shared-utils/date-utils.service';
import { SsoAuthService } from 'src/app/shared/services/sso-auth.service';

import { MultipleChartComponent } from './multiple-chart.component';

describe('MultipleChartComponent', () => {
  let component: MultipleChartComponent;
  let fixture: ComponentFixture<MultipleChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultipleChartComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
,
        HighchartsChartModule
      ],
      providers: [SsoAuthService, WebsocketService, TranslateService, DateUtilsService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
