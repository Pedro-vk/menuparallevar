import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { landingRoutes } from './+landing'
import { restaurantRoutes } from './+restaurant'

const routes: Routes = [
  {path: '', canActivateChild: [], children: [
    ...landingRoutes,
    ...restaurantRoutes,
  ]},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
