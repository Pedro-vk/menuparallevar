import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

import { Query, GetRestaurantGQL, Restaurant, Menu } from 'src/app/shared/graphql'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  restaurant$: Observable<Restaurant>
  now = Date.now()

  constructor(private route: ActivatedRoute, private getRestaurantGQL: GetRestaurantGQL) { }

  ngOnInit() {
    this.restaurant$ = this.route.paramMap
      .pipe(
        switchMap(params => this.getRestaurantGQL.fetch({id: params.get('id')})),
        map(({data}) => data.restaurant)
      )
  }

  menuIncludes(menu: Menu) {
    const list = []
    if (menu.includeBread) {
      list.push('pan')
    }
    if (menu.includeBeverage) {
      list.push('bebida')
    }
    return list.join(' y ')
  }

}
