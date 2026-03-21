import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import LeadFilters from '../components/leads/LeadFilters'
import LeadFormModal from '../components/leads/LeadFormModal'
import LeadTable from '../components/leads/LeadTable'
import StatsCards from '../components/leads/StatsCards'
import DashboardSkeleton from '../components/common/DashboardSkeleton'
import { useAuth } from '../context/AuthContext'
import { leadService } from '../services/leadService'

const AnalyticsPanel = lazy(() => import('../components/leads/AnalyticsPanel'))
const LeadTimelineModal = lazy(() => import('../components/leads/LeadTimelineModal'))

const DashboardPage = () => {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [timelineLead, setTimelineLead] = useState(null)
  const [activeNav, setActiveNav] = useState('overview')
  const { user, role, getToken, logout } = useAuth()
  const navigate = useNavigate()
  const overviewRef = useRef(null)
  const leadsRef = useRef(null)
  const canEdit = role !== 'viewer'

  const userName = useMemo(() => user?.displayName || user?.email?.split('@')[0], [user])

  const fetchLeads = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true)
      }

      await leadService.initializeMode()
      const token = await getToken()
      const data = await leadService.getLeads({ token, search, status, priority, tag })
      setLeads(data)
    } catch (error) {
      toast.error(error?.message || 'Failed to load leads', { id: 'leads-load-error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, tag])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCreateOrUpdate = async (payload, file) => {
    if (!canEdit) {
      toast.error('Viewer role cannot modify leads')
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken()

      let lead
      if (editingLead) {
        lead = await leadService.updateLead({ token, id: editingLead.id, payload })
      } else {
        lead = await leadService.createLead({ token, payload })
      }

      if (file && lead?.id) {
        try {
          await leadService.uploadAttachment({ token, id: lead.id, file })
        } catch {
          toast.error('Lead saved, but attachment upload failed')
        }
      }

      toast.success(editingLead ? 'Lead updated successfully' : 'Lead created successfully')
      setShowModal(false)
      setEditingLead(null)
      await fetchLeads({ showLoader: false })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLead = async (lead) => {
    if (!canEdit) {
      toast.error('Viewer role cannot delete leads')
      return
    }

    const confirmed = window.confirm(`Delete lead ${lead.name}?`)

    if (!confirmed) {
      return
    }

    try {
      const token = await getToken()
      await leadService.deleteLead({ token, id: lead.id })
      toast.success('Lead deleted')
      await fetchLeads({ showLoader: false })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleQuickStatusChange = async (lead, nextStatus) => {
    if (!canEdit) {
      toast.error('Viewer role cannot update status')
      return
    }

    if (lead.status === nextStatus) {
      return
    }

    try {
      const token = await getToken()
      await leadService.updateLead({
        token,
        id: lead.id,
        payload: {
          status: nextStatus,
          name: lead.name,
          email: lead.email,
          source: lead.source,
          priority: lead.priority || 'Medium',
        },
      })
      await fetchLeads({ showLoader: false })
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOpenAttachment = async (lead) => {
    const latest = [...(lead.files || [])].sort(
      (left, right) => new Date(right.uploadedAt || 0).getTime() - new Date(left.uploadedAt || 0).getTime(),
    )[0]

    if (latest?.url) {
      window.open(latest.url, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      const token = await getToken()
      const { blob } = await leadService.downloadAttachment({ token, id: lead.id })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error(error?.message || 'Failed to open attachment')
    }
  }

  const handleAddNote = async (text) => {
    if (!timelineLead) {
      return
    }

    if (!canEdit) {
      toast.error('Viewer role cannot add notes')
      return
    }

    try {
      setAddingNote(true)
      const token = await getToken()
      await leadService.addNote({ token, id: timelineLead.id, text })
      toast.success('Note added')
      await fetchLeads({ showLoader: false })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAddingNote(false)
    }
  }

  const handleExportCsv = async () => {
    try {
      setExporting(true)
      const token = await getToken()
      const { blob, fileName } = await leadService.exportCsv({ token })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName || 'leads.csv'
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
      toast.success('CSV export ready')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setExporting(false)
    }
  }

  const scrollToSection = (ref, key) => {
    if (!ref?.current) {
      return
    }

    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(key)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardLayout
      userName={userName}
      onLogout={handleLogout}
      onAddLead={() => {
        setEditingLead(null)
        setShowModal(true)
        setActiveNav('create')
      }}
      onNavAction={(key) => {
        if (key === 'overview') {
          scrollToSection(overviewRef, 'overview')
          return
        }

        if (key === 'leads') {
          scrollToSection(leadsRef, 'leads')
        }
      }}
      activeNav={activeNav}
    >
      <section ref={overviewRef}>
        <StatsCards leads={leads} />
      </section>

      <Suspense fallback={<div className="card-surface animate-pulse rounded-2xl p-6" />}>
        <AnalyticsPanel leads={leads} />
      </Suspense>

      <section ref={leadsRef} className="space-y-4">
        <LeadFilters
          search={search}
          status={status}
          priority={priority}
          tag={tag}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onTagChange={setTag}
          onExport={handleExportCsv}
          exportLoading={exporting}
        />
        <LeadTable
          leads={leads}
          onEdit={(lead) => {
            setEditingLead(lead)
            setShowModal(true)
            setActiveNav('create')
          }}
          onDelete={handleDeleteLead}
          onStatusChange={handleQuickStatusChange}
          onOpenAttachment={handleOpenAttachment}
          onOpenTimeline={(lead) => setTimelineLead(lead)}
          canEdit={canEdit}
        />
      </section>

      <LeadFormModal
        isOpen={showModal}
        initialLead={editingLead}
        onClose={() => {
          setShowModal(false)
          setEditingLead(null)
        }}
        onSubmit={handleCreateOrUpdate}
        submitting={submitting}
        canEdit={canEdit}
      />

      <Suspense fallback={null}>
        <LeadTimelineModal
          lead={timelineLead}
          isOpen={Boolean(timelineLead)}
          onClose={() => setTimelineLead(null)}
          onAddNote={handleAddNote}
          addingNote={addingNote}
          canEdit={canEdit}
        />
      </Suspense>
    </DashboardLayout>
  )
}

export default DashboardPage
