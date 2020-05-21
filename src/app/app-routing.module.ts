import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning, MetaGuard } from '@ngx-meta/core'

import { landingRoutes } from './+landing'
import { restaurantRoutes } from './+restaurant'

const routes: Routes = [
  {path: '', canActivateChild: [MetaGuard], children: [
    ...landingRoutes,
    ...restaurantRoutes,
    {path: '**', redirectTo: '/404'},
  ]},
]

export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' - ',
    applicationName: 'Menú para llevar',
    applicationUrl: 'https://menuparallevar.com',
    defaults: {
      title: 'Menú para llevar',
    },
  })
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: metaFactory
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
