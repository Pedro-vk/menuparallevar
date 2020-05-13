import { NgModule, Injectable } from '@angular/core'
import { Routes, RouterModule, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

const routes: Routes = [
  {path: '', canActivateChild: [], children: [

  ]},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
