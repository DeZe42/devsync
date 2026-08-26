import { TestBed } from '@angular/core/testing';
import { PullRequestStoreService } from './pull-request-store.service';

describe('PullRequestStoreService', () => {
  let service: PullRequestStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PullRequestStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
