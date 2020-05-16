import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { filter } from 'rxjs/operators'

import { GetUserGQL, GetRestaurantsNumberGQL } from 'src/app/shared/graphql'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  emojis = [...'🌯🥙🥘🍚🍟🍝🍔🍕🌮🌭🍜🥪🍛🍝']

  user$: AngularFireAuth['user']
  restaurants$: Promise<number>

  constructor(
    private fireAuth: AngularFireAuth,
    private getUserGQL: GetUserGQL,
    private getRestaurantsNumberGQL: GetRestaurantsNumberGQL,
  ) { }

  ngOnInit() {
    this.user$ = this.fireAuth.user
    this.restaurants$ = this.getRestaurantsNumberGQL.fetch()
      .toPromise()
      .then(({data}) => data.restaurantsNumber)
  }

  login() {
    this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())
  }

  logout() {
    this.fireAuth.signOut()
  }
}
