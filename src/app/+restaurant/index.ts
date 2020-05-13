import { Routes } from '@angular/router'

import { EditComponent } from './edit/edit.component'
import { ViewComponent } from './view/view.component'

export const restaurantsComponents = [
  EditComponent,
  ViewComponent,
]

export const restaurantRoutes: Routes = [
  {path: 'edit', component: EditComponent},
  {path: ':id', component: ViewComponent},
]
