import { BarChart3, Home, PlusCircle } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const navItems = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'leads', label: 'Leads', icon: BarChart3 },
  { key: 'create', label: 'Create', icon: PlusCircle },
]

const Sidebar = ({ onAddLead, onNavAction, activeNav, collapsed, onToggleCollapse }) => {
  return (
    <aside className="glass-panel h-full w-full rounded-2xl p-4 lg:p-5">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          {!collapsed ? (
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">LeadForge CRM</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline command center</p>
            </div>
          ) : (
            <p className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">LF</p>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {collapsed ? '>>' : '<<'}
          </button>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeNav === item.key

          return (
            <Motion.button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.key === 'create') {
                  onAddLead()
                  return
                }

                onNavAction?.(item.key)
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * index }}
              className={`card-surface chip-glow flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-sky-400/60 bg-sky-500/10 text-sky-700 dark:border-sky-500/70 dark:bg-sky-500/20 dark:text-sky-200'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon size={16} />
              {!collapsed ? item.label : null}
            </Motion.button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onAddLead}
        className="chip-glow mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
      >
        {collapsed ? '+' : 'Add New Lead'}
      </button>
    </aside>
  )
}

export default Sidebar
