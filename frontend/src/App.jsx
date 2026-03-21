import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/common/ProtectedRoute'
import { isFirebaseConfigured, missingFirebaseEnvKeys } from './firebase/config'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const FirebaseSetupPage = lazy(() => import('./pages/FirebaseSetupPage'))

function App() {
  if (!isFirebaseConfigured) {
    return (
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading setup...</div>}>
        <FirebaseSetupPage missingKeys={missingFirebaseEnvKeys} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading app...</div>}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
