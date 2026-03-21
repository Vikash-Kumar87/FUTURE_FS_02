import { motion as Motion } from 'framer-motion'

const LoadingScreen = ({ message = 'Loading workspace...' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center shadow-soft"
      >
        <Motion.div
          className="mx-auto h-12 w-12 rounded-full border-4 border-slate-200 border-t-sky-500 dark:border-slate-700"
          animate={{ rotate: 360 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.9, ease: 'linear' }}
        />
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-300">{message}</p>
      </Motion.div>
    </div>
  )
}

export default LoadingScreen
