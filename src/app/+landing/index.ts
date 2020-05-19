import { Routes } from '@angular/router'

import { HomeComponent } from './home/home.component'
import { NotFoundComponent } from './not-found/not-found.component'

export const landingsComponents = [
  HomeComponent,
  NotFoundComponent,
]

export const landingRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: '404', component: NotFoundComponent},
]
