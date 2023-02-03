const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('~/config/admin.json');

class FirebaseModule {
  constructor() {
    initializeApp({
      credential: FirebaseAdmin.credential.cert(serviceAccount),
    });
  }
  static getUserPhone({ uid, phone }) {
    return getAuth().getUser(uid);
    // return getAuth().getUserByPhoneNumber(phone);
  }
}

module.exports = FirebaseModule;
