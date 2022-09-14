import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';
import { OrganizationModel } from 'src/app/services/organization/organization-model';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {

  isLoading = true;

  dtOptions: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 10,
    lengthChange: false,
    dom: 'ftipr',
    processing: true,
    search: true,
    initComplete: () => {
      this.isLoading = false;
    }
  };

  dtTrigger: Subject<any> = new Subject<any>();


  constructor(private organizationService: OrganizationService, private router: Router) {

  }
  allOrganizationsData: OrganizationModel[] = [];
  ngOnInit(): void {
    this.organizationService.getAllOrganizations().subscribe(result => {
      this.allOrganizationsData = result;
      this.dtTrigger.next('');
    });
  }
  navigateEntitlement(org: OrganizationModel): void {
    sessionStorage.setItem('orgName', org.name ?? '');
    this.router.navigate(['../organizations/' + org.id]);
  }

}
