import { Moon, Sun } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Motion.button
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 transition hover:shadow-soft dark:text-slate-100"
      type="button"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </Motion.button>
  )
}

export default ThemeToggle
