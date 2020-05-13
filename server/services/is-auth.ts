import { AuthenticationError } from 'apollo-server-express'

import { Middleware } from '../utils'
import { Context } from '../types'

export class IsAuthMiddleware implements Middleware {
  static before(a, b, context: Context) {
    // if (!context.user) {
    //   throw new AuthenticationError('Authentication required')
    // }
  }
}
