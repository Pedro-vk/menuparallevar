
import { Middleware } from '../utils'
import { Context, Roles } from '../types'

export class AddRoleMiddleware implements Middleware {
  static async before(a, b, context: Context, d) {
    const {uid, db} = context
    if (uid) {
      const [dbUser] = await db.collection('user').find({_id: uid}).toArray()
      context.role = +Roles[dbUser.role] ?? Roles.FREE
    }
    return [a, b, context, d] as any
  }
}
