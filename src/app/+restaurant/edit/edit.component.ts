import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { SaveRestaurantGQL, GetMyRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

const defaultSections = ['Entrante', 'Plato principal', 'Postre']
const defaultMenuName = 'Menú del día'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  exists: boolean
  published: boolean
  restaurant: Restaurant
  editRestaurant: boolean

  constructor(
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const restaurant = await this.getMyRestaurantGQL.fetch()
      .toPromise()
      .then(({data}) => data.myRestaurant)

    this.restaurant = restaurant || {menu: {name: defaultMenuName}} as any
    this.exists = !!restaurant
    this.published = !!this.restaurant.menu.sections?.length

    if (!this.exists) {
      this.editRestaurant = true
    } else if (!this.restaurant.menu.sections?.length) {
      this.setDefaultSections()
    }

    this.cdr.markForCheck()
  }

  async save(basic?: boolean) {
    const restaurant: Restaurant = {
      ...this.restaurant,
      id: undefined,
      menu: {
        ...this.restaurant.menu,
        sections: (this.restaurant.menu.sections || [])
          .map(section => ({...section, items: section.items.filter(_ => !!_)}))
      },
    }
    if ((!this.published && basic) || !restaurant.menu.sections.length) {
      delete restaurant.menu.sections
      this.setDefaultSections()
    }
    if (!basic) {
      this.published = true
    }

    await this.saveRestaurantGQL.mutate({restaurant})
      .toPromise()
  }

  setDefaultSections() {
    this.restaurant.menu.sections = defaultSections
      .map(title => ({title, items: []}))
  }

  trackIndex(i: number) {
    return i
  }
}
