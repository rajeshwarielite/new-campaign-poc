import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorebasicComponent } from './explorebasic.component';

describe('ExplorebasicComponent', () => {
  let component: ExplorebasicComponent;
  let fixture: ComponentFixture<ExplorebasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExplorebasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorebasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
