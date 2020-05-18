import { Injectable } from '@angular/core'
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Restaurant, GetRestaurantGQL, GetMyRestaurantGQL } from '../graphql'

@Injectable({
  providedIn: 'root'
})
export class RestaurantResolverService implements Resolve<Restaurant> {

  constructor(
    private router: Router,
    private getRestaurantGQL: GetRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const id = route.paramMap.get('id')
    const type = route.data.restaurant

    if (id) {
      try {
        return this.getRestaurantGQL.fetch({id})
          .toPromise()
          .then(({data}) => ({type: 'id', ...data.restaurant}))
      } catch {
        this.router.navigate(['/'])
        return EMPTY
      }
    }
    if (type === 'own') {
      return this.getMyRestaurantGQL.fetch()
        .toPromise()
        .then(({data}) => ({type: 'own', ...data.myRestaurant}))
    }

    return EMPTY
  }
}
