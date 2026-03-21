import { motion as Motion } from 'framer-motion'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const DashboardLayout = ({ userName, onLogout, onAddLead, onNavAction, activeNav, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <Motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`mx-auto grid min-h-screen w-full max-w-[1240px] grid-cols-1 gap-5 px-3 py-4 sm:px-5 lg:py-6 ${
        sidebarCollapsed ? 'lg:grid-cols-[96px_1fr]' : 'lg:grid-cols-[260px_1fr]'
      }`}
    >
      <Sidebar
        onAddLead={onAddLead}
        onNavAction={onNavAction}
        activeNav={activeNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((previous) => !previous)}
      />
      <div className="space-y-5">
        <Topbar userName={userName} onLogout={onLogout} />
        {children}
      </div>
    </Motion.div>
  )
}

export default DashboardLayout
