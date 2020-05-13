import { Routes } from '@angular/router'

import { EditComponent } from './edit/edit.component'

export const builderComponents = [
  EditComponent,
]

export const restaurantRoutes: Routes = [
  {path: 'edit', component: EditComponent},
]
