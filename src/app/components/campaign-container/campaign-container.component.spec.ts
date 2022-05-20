import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignContainerComponent } from './campaign-container.component';

describe('CampaignContainerComponent', () => {
  let component: CampaignContainerComponent;
  let fixture: ComponentFixture<CampaignContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
