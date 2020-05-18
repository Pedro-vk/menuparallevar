import { Routes } from '@angular/router'

import { RestaurantResolverService } from 'src/app/shared'

import { EditComponent } from './edit/edit.component'
import { ViewComponent } from './view/view.component'

export const restaurantsComponents = [
  EditComponent,
  ViewComponent,
]

export const restaurantRoutes: Routes = [
  {path: 'mi-restaurante', component: EditComponent, data: {meta: {title: 'Mi restaurante'}}},
  {
    path: 'mi-restaurante/vista-previa',
    component: ViewComponent,
    resolve: {restaurant: RestaurantResolverService},
    data: {restaurant: 'own'},
  },
  {path: ':id', component: ViewComponent, resolve: {restaurant: RestaurantResolverService}},
]
