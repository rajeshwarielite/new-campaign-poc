import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationsChartComponent } from './applications-chart.component';

describe('ApplicationsChartComponent', () => {
  let component: ApplicationsChartComponent;
  let fixture: ComponentFixture<ApplicationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
