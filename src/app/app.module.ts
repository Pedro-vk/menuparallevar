import { NgModule, LOCALE_ID } from '@angular/core'
import { CommonModule, registerLocaleData } from '@angular/common'
import localeEs from '@angular/common/locales/es'
import { HttpClientModule } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'
import { AngularFireModule } from '@angular/fire'

import { environment } from '../environments/environment'

import { AppRoutingModule } from './app-routing.module'
import { GraphQLModule } from './graphql.module'
import { AppComponent } from './app.component'

import { landingsComponents } from './+landing'
import { restaurantsComponents } from './+restaurant'
// import { providers } from './shared'

registerLocaleData(localeEs, 'es')

@NgModule({
  declarations: [
    AppComponent,
    ...landingsComponents,
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
    {provide: LOCALE_ID, useValue: 'es'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
