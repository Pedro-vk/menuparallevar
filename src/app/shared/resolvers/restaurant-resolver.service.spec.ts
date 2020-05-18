import { TestBed } from '@angular/core/testing';

import { RestaurantResolverService } from './restaurant-resolver.service';

describe('RestaurantResolverService', () => {
  let service: RestaurantResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
