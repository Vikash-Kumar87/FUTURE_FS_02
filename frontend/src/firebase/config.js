import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCBSNaS4qfynR0hxIL-4n-EFd6Vk81Uzuk',
  authDomain: 'crm1-5ef94.firebaseapp.com',
  projectId: 'crm1-5ef94',
  storageBucket: 'crm1-5ef94.firebasestorage.app',
  messagingSenderId: '497264970809',
  appId: '1:497264970809:web:a91602f6993a4e09ff91e8',
  measurementId: 'G-TG2SLPHFNS',
}

const missingFirebaseEnvKeys = []
const isFirebaseConfigured = true

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export { app, auth, db, storage, googleProvider, isFirebaseConfigured, missingFirebaseEnvKeys }
