import { Component, OnInit } from '@angular/core'
import { MetaService } from '@ngx-meta/core'


@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(private metaService: MetaService) { }

  ngOnInit(): void {
    this.metaService.setTag('prerender-status-code', '404')
  }

}
