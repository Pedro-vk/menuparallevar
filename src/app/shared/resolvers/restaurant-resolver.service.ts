import { Injectable } from '@angular/core'
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Restaurant, GetRestaurantGQL, GetMyRestaurantGQL } from '../graphql'

const demoRestaurant: Restaurant = {
  id: 'demo',
  owner: false,
  name: 'Paquito\'s Taquitos',
  phone: '600000000',
  icon: '🌮',
  schedule: {
    days: [
      true,
      true,
      true,
      true,
      true,
      true
    ],
    openAt: 45000000,
    closeAt: 82800000,
  },
  menu: {
    name: 'Menú del día',
    price: 9.95,
    includeBread: true,
    includeBeverage: true,
    sections: [
      {
        section: 0,
        items: [
          'Ensalada de nopal',
          'Sopa azteca',
          'Aguachile',
        ],
      },
      {
        section: 1,
        items: [
          'Tacos al pastor',
          'Sopes de pollo',
          'Torta ahogada',
        ],
      },
      {
        section: 2,
        items: [
          'Jericalla',
          'Pastel de tres leches',
          'Arroz con leche',
        ],
      },
    ],
  },
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantResolverService implements Resolve<Restaurant> {

  constructor(
    private router: Router,
    private getRestaurantGQL: GetRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const id = route.paramMap.get('id')
    const type = route.data.restaurant

    if (id) {
      try {
        return await this.getRestaurantGQL.fetch({id}, {fetchPolicy: 'no-cache'})
          .toPromise()
          .then(({data}) => ({type: 'id', ...data.restaurant}))
      } catch {
        this.router.navigate(['/404'])
        return EMPTY as any
      }
    }
    if (type === 'own') {
      return await this.getMyRestaurantGQL.fetch()
        .toPromise()
        .then(({data}) => ({type: 'own', ...data.myRestaurant}))
    }
    if (type === 'demo') {
      return Promise.resolve({type: 'demo', ...demoRestaurant})
    }

    return EMPTY as any
  }
}
