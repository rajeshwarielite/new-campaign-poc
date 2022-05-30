import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCampaignComponent } from './result-campaign.component';

describe('ResultCampaignComponent', () => {
  let component: ResultCampaignComponent;
  let fixture: ComponentFixture<ResultCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
