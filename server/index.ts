import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { MongoClient } from 'mongodb'
import * as path from 'path'
import { promises as fs } from 'fs'

import './resolvers'
import { NewUserMiddleware, IsAuthMiddleware, AddRoleMiddleware } from './services'
import { FirebaseAdmin } from './factories'
import { scalar, Logger, LogLevel, getQueryResolvers } from './utils'

(async () => {
  let noFirebaseCredentialsWarn = false

  Logger.setLevel(LogLevel.Log)

  if (!process.env.APOLLO_ENGINE_KEY) {
    Logger.warn('Apollo Engine key not provided')
  }

  const admin = FirebaseAdmin.getAdmin()

  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/llevateloacasa'

  const mongoClient = await MongoClient.connect(mongoUrl, {useUnifiedTopology: true, useNewUrlParser: true})
  const db = mongoClient.db()

  const schema = await fs.readFile(path.join(__dirname, './graphql/schema.graphql'))
  const typeDefs = gql(schema.toString())

  const skipErrors = ['UNAUTHENTICATED', 'FORBIDDEN', 'GRAPHQL_VALIDATION_FAILED']

  const server = new ApolloServer({
    typeDefs,
    plugins: [responseCachePlugin({
      extraCacheKeyData: ({context}) => `logged:${!!context.user}`
    })],
    resolvers: {
      ...getQueryResolvers([NewUserMiddleware, IsAuthMiddleware, AddRoleMiddleware]),
      ...scalar,
    },
    context: async ({req}) => {
      const token = req.headers.authorization || ''

      try {
        const user = await admin.auth()
          .verifyIdToken(token)
          .catch(() => {})
        if (token.length && !user && !noFirebaseCredentialsWarn) {
          // export GOOGLE_APPLICATION_CREDENTIALS
          Logger.warn('Check if Firebase credentials are defined')
          noFirebaseCredentialsWarn = true
        }
        if (user) {
          return {db, user, uid: user.uid}
        }
      } catch { }
      return {db}
    },
    engine: {
      apiKey: process.env.APOLLO_ENGINE_KEY,
      schemaTag: process.env.APOLLO_ENGINE_ENV || 'development',
      rewriteError: e => {
        if (!skipErrors.includes(e?.extensions?.code)) {
          Logger.error(e?.extensions?.exception.stacktrace[0] || e)
          return e
        }
        Logger.debug(e.message)
        return null
      },
    },
    formatError: e => {
      if (e?.extensions && !skipErrors.includes(e?.extensions?.code)) {
        return new Error('Internal server error')
      }
      return {message: e.message}
    },
  })

  const app = express()

  const prerender = require('prerender-node')
    .set('prerenderToken', process.env.PRERENDER_TOKEN)
    .set('protocol', 'https')
  prerender.crawlerUserAgents.push(...'facebookexternalhit|Twitterbot|Pinterest|linkedinbot|WhatsApp'.split('|'))
  app.use(prerender)

  server.applyMiddleware({app})

  const distFolder = '/../dist'

  app.use(express.static(__dirname + distFolder))

  const index = path.join(__dirname, distFolder, '/index.html')
  app.get('/', (req, res) => {
    res.sendFile(index)
  })
  app.all('/*', (req, res) => {
    res.sendFile(index)
  })

  app.listen(process.env.PORT || 8080, () => console.log('App listening!'))
})()
