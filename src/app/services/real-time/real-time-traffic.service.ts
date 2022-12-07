import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RealTimeTrafficService {

  private socketSubject = new ReplaySubject<any>();

  public netSocketStream$ = this.socketSubject.asObservable();

  private apiUrl = 'https://stage.api.calix.ai/v1/';

  constructor(private httpClient: HttpClient) { }

  getSocketUrl(): Observable<{ signedurl: string }> {
    return this.httpClient.get<{ signedurl: string }>(this.apiUrl + 'realtime/signed-url');
  }

  getSocketConnection(socketUrl: string) {

    // const subject = webSocket({
    //   url:socketUrl,
    //   protocol:['websocket'],      
    // });

    // subject.subscribe({
    //   next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
    //   error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
    //   complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    // });

    // subject.next({
    //   delay: 60, graphType: "TRF,TAPP,TLOC,TEP", monitorId: "12921722_0", monitorType: "NET", networkId: "12921722_0", orgId: "12921722", outputStartTimeDiffToCur: 135114, startTime: new Date().getTime(), windowLen: 1,
    // });

    console.log('socket');

    const socket = io(socketUrl, {
      transports: ['websocket'],
      path: '/calix/socket-io/',
      autoConnect: false,
      reconnection: false
    });

    socket.open();

    socket.on("connect", () => {
      console.log('connect');
    });

    socket.on("ping", () => {
      console.log('ping');
    });

    socket.on("error", (error) => {
      console.log('error', error);
    });

    socket.on("reconnect", (attempt) => {
      console.log('reconnect', attempt);
    });

    socket.on("NET", (data) => {
      //console.log('NET', data);
      this.socketSubject.next(data);
    });

    socket.on("REPLAY", (data) => {
      console.log('REPLAY', data);
    });

    socket.emit('NET', {
      delay: 60, graphType: "TRF,TAPP,TLOC,TEP", monitorId: "12921722_0", monitorType: "NET", networkId: "12921722_0", orgId: "12921722", outputStartTimeDiffToCur: 135114, startTime: new Date().getTime(), windowLen: 1,
    });

    setTimeout(() => {
      this.getTrafficRecording();
    }, 1000);
  }

  getTrafficRecording() {
    this.httpClient.post(this.apiUrl + 'record/job/status/Recording', {
      monitorType: 'NET',
      monitorId: '12921722_0'
    }).subscribe(result => console.log('Record', result));
  }
}
