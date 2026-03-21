import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = location.state?.from?.pathname || '/dashboard'

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const result = await loginWithGoogle()

      if (result) {
        toast.success('Signed in with Google')
        navigate(redirectPath, { replace: true })
      } else {
        toast.success('Redirecting to Google...')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-soft"
      >
        <p className="font-display text-3xl font-bold gradient-text">LeadForge CRM</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Sign in to manage your leads and conversions.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
          />
          <input
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="chip-glow w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-3 py-2 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-sky-600"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-300">
          New here?{' '}
          <Link className="font-semibold text-sky-600 dark:text-sky-300" to="/signup">
            Create account
          </Link>
        </p>
      </Motion.div>
    </div>
  )
}

export default LoginPage
