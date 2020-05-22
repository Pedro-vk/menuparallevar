import { Component, OnInit } from '@angular/core';

import { AngularFireAnalytics } from '@angular/fire/analytics'

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private fireAnalytics: AngularFireAnalytics) { }

  ngOnInit(): void {
  }

  trackDonate() {
    this.fireAnalytics.logEvent('click_donate')
    return true
  }
}
