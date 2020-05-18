import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, combineLatest, interval } from 'rxjs'
import { switchMap, map, startWith } from 'rxjs/operators'

import { Query, GetRestaurantGQL, Restaurant, Menu } from 'src/app/shared/graphql'

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  restaurant$: Observable<Restaurant & {type: string}>
  status$: Observable<{open: boolean, openAt: number, closeAt: number, openRemaining: string}>
  includes$: Observable<string>
  now = Date.now()

  constructor(private route: ActivatedRoute, private getRestaurantGQL: GetRestaurantGQL) { }

  ngOnInit() {
    this.restaurant$ = this.route.data
      .pipe(
        map(({restaurant}) => ({
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
          const midnightOffset = (openAt > closeAt) ? closeAt : 0
          const day = (new Date(Date.now() - midnightOffset).getDay() + 6) % 7
          let open = false
          let closeRemaining
          if (days[day]) {
            if (openAt === closeAt) {
              open = true
            } else if (openAt < closeAt) {
              open = openAt <= now && now <= closeAt
            } else {
              open = openAt <= now || now <= closeAt
            }
          }
          if (!open && !days[(day + 1) % 7]) {
            let stop = false
            let remaining = 0
            Array.from({length: 7})
              .forEach((_, i) => {
                if (!stop && !days[(day + 1 + i) % 7]) {
                  remaining++
                } else {
                  stop = true
                }
              })
            closeRemaining = `Abre el ${weekDays[(remaining + day + 1) % 7]}`
          }
          let openRemaining: any = (closeAt - now)
          if (openRemaining < 0) {
            openRemaining += h24
          }
          if (openAt === closeAt) {
            openRemaining = 'Abieto 24 horas'
          } else if (openRemaining < (60 * m1)) {
            const m = Math.ceil(openRemaining / 60 / 1000)
            openRemaining = `Cierra en ${m} minuto${m !== 1 ? 's' : ''}`
          } else {
            const h = Math.floor(openRemaining / 60 / 60 / 1000)
            openRemaining = `Cierra en ${h} hora${h !== 1 ? 's' : ''}`
          }
          return {openAt, closeAt, open, openRemaining, closeRemaining}
        })
      )
  }
}
