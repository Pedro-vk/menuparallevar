import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'
import { AngularFireModule } from '@angular/fire'

import { environment } from '../environments/environment'

import { AppRoutingModule } from './app-routing.module'
import { GraphQLModule } from './graphql.module'
import { AppComponent } from './app.component'

import { restaurantsComponents } from './+restaurant'
// import { providers } from './shared'

@NgModule({
  declarations: [
    AppComponent,
    ...restaurantsComponents,
  ],
  imports: [
    AppRoutingModule,
    GraphQLModule,

    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,

    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    // ...providers,
    // ...pipes,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
