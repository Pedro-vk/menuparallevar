import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { SaveRestaurantGQL, GetMyRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

const defaultSections = ['Entrante', 'Plato principal', 'Postre']

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  exists: boolean
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

    this.exists = !!this.restaurant
    this.cdr.markForCheck()
  }

  async save() {
    const restaurant: Restaurant = {
      ...this.restaurant,
      menu: {
        ...this.restaurant.menu,
        sections: this.restaurant.menu.sections
          .map(section => ({...section, items: section.items.filter(_ => !!_)}))
      }
    }
    await this.saveRestaurantGQL.mutate({restaurant})
      .toPromise()
  }

  trackIndex(i: number) {
    return i
  }
}
