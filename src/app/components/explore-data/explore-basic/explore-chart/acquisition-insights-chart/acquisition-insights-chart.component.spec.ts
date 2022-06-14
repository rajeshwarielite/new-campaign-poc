import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcquisitionInsightsChartComponent } from './acquisition-insights-chart.component';

describe('AcquisitionInsightsChartComponent', () => {
  let component: AcquisitionInsightsChartComponent;
  let fixture: ComponentFixture<AcquisitionInsightsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcquisitionInsightsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcquisitionInsightsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
