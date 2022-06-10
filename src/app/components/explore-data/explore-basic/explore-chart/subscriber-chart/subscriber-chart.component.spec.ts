import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberChartComponent } from './subscriber-chart.component';

describe('SubscriberChartComponent', () => {
  let component: SubscriberChartComponent;
  let fixture: ComponentFixture<SubscriberChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriberChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
