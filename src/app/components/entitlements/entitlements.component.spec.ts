import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitlementsComponent } from './entitlements.component';

describe('EntitlementsComponent', () => {
  let component: EntitlementsComponent;
  let fixture: ComponentFixture<EntitlementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitlementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
