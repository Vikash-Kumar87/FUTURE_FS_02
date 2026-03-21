import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 text-center"
      >
        <p className="font-display text-4xl font-bold gradient-text">404</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The page you are looking for is not available.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </Link>
      </Motion.div>
    </div>
  )
}

export default NotFoundPage
