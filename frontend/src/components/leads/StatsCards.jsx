import { motion as Motion } from 'framer-motion'
import { BarChart, CheckCircle2, Users2 } from 'lucide-react'

const StatsCards = ({ leads }) => {
  const total = leads.length
  const contacted = leads.filter((lead) => lead.status === 'Contacted').length
  const converted = leads.filter((lead) => lead.status === 'Converted').length
  const conversionRate = total ? `${((converted / total) * 100).toFixed(1)}%` : '0.0%'

  const cards = [
    { label: 'Total Leads', value: total, icon: Users2 },
    { label: 'Contacted', value: contacted, icon: BarChart },
    { label: 'Converted', value: converted, icon: CheckCircle2 },
    { label: 'Conversion Rate', value: conversionRate, icon: CheckCircle2 },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <Motion.article
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            className="card-surface rounded-2xl p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <Icon size={18} className="text-sky-500" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
          </Motion.article>
        )
      })}
    </div>
  )
}

export default StatsCards
