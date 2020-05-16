import { NgModule, LOCALE_ID } from '@angular/core'
import { CommonModule, registerLocaleData } from '@angular/common'
import localeEs from '@angular/common/locales/es'
import { HttpClientModule } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService, DEBUG_MODE } from '@angular/fire/analytics'

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
    FormsModule,

    AngularFireModule.initializeApp(environment.firebase),
    ...(environment.production ? [AngularFireAnalyticsModule] : []),
  ],
  providers: [
    // ...providers,
    // ...pipes,
    ...(environment.production
      ? [
        ScreenTrackingService,
        UserTrackingService,
        {provide: DEBUG_MODE, useValue: !environment.production},
      ]
      : []),
    {provide: LOCALE_ID, useValue: 'es'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
