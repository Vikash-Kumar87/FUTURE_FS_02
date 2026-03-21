import { LEAD_PRIORITIES, LEAD_STATUSES, LEAD_TAG_OPTIONS } from '../../utils/constants'

const LeadFilters = ({
  search,
  status,
  priority,
  tag,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onExport,
  exportLoading,
}) => {
  return (
    <section className="glass-panel grid gap-3 rounded-2xl p-4 md:grid-cols-2 xl:grid-cols-5 md:p-5">
      <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        Search by name, email, source
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search leads..."
          className="w-full rounded-xl border border-slate-300/60 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        Filter by status
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300/60 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        Filter by priority
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300/60 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        >
          <option value="">All Priorities</option>
          {LEAD_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        Filter by tag
        <select
          value={tag}
          onChange={(event) => onTagChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300/60 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        >
          <option value="">All Tags</option>
          {LEAD_TAG_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onExport}
          disabled={exportLoading}
          className="chip-glow w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
    </section>
  )
}

export default LeadFilters
