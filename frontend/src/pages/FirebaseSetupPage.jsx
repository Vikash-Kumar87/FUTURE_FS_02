import { motion as Motion } from 'framer-motion'

const FirebaseSetupPage = ({ missingKeys = [] }) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-soft"
      >
        <p className="font-display text-3xl font-bold gradient-text">Firebase Setup Required</p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          App is running, but Firebase credentials are missing. Add your environment values and restart the frontend dev server.
        </p>

        <div className="mt-5 rounded-2xl border border-amber-300/50 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Missing environment keys</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {missingKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-300/60 bg-white/80 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          <p className="font-semibold">Fix steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Copy frontend/.env.example to frontend/.env</li>
            <li>Paste Firebase project values in all VITE_FIREBASE_* keys</li>
            <li>Restart frontend server (npm run dev)</li>
          </ol>
        </div>
      </Motion.div>
    </div>
  )
}

export default FirebaseSetupPage
