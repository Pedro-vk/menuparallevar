import { Db } from 'mongodb'

export interface Context {
  uid?: string,
  db: Db
  user?: {
    name: string
    uid: string
    email: string
    picture: string
  }
  role?: Roles // Provided by Middleware
}

export enum Roles {
  ALL,
}
