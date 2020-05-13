import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

import { Query, GetRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  restaurant$: Observable<Restaurant>

  constructor(private route: ActivatedRoute, private getRestaurantGQL: GetRestaurantGQL) { }

  ngOnInit() {
    this.restaurant$ = this.route.paramMap
      .pipe(
        switchMap(params => this.getRestaurantGQL.fetch({id: params.get('id')})),
        map(({data}) => data.restaurant)
      )
  }

}
