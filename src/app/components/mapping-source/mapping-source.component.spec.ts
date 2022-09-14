import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingSourceComponent } from './mapping-source.component';

describe('MappingSourceComponent', () => {
  let component: MappingSourceComponent;
  let fixture: ComponentFixture<MappingSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
