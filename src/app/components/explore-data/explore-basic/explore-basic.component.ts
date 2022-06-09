import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';
import { LoginProviderService } from 'src/app/services/login-provider/login-provider.service';

@Component({
  selector: 'app-explorebasic',
  templateUrl: './explore-basic.component.html',
  styleUrls: ['./explore-basic.component.scss']
})
export class ExploreBasicComponent implements OnInit {

  constructor(private exploreDataService: ExploreDataService,
    private loginProviderService: LoginProviderService,) {
      this.loginProviderService.getToken();
     }
  allRegionData: [string[]] = [[]];
  regionData: string[] = [];
  locationData: string[] = [];

  ngOnInit(): void {
    this.exploreDataService.getRegion().subscribe(result => {
      this.allRegionData = result
      this.regionData = [...new Set(result.map(r => r[0]))];
    });
  }

  regionSelected(event: any): void {
    const region = event.target.value;
    this.locationData = this.allRegionData.filter(r => r[0] === region).map(r => r[1]);
  }

  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;
 
  selectTab(tabId: number) {
    if (this.staticTabs?.tabs[tabId]) {
      this.staticTabs.tabs[tabId].active = true;
    }
  }

}
