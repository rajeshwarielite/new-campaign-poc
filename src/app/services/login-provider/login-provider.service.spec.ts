import { TestBed } from '@angular/core/testing';

import { LoginProviderService } from './login-provider.service';

describe('LoginProviderService', () => {
  let service: LoginProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
