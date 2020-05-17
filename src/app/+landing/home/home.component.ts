import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
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
  emojis = [...'🍕🌮🍜🌯🍝🍔🍕🌮🍜🌯🍝🍔']

  user$: AngularFireAuth['user']
  restaurants$: Promise<number>

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private getUserGQL: GetUserGQL,
    private getRestaurantsNumberGQL: GetRestaurantsNumberGQL,
  ) { }

  ngOnInit() {
    this.user$ = this.fireAuth.user
    this.restaurants$ = this.getRestaurantsNumberGQL.fetch()
      .toPromise()
      .then(({data}) => data.restaurantsNumber)
  }

  async login() {
    await this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())
    this.router.navigate(['/mi-restaurante'])
  }

  async logout() {
    await this.fireAuth.signOut()
  }
}
