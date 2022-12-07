import { Component, OnInit } from '@angular/core';
import { RealTimeTrafficService } from 'src/app/services/real-time/real-time-traffic.service';

@Component({
  selector: 'app-real-time',
  templateUrl: './real-time.component.html',
  styleUrls: ['./real-time.component.scss']
})
export class RealTimeComponent implements OnInit {

  data: any;

  constructor(private realTimeTrafficService: RealTimeTrafficService) { }

  ngOnInit(): void {
    this.realTimeTrafficService.getSocketUrl().subscribe(result => {
      console.log(result);
      this.realTimeTrafficService.getSocketConnection(result.signedurl);
      this.realTimeTrafficService.netSocketStream$.subscribe(
        result => {
          const cData = JSON.parse(result);
          console.log(cData);
          this.data = cData;
        });
    });
  }

}
