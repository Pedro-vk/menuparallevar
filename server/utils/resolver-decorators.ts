import { ForbiddenError } from 'apollo-server-express'

import { Logger } from './logger'
import { Context, Roles } from '../types'

export interface Middleware {
  before?: <P, A, C extends Context, I>(parent: P, args: A, context: C, info: I) => Promise<[P, A, C, I] | void> | [P, A, C, I] | void
  after?: <D>(data: D) => D
}

let usedMiddlewares: Middleware[] = []
const types = new Map()
const queryResolvers = {
  Query: { },
  Mutation: { },
}
const rolesList: {[key: string]: Roles[]} = {}

function typeProxy(target: any, propertyKey: string) {
  return (...args) => new Promise(async (resolve, reject) => {
    try {
      const newArgs = await usedMiddlewares
        .reduce(async (acc, middleware) =>
          await middleware.before?.(...(await acc as [any, any, any, any])) || await acc,
          Promise.resolve(args),
        )

      const [, , context] = newArgs
      const roles = rolesList[target[propertyKey]]
      if (roles && !roles.includes(context.role)) {
        reject(new ForbiddenError(`User doesn't have enough permission`))
        return
      }

      const result = usedMiddlewares
        .reduce((acc, middleware) =>
          middleware.after?.(acc) || acc,
          await target[propertyKey](...newArgs),
        )

      // tslint:disable-next-line
      const __typename = types.get(target)
      if (!result) {
        resolve()
      }
      if (result instanceof Array) {
        resolve(result.map(_ => ({__typename, ..._})))
      }
      if (result instanceof Object) {
        resolve({
          __typename,
          ...result,
        })
      }
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

export function type(name: string) {
  console.log(`Type "${name}" added`)
  return (ctor: any) => {
    types.set(ctor, name)
  }
}

export function resolver(name?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queryResolvers.Query[name || propertyKey] = typeProxy(target, propertyKey)
  }
}
export function mutation(name?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queryResolvers.Mutation[name || propertyKey] = typeProxy(target, propertyKey)
  }
}
export function role(roles: Roles | Roles[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    rolesList[target[propertyKey]] = roles instanceof Array ? roles : [roles]
  }
}

export function relation(childOf: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const path = childOf.match(/^(\w+)\.(\w+)$/i)
    if (!path) {
      Logger.error(`[Relation decorator] Parent path '${childOf}' is not valid.`)
      return
    }
    const [, parent, method] = path
    queryResolvers[parent] = {
      ...(queryResolvers[parent] || {}),
      [method]: typeProxy(target, propertyKey),
    }
  }
}

export function typename(ofUnion: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queryResolvers[ofUnion] = {
      ...(queryResolvers[ofUnion] || {}),
      __resolveType: target[propertyKey],
    }
  }
}

export const getQueryResolvers = (middlewares?: Middleware[]) => {
  usedMiddlewares = middlewares || []
  return queryResolvers
}
