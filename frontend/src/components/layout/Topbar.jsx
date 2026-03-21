import { LogOut } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'

const Topbar = ({ userName, onLogout }) => {
  return (
    <header className="glass-panel flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 lg:text-3xl">Lead Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Welcome back, {userName || 'Team Member'}.</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/50 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </header>
  )
}

export default Topbar
