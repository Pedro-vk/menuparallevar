import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { filter } from 'rxjs/operators'

import { GetUserGQL, GetLandingDataGQL } from 'src/app/shared/graphql'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  emojis = [...'🍕🌮🍜🌯🍝🍔🍕🌮🍜🌯🍝🍔']

  user$: AngularFireAuth['user']
  restaurants$: Promise<number>
  restaurantName$: Promise<string>

  faqsOpen = {} as any

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private getUserGQL: GetUserGQL,
    private getLandingDataGQL: GetLandingDataGQL,
  ) { }

  ngOnInit() {
    this.user$ = this.fireAuth.user
    const data$ = this.getLandingDataGQL.fetch()
      .toPromise()

    this.restaurants$ = data$
      .then(({data}) => data.restaurantsNumber)
    this.restaurantName$ = data$
      .then(({data}) => data.myRestaurant?.name)
  }

  async login() {
    await this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())
    this.router.navigate(['/mi-restaurante'])
  }

  async logout() {
    await this.fireAuth.signOut()
  }
}
