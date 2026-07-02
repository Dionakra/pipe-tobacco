import {
  initializeApp,
  getApp,
  getApps,
} from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBj0q5BxSQCtfGZ4VrwctoWEwoxt53fxI4',
  authDomain: 'pipa-cd25f.firebaseapp.com',
  projectId: 'pipa-cd25f',
  storageBucket: 'pipa-cd25f.firebasestorage.app',
  messagingSenderId: '662852728310',
  appId: '1:662852728310:web:b3362c4e25ac77f23bc3d7',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
export const appleProvider = new OAuthProvider('apple.com')
