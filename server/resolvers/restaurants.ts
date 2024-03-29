import { ObjectId } from 'mongodb'

import { type, resolver, mutation, role } from '../utils'
import { Context, Roles } from '../types'

import { QueryRestaurantArgs, MutationSaveRestaurantArgs } from '../graphql/schema'

const checkRestaurant = (uid) => (restaurant) => {
  (restaurant.menu.sections || [])
    .forEach((section, i) => {
      delete section.title
      section.section = i
    })

  restaurant.owner = restaurant.createdBy === uid
  restaurant.id = restaurant._id
  return restaurant
}

@type('Restaurant')
export class RestaurantResolver {
  @resolver()
  static async restaurant(parent: unknown, {id}: QueryRestaurantArgs, {db, uid}: Context) {
    const [restaurant] = await db.collection('restaurants').find({_id: new ObjectId(id)}).map(checkRestaurant(uid)).toArray()
    if (!restaurant) {
      return
    }
    return restaurant
  }

  @resolver()
  @role(Roles.ADMIN)
  static async restaurants(parent: unknown, {id}: QueryRestaurantArgs, {db, uid}: Context) {
    const restaurants = await db.collection('restaurants').find().map(checkRestaurant(uid)).toArray()
    if (!restaurants.length) {
      return
    }
    return restaurants
  }

  @resolver()
  static async restaurantsNumber(parent: unknown, args: unknown, {db}: Context) {
    return await db.collection('restaurants').countDocuments()
  }

  @resolver()
  @role(Roles.ALL)
  static async myRestaurant(parent: unknown, args: unknown, {db, uid}: Context) {
    const [restaurant] = await db.collection('restaurants').find({createdBy: uid}).map(checkRestaurant(uid)).toArray()
    if (!restaurant) {
      return
    }
    return restaurant
  }

  @mutation()
  @role(Roles.ALL)
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
