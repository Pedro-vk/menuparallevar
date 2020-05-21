import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/auth'

import { SaveRestaurantGQL, GetMyRestaurantGQL, RemoveUserDataGQL, Restaurant } from 'src/app/shared/graphql'
import { inputNumberFixer, shareRestaurant } from 'src/app/shared'

enum Sections {
  Starters,
  Main,
  Dessert,
}

const defaultSections = ['Entrante', 'Primero', 'Postre']

const defaultMenuName = 'Menú del día'
const defaultEmoji = '🍴'
const defaultDays = 'LMXJVSD'
const defaultEmojis = `
  🍴🍔🍟🍕🌭🥪🌮🌯🥙🥘🍚🍛🍜🍝🍲🍱🍘🍙🍠🍢🍣🍨🍩🍪🎂🍷🥢🍽🥄
  🍺☕🥂🥬🥦🍄🥜🌰🍞🥐🥖🥨🥯🥞🧀🍖🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒
  🍓🥝🍅🥥🥑🍆🥔🥕🌽🌶🥒🍗🥩🥓🥣🥗🍿🧂🥫🍤🍥🥮🍡🥟🥠🥡🍦🍧🍰
  🧁🥧🍫🍬🍭🍮🍯🍼🥛🍵🍶🍾🍸🍹🍻🥃🥤
`

const defaultRestaurant = {
  icon: defaultEmoji,
  menu: {name: defaultMenuName, includeBeverage: false, includeBread: false},
  schedule: {days: [true, true, true, true, true], openAt: 0, closeAt: 0},
} as any

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  sectionNames = defaultSections

  get isValid() {
    return this.checkIsValid()
  }
  get isTouched() {
    return this.checkIsTouched()
  }
  get isInfoTouched() {
    return this.checkIsInfoTouched()
  }

  priceFixer = inputNumberFixer(price => {
    this.restaurant.menu.price = price
  }, 0, 900, 2)

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private saveRestaurantGQL: SaveRestaurantGQL,
    private getMyRestaurantGQL: GetMyRestaurantGQL,
    private removeUserDataGQL: RemoveUserDataGQL,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const restaurant = await this.fetchRestaurant()

    this.restaurant = restaurant || defaultRestaurant
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
    try {
      const restaurant = await this.getMyRestaurantGQL.fetch(undefined, {fetchPolicy: 'no-cache'})
        .toPromise()
        .then(({data}) => data.myRestaurant)

      this.savedRestaurant = JSON.parse(JSON.stringify(restaurant || defaultRestaurant))
      return restaurant
    } catch {
      this.router.navigate(['/'])
    }
  }

  async save(type: string, basic?: boolean) {
    const restaurant: Restaurant = {
      ...this.savedRestaurant,
      id: undefined,
      owner: undefined,
    }

    switch (type) {
      case 'menu':
        restaurant.menu = {
          ...this.restaurant.menu,
          sections: (this.restaurant.menu.sections || [])
            .map(section => ({...section, items: section.items.filter(_ => !!_)})),
        }
        break
      case 'emoji':
        restaurant.icon = this.restaurant.icon
        break
      case 'restaurant':
        restaurant.name = this.restaurant.name
        restaurant.phone = this.restaurant.phone
        restaurant.schedule = this.restaurant.schedule
        break
    }

    if (basic) {
      this.restoreScroll()
    }

    if ((!this.published && basic) || !restaurant.menu.sections.length) {
      if (restaurant.menu?.sections) {
        delete restaurant.menu.sections
      }
      this.setDefaultSections()
    }

    await this.saveRestaurant(restaurant)
    this.exists = true

    if (!basic) {
      this.published = true
    }

    if (!this.published && basic) {
      this.restaurant.id = this.savedRestaurant.id = (await this.fetchRestaurant())?.id
    }
    this.cdr.markForCheck()
  }

  async saveRestaurant(restaurant: Restaurant) {
    await this.saveRestaurantGQL.mutate({restaurant})
      .toPromise()
      .then(({data}) => data.saveRestaurant.updated)
    this.savedRestaurant = {
      ...JSON.parse(JSON.stringify(restaurant)),
      id: this.savedRestaurant.id,
    }
  }

  setDefaultSections() {
    this.restaurant.menu.sections = Object.values(Sections)
      .filter(_ => typeof _ === 'number')
      .map(section => ({section: +section, items: []}))
  }

  removeData() {
    setTimeout(async () => {
      const remove = confirm('¿Quieres eliminar todos tus datos?')

      if (remove) {
        await this.removeUserDataGQL.mutate().toPromise()
      }
      await this.fireAuth.signOut()
      await this.router.navigate(['/'])
    }, 100)
  }

  async share() {
    await shareRestaurant(this.savedRestaurant)
    this.showToast(`Link copiado en el portapapeles. ¡Listo para mandar!`)
  }

  checkIsValid() {
    const {price, sections} = this.restaurant.menu

    const list = (sections || [])
      .map(({items}) => items)
      .flat()
    const filled = list.filter(_ => !!_)

    return !!price && list.length && filled.length
  }

  checkIsTouched() {
    return this.hashState('main') !== this.hashState('main', true)
  }

  checkIsInfoTouched() {
    return this.hashState('info') !== this.hashState('info', true)
  }

  hashState(type: string, saved?: boolean) {
    const restaurant = (saved ? this.savedRestaurant : this.restaurant)
    if (type === 'main') {
      const {price, sections, includeBeverage, includeBread} = restaurant.menu

      let hash = (sections || [])
        .map(({items}) => items.filter(_ => !!_).join('|'))
        .join('-')
      hash += `-${[price, includeBeverage, includeBread].join('-')}`
      return hash
    }
    if (type === 'info') {
      const {name, phone, schedule: {openAt, closeAt, days}} = restaurant
      return [name, phone, openAt, closeAt, days].join('-')
    }
  }

  revertRestaurant() {
    this.restaurant.name = this.savedRestaurant.name
    this.restaurant.phone = this.savedRestaurant.phone
    this.restaurant.schedule = JSON.parse(JSON.stringify(this.savedRestaurant.schedule))
    this.restoreScroll()
  }
  revertEmoji() {
    this.restaurant.icon = this.savedRestaurant.icon
    this.restoreScroll()
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

  restoreScroll() {
    document.body.querySelector('app-root').scroll(0, 0)
  }

  focusLastInput(element: any) {
    setTimeout(() => {
      const input = Array.from<any>(element.querySelectorAll('input')).pop()
      input.focus()
    }, 100)
  }

  trackIndex(i: number) {
    return i
  }
}
