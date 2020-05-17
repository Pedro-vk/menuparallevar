import { type, resolver, role, mutation } from '../utils'
import { Context, Roles } from '../types'

@type('User')
export class UserResolver {
  @resolver()
  @role(Roles.ALL)
  static async user(parent: unknown, args: unknown, {db, uid}: Context) {
    const [user] = await db.collection('user').find({_id: uid}).toArray()
    return user
  }

  @mutation()
  @role(Roles.ALL)
  static async removeUserData(parent: unknown, args: unknown, {db, uid}: Context) {
    if (uid) {
      await db.collection('user').remove({_id: uid})
      await db.collection('restaurants').remove({createdBy: uid})
      return true
    }
    return false
  }
}
