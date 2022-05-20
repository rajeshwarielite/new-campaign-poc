import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineCampaignComponent } from './define-campaign.component';

describe('DefineCampaignComponent', () => {
  let component: DefineCampaignComponent;
  let fixture: ComponentFixture<DefineCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefineCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
