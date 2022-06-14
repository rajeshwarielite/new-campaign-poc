import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemChartComponent } from './system-chart.component';

describe('SystemChartComponent', () => {
  let component: SystemChartComponent;
  let fixture: ComponentFixture<SystemChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
