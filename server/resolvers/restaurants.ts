import { ObjectId } from 'mongodb'

import { type, resolver, mutation, role } from '../utils'
import { Context, Roles } from '../types'

import { QueryRestaurantArgs, MutationSaveRestaurantArgs } from '../graphql/schema'


@type('Restaurant')
export class RestaurantResolver {
  @resolver()
  static async restaurant(parent: unknown, {id}: QueryRestaurantArgs, {db}: Context) {
    const [user] = await db.collection('restaurants').find({_id: new ObjectId(id)}).toArray()
    console.log(id, user)
    return {...user, id: user._id}
  }

  @resolver()
  @role(Roles.ALL)
  static async myRestaurant(parent: unknown, args: any, {db, uid}: Context) {
    const [user] = await db.collection('restaurants').find({createdBy: uid}).toArray()
    return {...user, id: user._id}
  }

  @mutation()
  static async saveRestaurant(parent: unknown, {restaurant}: MutationSaveRestaurantArgs, {db, uid}: Context) {
    const {modifiedCount} = await db.collection('restaurants')
      .updateOne(
        {createdBy: uid},
        {$set: restaurant},
        {upsert: true},
      )
    return {updated: modifiedCount === 1}
  }
}
