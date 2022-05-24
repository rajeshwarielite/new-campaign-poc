import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployCampaignComponent } from './deploy-campaign.component';

describe('DeployCampaignComponent', () => {
  let component: DeployCampaignComponent;
  let fixture: ComponentFixture<DeployCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeployCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
