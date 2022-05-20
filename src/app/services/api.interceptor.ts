import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor() {

  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      setHeaders: {
        'X-Calix-ClientID': 'UcWGgUfH0guUPG2LkGVU5GbPAjhi22JO',
        'X-Calix-AccessToken': '' + sessionStorage.getItem('access_token')
      }
    });
    return next.handle(request);
  }
}
