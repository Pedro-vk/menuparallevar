import {
  Component, OnInit, ChangeDetectionStrategy, Inject, ViewChild, ViewChildren, AfterViewInit, ElementRef, LOCALE_ID,
  QueryList,
} from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Router, NavigationStart, NavigationEnd } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { filter } from 'rxjs/operators'
import { scrollbarWidth } from '@xobotyi/scrollbar-width'

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
    private elementRef: ElementRef,
    private router: Router,
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
