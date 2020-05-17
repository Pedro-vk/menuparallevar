import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, combineLatest, interval } from 'rxjs'
import { switchMap, map, startWith } from 'rxjs/operators'

import { Query, GetRestaurantGQL, Restaurant, Menu } from 'src/app/shared/graphql'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  restaurant$: Observable<Restaurant>
  status$: Observable<{open: boolean, openAt: number, closeAt: number, openRemaining: string}>
  includes$: Observable<string>
  now = Date.now()

  constructor(private route: ActivatedRoute, private getRestaurantGQL: GetRestaurantGQL) { }

  ngOnInit() {
    this.restaurant$ = this.route.paramMap
      .pipe(
        switchMap(params => this.getRestaurantGQL.fetch({id: params.get('id')})),
        map(({data}) => data.restaurant),
        map(restaurant => ({
          ...restaurant,
          menu: {
            ...restaurant.menu,
            sections: restaurant.menu.sections
              .filter(({items}) => items.length),
          },
        }))
      )

    this.includes$ = this.restaurant$
      .pipe(map(({menu: {includeBeverage, includeBread}}) => {
        if (includeBeverage === includeBread) {
          return includeBeverage ? 'Incluye pan y bebida' : 'No incluye pan o bebida'
        }
        return `Incluye ${includeBread ? 'pan' : 'bebida'}`
      }))

    this.status$ = combineLatest(
      this.restaurant$,
      interval(10 * 1000).pipe(startWith(null)),
      _ => _,
    )
      .pipe(
        map(({schedule: {days, openAt, closeAt}}) => {
          const h24 = 24 * 60 * 60 * 1000
          const m1 = 60 * 1000
          const now = (Date.now() - (new Date().getTimezoneOffset() * m1)) % h24
          let open = false
          if (openAt <= closeAt) {
            open = openAt <= now && now <= closeAt
          } else {
            open = openAt <= now || now <= closeAt
          }
          let openRemaining: any = (closeAt - now)
          if (openRemaining < 0) {
            openRemaining += h24
          }
          if (openRemaining < (60 * m1)) {
            const m = Math.ceil(openRemaining / 60 / 1000)
            openRemaining = `${m} minuto${m !== 1 ? 's' : ''}`
          } else {
            const h = Math.floor(openRemaining / 60 / 60 / 1000)
            openRemaining = `${h} hora${h !== 1 ? 's' : ''}`
          }
          return {openAt, closeAt, open, openRemaining}
        })
      )
  }
}
