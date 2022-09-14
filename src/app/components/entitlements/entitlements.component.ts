import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { AllEntitlementsModel, EntitlementByIDModel, UsersModel, UsersSizeModel } from 'src/app/services/organization/organization-model';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-entitlements',
  templateUrl: './entitlements.component.html',
  styleUrls: ['./entitlements.component.scss']
})
export class EntitlementsComponent implements OnInit {

  orgId = '';
  orgName = '';
  deleteUserName = '';
  rolesId = '';
  successMessage = '';

  isLoading = true;
  enableSave = false;
  modalRef?: BsModalRef;
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective = DataTableDirective.prototype;

  dtOptions: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 10,
    lengthChange: false,
    dom: 'ltipr',
    processing: true,
    search: false,
    ordering: false,
    initComplete: () => {
      this.isLoading = false;
    }
  };

  dtTrigger: Subject<any> = new Subject<any>();

  formGroup: FormGroup = new FormGroup({
    selectedUserIds: new FormControl([]),
  });

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private organizationService: OrganizationService, private modalService: BsModalService) {

  }

  allEntitlementsData: AllEntitlementsModel[] = [];
  savedEntitlementsData: EntitlementByIDModel[] = [];
  entitilementsToSave: EntitlementByIDModel[] = [];
  usersSize: UsersSizeModel[] = [];
  allUsersSize: UsersSizeModel[] = [];
  assignedUsers: string[] = [];

  ngOnInit(): void {
    this.allEntitlementsData = [];
    this.savedEntitlementsData = [];
    this.entitilementsToSave = [];
    this.orgName = sessionStorage.getItem('orgName') ?? '';
    this.orgId = this.activatedRoute.snapshot.paramMap.get('orgId') ?? '';

    this.organizationService.getAllEntitlements().subscribe(result => {
      result.forEach(r => r.status = '');
      this.organizationService.entitlementByID(this.orgId).subscribe(savedResult => {
        savedResult = savedResult.filter(s => s.status).sort((a, b) => { return new Date(b.updateTime!).getTime() - new Date(a.updateTime!).getTime() });
        savedResult = savedResult.reduce((unique: EntitlementByIDModel[], o) => {
          if (!unique.some(obj => obj.appType === o.appType)) {
            unique.push(o);
          }
          return unique;
        }, []);
        savedResult.forEach(sa => {
          const matchedData = result.find(f => f.appType === sa.appType);
          matchedData!.status = sa.status;
          matchedData!.startDate = sa.startDate;
          matchedData!.endDate = sa.endDate;
        });



        this.savedEntitlementsData = savedResult;
        this.allEntitlementsData = result;

        this.organizationService.getRoles(this.orgId).subscribe(rolesresult => {

          this.rolesId = rolesresult.find(ele => ele.name === 'OrgAdmin')?._id ?? '';
          this.organizationService.getRolesByID(this.rolesId).subscribe(rolesIdResult => {
            this.assignedUsers = rolesIdResult.users ? rolesIdResult.users.map(u => u.username) : [];
            this.dtTrigger.next('');
            this.organizationService.getUsersCount(this.orgId).subscribe(countresult => {
              this.organizationService.getUsersSize(this.orgId, countresult).subscribe(result1 => {
                this.allUsersSize = result1;
                this.usersSize = result1.filter(r => !this.assignedUsers.includes(r.username));
              });
            });
          });
        });

      })
    }
    );
  }

  openModal(userName: string, template: TemplateRef<any>): void {
    this.deleteUserName = userName;
    this.modalRef = this.modalService.show(template);
  }

  changeEntitlementStatus(entity: AllEntitlementsModel, event: any) {
    const duplicateEntity = this.entitilementsToSave.find(f => f.appType === entity.appType);
    if (duplicateEntity) {
      duplicateEntity.status = event.target.value;
    }
    else {
      const existingEntity = this.savedEntitlementsData.find(sf => sf.appType === entity.appType);
      if (existingEntity) {
        existingEntity.status = event.target.value;
        this.entitilementsToSave.push(existingEntity);
      } else {
        const saveEntitlementData: EntitlementByIDModel = {
          appType: entity.appType + '',
          contractNumber: null,
          createTime: null,
          customer: null,
          disabledFlag: false,
          endDate: null,
          entitlement: 100,
          id: null,
          name: entity.name,
          organizationId: this.orgId,
          overrideEndDate: '',
          partCategory: null,
          partDescription: null,
          partNumber: null,
          productFamily: null,
          qty: null,
          serviceEdition: null,
          serviceName: null,
          startDate: null,
          status: event.target.value,
          updateTime: null
        };
        this.entitilementsToSave.push(saveEntitlementData);
      }
    }
    this.enableSave = true;
  }
  async saveSelectedEntitlements(): Promise<void> {
    const userIds = this.assignedUsers.map(a => this.allUsersSize.find(s => s.username === a)?._id ?? '')
    this.organizationService.saveUser(userIds, this.rolesId).subscribe();
    for (let i = 0; i < this.entitilementsToSave.length; i++) {
      await this.organizationService.saveEntitlement(this.entitilementsToSave[i]);
    }
    this.successMessage = 'Organization Updated succesfully';
    setTimeout(() => {
      this.router.navigate(['/organizations']);
    }, 1500);
  }

  cancelSelectedEntitlements(): void {
    this.router.navigate(['/organizations']);
  }
  addUser(): void {
    if (this.formGroup.value.selectedUserIds.length > 0) {
      this.assignedUsers = [...this.assignedUsers, ...this.formGroup.value.selectedUserIds];
      this.formGroup.controls['selectedUserIds'].setValue([]);
      this.usersSize = this.usersSize.filter(r => !this.assignedUsers.includes(r.username));
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        this.dtTrigger.next('');
      });
      this.enableSave = true;
    }
  }

  removeUser(): void {
    this.assignedUsers = this.assignedUsers.filter(a => a !== this.deleteUserName);
    this.usersSize = [...this.usersSize, this.allUsersSize.find(a => a.username === this.deleteUserName)!];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      this.dtTrigger.next('');
    });
    this.modalRef?.hide()
    this.enableSave = true;
  }
}
