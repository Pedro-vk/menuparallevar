import * as admin from 'firebase-admin'

export class FirebaseAdmin {
  private static admin

  static getAdmin() {
    if (!this.admin) {
      let credential = admin.credential.applicationDefault()
      if (process.env.FIREBASE_PRIVATE_KEY) {
        credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        })
      }
      this.admin = admin.initializeApp({
        credential,
        databaseURL: 'https://food-nutritional-data-app.firebaseio.com',
      })
    }

    return this.admin
  }
}
