import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { SaveRestaurantGQL, GetMyRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

const defaultSections = ['Entrante', 'Plato principal', 'Postre']
const defaultMenuName = 'Menú del día'
const defaultDays = 'LMXJVSD'
const defaultEmojis = `
  🍴🍔🍟🍕🌭🥪🌮🌯🥙🥘🍚🍛🍜🍝🍲🍱🍘🍙🍠🍢🍣🍨🍩🍪🎂🍷🥢🍽🥄
  🍺☕🥂🥬🥦🍄🥜🌰🍞🥐🥖🥨🥯🥞🧀🍖🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒
  🍓🥝🍅🥥🥑🍆🥔🥕🌽🌶🥒🍗🥩🥓🥣🥗🍿🧂🥫🍤🍥🥮🍡🥟🥠🥡🍦🍧🍰
  🧁🥧🍫🍬🍭🍮🍯🍼🥛🍵🍶🍾🍸🍹🍻🥃🥤
`

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
  editEmoji: boolean
  toastVisible: any
  toastMessage: string
  // @ts-ignore
  canShare = !!navigator.share
  days = defaultDays.split('')
  emojis = [...defaultEmojis].filter(_ => !_.match(/\s/))

  constructor(
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const restaurant = await this.fetchRestaurant()

    this.restaurant = restaurant || {
      icon: '🍴',
      menu: {name: defaultMenuName},
      schedule: {days: [true, true, true, true, true], openAt: 0, closeAt: 0},
    } as any
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

    await this.saveRestaurantGQL.mutate({restaurant})
      .toPromise()
      .then(({data}) => data.saveRestaurant.updated)

    if (!basic) {
      this.showToast(`Menú ${this.published ? 'guardado' : 'publicado'}. ¡Compártelo con tus clientes!`)
      this.published = true
    }

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
      text: `🍽️ Te envío el menú del día de ${name}, el precio es de ${price.toFixed(2)}€!\n👌 Disfrútalo\n`,
      url: `${document.location.origin}/${id}`,
    }
    if (this.canShare) {
      // @ts-ignore
      await navigator.share(data)
    } else {
      try {
        // @ts-ignore
        await navigator.clipboard.writeText(data.text + data.url)
        this.showToast(`Link copiado en el portapapeles. ¡Listo para mandar!`)
      } catch {
        console.log('No Share and Clipboard API!')
      }
    }
  }

  showToast(text: string) {
    this.toastMessage = text

    clearTimeout(this.toastVisible)
    this.toastVisible = setTimeout(() => {
      this.toastVisible = false
      this.cdr.markForCheck()
    }, 3000) as any

    this.cdr.markForCheck()
  }

  trackIndex(i: number) {
    return i
  }
}
