import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { SaveRestaurantGQL, GetMyRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  restaurant: Restaurant

  constructor(
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.restaurant = await this.getMyRestaurantGQL.fetch()
      .toPromise()
      .then(({data}) => data.myRestaurant)

    console.log(this.restaurant)
    this.cdr.markForCheck()
  }

  save() {
    this.saveRestaurantGQL.mutate({restaurant: this.restaurant})
      .toPromise()
  }

  trackIndex(i: number) {
    return i
  }
}
