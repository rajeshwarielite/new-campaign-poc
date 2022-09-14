import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';
import { AllEntitlementsModel, OrganizationModel } from 'src/app/services/organization/organization-model';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  defineFormGroup: FormGroup = new FormGroup({
    organizationName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl(''),
  });

  successMessage = '';
  errorMessage = '';

  constructor(private organizationService: OrganizationService, private router: Router) {
    
  }
  allEntitlementsData: AllEntitlementsModel[] = [];
  ngOnInit(): void {
    this.organizationService.getAllEntitlements().subscribe(result => this.allEntitlementsData = result);
  }
  saveOrganization() {
    const organizationData: OrganizationModel = {
      bypassCAP: false,
      name: this.defineFormGroup.value.organizationName,
      description: this.defineFormGroup.value.description,
      capExpires: null,
      capOverride: null,
      capStatus: null,
      cloudGeography: null,
      country: null,
      externalOrgRef: null,
      inheritList: null,
      oracleId: null,
      parentId: null,
      parentOrgName: null,
      salesforceId: null,
      territory: null
    };

    this.organizationService.saveOrganization(organizationData).subscribe(() => {
      this.successMessage = 'Organization added Successfully';
      this.errorMessage = '';
      setTimeout(() => {
        this.router.navigate(['/organizations']);
      }, 1000);
    },
      ((err: HttpErrorResponse) => {
        this.successMessage = '';
        this.errorMessage = err.error.errorMessage;
        setTimeout(() => {
          this.router.navigate(['/organizations']);
        }, 1000);
      })
    );

  }
  messageReset() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
