import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-traffic',
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.scss']
})
export class TrafficComponent implements OnInit {

  selectedTab = 'Network';

  constructor() { }

  ngOnInit(): void {
  }

  tabSelected(tab: string) {
    this.selectedTab = tab;
  }

}
