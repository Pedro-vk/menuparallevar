import {
  Component, OnInit, ChangeDetectionStrategy,
} from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { filter } from 'rxjs/operators'

import { GetUserGQL } from 'src/app/shared/graphql'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  user$: AngularFireAuth['user']

  constructor(
    private fireAuth: AngularFireAuth,
    private getUserGQL: GetUserGQL,
  ) { }

  ngOnInit() {
    this.user$ = this.fireAuth.user
    this.user$
      .pipe(filter(_ => !!_))
      .subscribe(() =>
        this.getUserGQL.fetch()
          .toPromise()
      )
  }

  login() {
    this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())
  }

  logout() {
    this.fireAuth.signOut()
  }
}
