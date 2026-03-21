import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import { authService } from '../services/authService'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('admin')

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (!currentUser) {
        setRole('admin')
        return
      }

      currentUser
        .getIdTokenResult()
        .then((result) => {
          const claimRole = String(result?.claims?.role || '').toLowerCase()
          setRole(claimRole === 'viewer' ? 'viewer' : 'admin')
        })
        .catch(() => {
          setRole('admin')
        })
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      login: authService.login,
      signup: authService.signup,
      loginWithGoogle: authService.loginWithGoogle,
      logout: authService.logout,
      getToken: async () => {
        if (!auth || !auth.currentUser) {
          return null
        }

        return auth.currentUser.getIdToken()
      },
    }),
    [user, role, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
