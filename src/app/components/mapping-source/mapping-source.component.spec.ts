import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateService } from 'src/app-services/translate.service';
import { SsoAuthService } from 'src/app/shared/services/sso-auth.service';
import { CommonService } from 'src/app/sys-admin/services/common.service';
import { EndpointMappingSourceService } from '../../services/endpoint-mapping-source.service';

import { MappingSourceComponent } from './mapping-source.component';

describe('MappingSourceComponent', () => {
  let component: MappingSourceComponent;
  let fixture: ComponentFixture<MappingSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingSourceComponent ],
      imports: [
        RouterTestingModule, HttpClientTestingModule
, NgSelectModule, FormsModule
      ],
      providers: [ SsoAuthService, NgbModal, CommonService, TranslateService, EndpointMappingSourceService, Title
      ]
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
