import { type, resolver, relation } from '../utils'
import { Context } from '../types'

@type('User')
export class UserResolver {
  @resolver()
  static async user(parent: unknown, args: unknown, {db, uid}: Context) {
    const [user] = await db.collection('user').find({_id: uid}).toArray()
    return user
  }
}
