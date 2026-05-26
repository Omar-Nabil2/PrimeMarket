import { TestBed } from '@angular/core/testing';

import { IBrandService } from './ibrand-service';

describe('IBrandService', () => {
  let service: IBrandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IBrandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
