import { Routes } from '@angular/router'

import { HomeComponent } from './home/home.component'

export const landingsComponents = [
  HomeComponent,
]

export const landingRoutes: Routes = [
  {path: '', component: HomeComponent},
]
