import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCampaignComponent } from './chart-campaign.component';

describe('ChartCampaignComponent', () => {
  let component: ChartCampaignComponent;
  let fixture: ComponentFixture<ChartCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
