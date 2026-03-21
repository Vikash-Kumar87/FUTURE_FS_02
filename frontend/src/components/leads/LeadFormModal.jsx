import { useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES, LEAD_TAG_OPTIONS } from '../../utils/constants'

const emptyLead = {
  name: '',
  email: '',
  source: LEAD_SOURCES[0],
  status: LEAD_STATUSES[0],
  priority: LEAD_PRIORITIES[1],
  tags: [],
  notes: '',
}

const LeadFormModal = ({ isOpen, initialLead, onClose, onSubmit, submitting, canEdit }) => {
  const [formData, setFormData] = useState(emptyLead)
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData(
      initialLead
        ? {
            name: initialLead.name || '',
            email: initialLead.email || '',
            source: initialLead.source || LEAD_SOURCES[0],
            status: initialLead.status || LEAD_STATUSES[0],
            priority: initialLead.priority || LEAD_PRIORITIES[1],
            tags: initialLead.tags || [],
            notes: typeof initialLead.notes === 'string' ? initialLead.notes : '',
          }
        : emptyLead,
    )
    setFile(null)
  }, [initialLead, isOpen])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleTagsToggle = (tag) => {
    setFormData((previous) => {
      const hasTag = previous.tags.includes(tag)

      return {
        ...previous,
        tags: hasTag ? previous.tags.filter((item) => item !== tag) : [...previous.tags, tag],
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(formData, file)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 py-8"
        >
          <Motion.form
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="card-surface w-full max-w-2xl space-y-4 rounded-2xl p-5 shadow-soft md:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                {initialLead ? 'Update Lead' : 'Create New Lead'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                Name
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                Source
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                Priority
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  {LEAD_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2 text-sm text-slate-600 dark:text-slate-300">
              Tags
              <div className="flex flex-wrap gap-2">
                {LEAD_TAG_OPTIONS.map((tag) => {
                  const active = formData.tags.includes(tag)

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagsToggle(tag)}
                      disabled={!canEdit}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </label>

            <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
              Initial note
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={!canEdit}
                rows={4}
                className="w-full rounded-xl border border-slate-300/60 bg-white/85 px-3 py-2 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900/70"
              />
            </label>

            <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
              Attachment (PDF, Image, or Document)
              <input
                type="file"
                accept="application/pdf,image/*,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                disabled={!canEdit}
                className="block w-full text-sm text-slate-500"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !canEdit}
                className="chip-glow rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Saving...' : initialLead ? 'Update Lead' : 'Create Lead'}
              </button>
            </div>
          </Motion.form>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default LeadFormModal
