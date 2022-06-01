import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCampaignComponent } from './mobile-campaign.component';

describe('MobileCampaignComponent', () => {
  let component: MobileCampaignComponent;
  let fixture: ComponentFixture<MobileCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
