import { useMemo } from 'react'
import { startOfWeek, subWeeks, format } from 'date-fns'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const SOURCE_COLORS = ['#0ea5e9', '#06b6d4', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444']

const AnalyticsPanel = ({ leads }) => {
  const metrics = useMemo(() => {
    const total = leads.length
    const contacted = leads.filter((lead) => lead.status === 'Contacted').length
    const converted = leads.filter((lead) => lead.status === 'Converted').length
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0'

    const weekBuckets = Array.from({ length: 6 }).map((_, index) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 5 - index), { weekStartsOn: 1 })
      return {
        weekStart,
        label: format(weekStart, 'dd MMM'),
        leads: 0,
      }
    })

    for (const lead of leads) {
      if (!lead.createdAt) {
        continue
      }

      const created = new Date(lead.createdAt)

      for (const bucket of weekBuckets) {
        const bucketStart = bucket.weekStart
        const bucketEnd = new Date(bucketStart)
        bucketEnd.setDate(bucketEnd.getDate() + 7)

        if (created >= bucketStart && created < bucketEnd) {
          bucket.leads += 1
          break
        }
      }
    }

    const sourceMap = new Map()

    for (const lead of leads) {
      const key = lead.source || 'Other'
      sourceMap.set(key, (sourceMap.get(key) || 0) + 1)
    }

    const sourceData = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }))

    return {
      total,
      contacted,
      converted,
      conversionRate,
      weeklyData: weekBuckets.map((bucket) => ({ label: bucket.label, leads: bucket.leads })),
      sourceData,
    }
  }, [leads])

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="card-surface rounded-2xl p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Weekly Lead Growth</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Conversion rate {metrics.conversionRate}%</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/50">Total: {metrics.total}</div>
          <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/50">Contacted: {metrics.contacted}</div>
          <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/50">Converted: {metrics.converted}</div>
          <div className="rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/50">Conversion: {metrics.conversionRate}%</div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.weeklyData}>
              <defs>
                <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.24)" />
              <XAxis dataKey="label" stroke="rgba(100,116,139,0.8)" fontSize={12} />
              <YAxis stroke="rgba(100,116,139,0.8)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="leads" stroke="#0ea5e9" fill="url(#weeklyGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card-surface rounded-2xl p-5 shadow-soft">
        <h3 className="mb-3 font-display text-lg font-bold text-slate-900 dark:text-slate-100">Lead Source Mix</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={metrics.sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={96} label>
                {metrics.sourceData.map((entry, index) => (
                  <Cell key={`${entry.name}-${entry.value}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  )
}

export default AnalyticsPanel
