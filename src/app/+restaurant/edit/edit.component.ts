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
  // @ts-ignore
  canShare = !!navigator.share

  constructor(
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const restaurant = await this.fetchRestaurant()

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

  async fetchRestaurant() {
    return await this.getMyRestaurantGQL.fetch(undefined, {fetchPolicy: 'network-only'})
      .toPromise()
      .then(({data}) => data.myRestaurant)
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
      .then(({data}) => data.saveRestaurant.updated)

    if (!this.published && basic) {
      this.restaurant.id = (await this.fetchRestaurant())?.id
    }
  }

  setDefaultSections() {
    this.restaurant.menu.sections = defaultSections
      .map(title => ({title, items: []}))
  }

  async share() {
    const {id, name, menu: {price}} = this.restaurant
    const data = {
      title: `Menú de ${name}`,
      text: `🍽️ Te envío el menú del día de ${name}, el precio es de ${price.toFixed(2)}€!\nDisfrútalo 👌\n`,
      url: `${document.location.origin}/${id}`,
    }
    if (this.canShare) {
      // @ts-ignore
      await navigator.share(data)
    } else {
      try {
        // @ts-ignore
        await navigator.clipboard.writeText(data.text + data.url)
      } catch {
        console.log('No Share and Clipboard API!')
      }
    }
  }

  trackIndex(i: number) {
    return i
  }
}
