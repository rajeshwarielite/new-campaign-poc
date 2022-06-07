import { TestBed } from '@angular/core/testing';

import { QlikProviderService } from './qlik-provider.service';

describe('QLIKProviderService', () => {
  let service: QlikProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QlikProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
