import { NgModule } from '@angular/core'
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http'
import { setContext } from 'apollo-link-context'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { AngularFireAuth } from '@angular/fire/auth'
import { first } from 'rxjs/operators'

import { default as introspectionQueryResultData } from './shared/graphql-fragments'

const uri = '/graphql'
export function createApollo(httpLink: HttpLink, fireAuth: AngularFireAuth) {
  const basic = setContext((operation, context) => ({
    headers: {
      Accept: 'charset=utf-8'
    }
  }))

  const auth = setContext(async (_, {headers}) => {
    const token = await fireAuth
      .user
      .pipe(first())
      .toPromise()
      .then(user => user?.getIdToken())

    if (!token) {
      return {}
    }
    return {
      headers: {
        authorization: token,
      },
    }
  })

  const link = ApolloLink.from([basic, auth, httpLink.create({uri})])

  return {
    link,
    cache: new InMemoryCache({
      addTypename: false,
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData
      })
    }),
  }
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, AngularFireAuth],
    },
  ],
})
export class GraphQLModule {}
