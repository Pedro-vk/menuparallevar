
import { Middleware } from '../utils'
import { Context } from '../types'

export class NewUserMiddleware implements Middleware {
  static usedUid: string[] = []

  static async before(a, b, {uid, db, user}: Context) {
    if (!uid || !user) {
      return
    }

    const exsists = db.collection('user').find({_id: uid})

    if (!this.usedUid.includes(uid) && !await exsists.count()) {
      await db.collection('user')
        .insertOne({
          _id: uid,
          createdAt: new Date(),
          name: user.name,
          picture: user.picture,
          email: user.email,
          uid: user.uid,
        })
    }
    this.usedUid.push(uid)
  }
}
