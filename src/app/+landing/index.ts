import { Routes } from '@angular/router'

import { AboutComponent } from './about/about.component'
import { HomeComponent } from './home/home.component'
import { NotFoundComponent } from './not-found/not-found.component'

export const landingsComponents = [
  AboutComponent,
  HomeComponent,
  NotFoundComponent,
]

export const landingRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'sobre-nosotros', component: AboutComponent, data: {meta: {title: 'Sobre nosotros'}}},
  {path: '404', component: NotFoundComponent, data: {meta: {title: 'Página no encontrada'}}},
]
