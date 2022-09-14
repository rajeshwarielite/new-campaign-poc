import { Component } from '@angular/core';
import { delay } from 'rxjs';
import { LoginProviderService } from './services/login-provider/login-provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'campaign-new';
  constructor(private loginProviderService: LoginProviderService) {
    this.loginProviderService.getToken();
  }
}
