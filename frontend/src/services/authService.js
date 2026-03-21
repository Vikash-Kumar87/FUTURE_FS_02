import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config'

const ensureFirebaseConfigured = () => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Add your VITE_FIREBASE_* values in frontend/.env.')
  }
}

const mapAuthError = (error) => {
  const code = String(error?.code || '')

  if (code === 'auth/popup-blocked') {
    return 'Popup was blocked by browser. Please allow popups and try again.'
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing login.'
  }

  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase Auth. Add localhost to Authorized domains in Firebase Console.'
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is disabled in Firebase Console. Enable Google provider in Authentication > Sign-in method.'
  }

  return error?.message || 'Authentication failed'
}

export const authService = {
  signup: (email, password) => {
    ensureFirebaseConfigured()
    return createUserWithEmailAndPassword(auth, email, password)
  },
  login: (email, password) => {
    ensureFirebaseConfigured()
    return signInWithEmailAndPassword(auth, email, password)
  },
  loginWithGoogle: async () => {
    ensureFirebaseConfigured()

    if (!googleProvider) {
      throw new Error('Google provider is not initialized. Check Firebase config and retry.')
    }

    try {
      return await signInWithPopup(auth, googleProvider)
    } catch (error) {
      const code = String(error?.code || '')

      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider)
        return null
      }

      throw new Error(mapAuthError(error))
    }
  },
  logout: () => {
    ensureFirebaseConfigured()
    return signOut(auth)
  },
}
