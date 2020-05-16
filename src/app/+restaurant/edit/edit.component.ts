import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { SaveRestaurantGQL, GetMyRestaurantGQL, Restaurant } from 'src/app/shared/graphql'

const defaultSections = ['Entrante', 'Plato principal', 'Postre']
const defaultMenuName = 'Menú del día'
const defaultEmoji = '🍴'
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
  savedRestaurant: Restaurant
  editRestaurant: boolean
  editEmoji: boolean
  toastVisible: any
  toastMessage: string
  savedHashState?: string
  // @ts-ignore
  canShare = !!navigator.share
  days = defaultDays.split('')
  emojis = [...defaultEmojis].filter(_ => !_.match(/\s/))
  tooltip?: 'price' | 'icon'

  get isValid() {
    return this.checkIsValid()
  }
  get isTouched() {
    return this.checkIsTouched()
  }

  constructor(
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    console.log(this)
    const restaurant = await this.fetchRestaurant()

    this.restaurant = restaurant || {
      icon: defaultEmoji,
      menu: {name: defaultMenuName, includeBeverage: false, includeBread: false},
      schedule: {days: [true, true, true, true, true], openAt: 0, closeAt: 0},
    } as any
    this.exists = !!restaurant
    this.published = !!this.restaurant.menu.sections?.length

    if (!this.published) {
      setTimeout(() => {
        this.tooltip = 'price'
        this.cdr.markForCheck()
      }, 300)
    }

    if (!this.exists) {
      this.editRestaurant = true
    } else if (!this.restaurant.menu.sections?.length) {
      this.setDefaultSections()
    }

    this.cdr.markForCheck()
  }

  async fetchRestaurant() {
    const restaurant = await this.getMyRestaurantGQL.fetch(undefined, {fetchPolicy: 'no-cache'})
      .toPromise()
      .then(({data}) => data.myRestaurant)
    this.savedRestaurant = JSON.parse(JSON.stringify(restaurant))
    return restaurant
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

    await this.saveRestaurant(restaurant)

    if (!basic) {
      this.showToast(`Menú ${this.published ? 'guardado' : 'publicado'}. ¡Compártelo con tus clientes!`)
      this.published = true
    }

    if (!this.published && basic) {
      this.restaurant.id = (await this.fetchRestaurant())?.id
    }
  }

  async saveRestaurant(restaurant: Restaurant) {
    await this.saveRestaurantGQL.mutate({restaurant})
      .toPromise()
      .then(({data}) => data.saveRestaurant.updated)
    this.savedRestaurant = JSON.parse(JSON.stringify(restaurant))
  }

  setDefaultSections() {
    this.restaurant.menu.sections = defaultSections
      .map(title => ({title, items: []}))
  }

  async share() {
    const {id, name, menu: {price}} = this.savedRestaurant
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

  checkIsValid() {
    const {price, sections} = this.restaurant.menu

    const empties = sections
      .map(({items}) => items)
      .flat()
      .filter(_ => !_)

    return !!price && !empties.length
  }

  checkIsTouched() {
    return this.hashState() !== this.hashState(true)
  }

  hashState(saved?: boolean) {
    const {price, sections, includeBeverage, includeBread} = (saved ? this.savedRestaurant : this.restaurant).menu

    let hash = sections
      .map(({items}) => items.join('|'))
      .join('-')
    hash += `-${[price, includeBeverage, includeBread].join('-')}`
    return hash
  }

  revertRestaurant() {
    this.restaurant.name = this.savedRestaurant.name
    this.restaurant.phone = this.savedRestaurant.phone
    this.restaurant.schedule = JSON.parse(JSON.stringify(this.savedRestaurant.schedule))
  }
  revertEmoji() {
    this.restaurant.icon = this.savedRestaurant.icon
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

  helpDone(type: string, complete?: boolean) {
    if (type === this.tooltip) {
      delete this.tooltip
    }
    if (complete && type === 'price' && this.restaurant.icon === defaultEmoji) {
      this.tooltip = 'icon'
    }
  }

  trackIndex(i: number) {
    return i
  }
}
