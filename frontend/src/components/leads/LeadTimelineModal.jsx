import { useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

const byCreatedAtDesc = (left, right) => {
  const leftTime = new Date(left.createdAt || 0).getTime()
  const rightTime = new Date(right.createdAt || 0).getTime()
  return rightTime - leftTime
}

const LeadTimelineModal = ({ lead, isOpen, onClose, onAddNote, addingNote, canEdit }) => {
  const [noteText, setNoteText] = useState('')

  const timeline = useMemo(() => {
    if (!lead) {
      return []
    }

    const base = [
      {
        id: `created-${lead.id}`,
        type: 'created',
        message: `Lead created (${lead.status})`,
        createdAt: lead.createdAt,
        createdBy: lead.userId || 'system',
      },
      ...(lead.activity || []),
      ...(lead.notes || []).map((note) => ({
        id: `note-${note.id}`,
        type: 'note',
        message: note.text,
        createdAt: note.createdAt,
        createdBy: note.createdBy,
      })),
    ]

    return base.filter((item) => item.createdAt).sort(byCreatedAtDesc)
  }, [lead])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const text = noteText.trim()

    if (!text) {
      return
    }

    await onAddNote(text)
    setNoteText('')
  }

  return (
    <AnimatePresence>
      {isOpen && lead ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
        >
          <Motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="card-surface max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">{lead.name} timeline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Activity log and notes</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
                {timeline.length ? (
                  timeline.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <p className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">{event.type}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.message}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })} by {event.createdBy || 'system'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-l border-slate-200 p-5 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Add note</h4>
                <textarea
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  rows={5}
                  disabled={!canEdit}
                  placeholder={canEdit ? 'Add context, follow-ups, and next actions...' : 'Viewer role cannot add notes'}
                  className="mt-3 w-full rounded-xl border border-slate-300/60 bg-white/90 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900/70"
                />
                <button
                  type="submit"
                  disabled={addingNote || !canEdit}
                  className="chip-glow mt-3 w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {addingNote ? 'Adding note...' : 'Add note'}
                </button>

                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Files</h4>
                  {(lead.files || []).length ? (
                    lead.files.map((file) => (
                      <div key={file.id} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                        <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{file.fileName}</p>
                        <div className="mt-1 flex gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-300"
                          >
                            Preview
                          </a>
                          <a
                            href={file.url}
                            download={file.fileName}
                            className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-300"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No files uploaded.</p>
                  )}
                </div>
              </form>
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default LeadTimelineModal
