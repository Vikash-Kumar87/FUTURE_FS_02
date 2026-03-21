import { motion as Motion } from 'framer-motion'
import { MessageSquareMore, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { LEAD_STATUSES } from '../../utils/constants'

const statusColor = {
  New: 'bg-slate-100/95 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600',
  Contacted: 'bg-amber-100/90 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-700/30 dark:text-amber-300 dark:ring-amber-700/40',
  Converted: 'bg-emerald-100/90 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-700/30 dark:text-emerald-300 dark:ring-emerald-700/40',
}

const priorityColor = {
  Low: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  Medium: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-800/30 dark:text-amber-300 dark:ring-amber-700/40',
  High: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-800/35 dark:text-rose-300 dark:ring-rose-700/45',
}

const LeadTable = ({ leads, onEdit, onDelete, onStatusChange, onOpenAttachment, onOpenTimeline, canEdit }) => {
  if (!leads.length) {
    return (
      <div className="card-surface rounded-2xl p-8 text-center text-sm text-slate-500 shadow-soft dark:text-slate-300">
        No leads found. Create your first lead to start building your pipeline.
      </div>
    )
  }

  return (
    <div className="card-surface overflow-hidden rounded-2xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-slate-100/80 text-slate-700 backdrop-blur dark:bg-slate-900/70 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Tags</th>
              <th className="px-4 py-3 font-semibold">Timeline</th>
              <th className="px-4 py-3 font-semibold">Files</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <Motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="border-t border-slate-200/70 text-slate-700 transition hover:bg-sky-500/5 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/35"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                </td>
                <td className="px-4 py-3">{lead.source}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={(event) => onStatusChange(lead, event.target.value)}
                    disabled={!canEdit}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[lead.status]} outline-none`}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColor[lead.priority || 'Medium']}`}>
                    {lead.priority || 'Medium'}
                  </span>
                </td>
                <td className="max-w-[220px] px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {(lead.tags || []).length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {lead.tags.map((tag) => (
                        <span
                          key={`${lead.id}-${tag}`}
                          className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No tags'
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onOpenTimeline(lead)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <MessageSquareMore size={12} />
                    {(lead.notes || []).length} notes
                  </button>
                </td>
                <td className="px-4 py-3">
                  {(lead.files || []).length ? (
                    <button
                      type="button"
                      onClick={() => onOpenAttachment(lead)}
                      className="chip-glow rounded-full px-2 py-1 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-300"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Paperclip size={12} />
                        {(lead.files || []).length} files
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(lead)}
                      disabled={!canEdit}
                      className="rounded-lg p-2 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(lead)}
                      disabled={!canEdit}
                      className="rounded-lg p-2 text-slate-500 transition hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </Motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeadTable
