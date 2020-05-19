import { Injectable } from '@angular/core'
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Restaurant, GetRestaurantGQL, GetMyRestaurantGQL } from '../graphql'

const demoRestaurant = {
  id: '',
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
    openAt: 36000000,
    closeAt: 72000000
  },
  menu: {
    name: 'Menú del día',
    price: 9.95,
    includeBread: true,
    includeBeverage: true,
    sections: [
      {
        title: 'Entrante',
        items: [
          'Ensalada de nopal',
          'Sopa azteca',
          'Aguachile',
        ],
      },
      {
        title: 'Plato principal',
        items: [
          'Tacos al pastor',
          'Sopes de pollo',
          'Torta ahogada',
        ],
      },
      {
        title: 'Postre',
        items: [
          'Jericalla',
          'Pastel de tres leches',
          'Arroz con leche',
        ],
      },
    ]
  }
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
    if (type === 'demo') {
      return Promise.resolve({type: 'demo', ...demoRestaurant})
    }

    return EMPTY
  }
}
