import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signup } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await signup(email, password)
      toast.success('Account created successfully')
      navigate('/dashboard', { replace: true })
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
        <p className="font-display text-3xl font-bold gradient-text">Create account</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Start tracking leads with a clean, modern workflow.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300/70 bg-white/80 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="chip-glow w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-3 py-2 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-300">
          Already registered?{' '}
          <Link className="font-semibold text-sky-600 dark:text-sky-300" to="/login">
            Sign in
          </Link>
        </p>
      </Motion.div>
    </div>
  )
}

export default SignupPage
