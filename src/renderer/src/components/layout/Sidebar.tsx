import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, ListTodo, Settings, Zap, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'Ctrl+1' },
  { to: '/calendar', icon: Calendar, label: 'Calendario', shortcut: 'Ctrl+2' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks', shortcut: 'Ctrl+3' },
  { to: '/settings', icon: Settings, label: 'Impostazioni', shortcut: 'Ctrl+4' }
]

export function Sidebar() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  function toggleDarkMode() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Zap className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold text-foreground">Task Scheduler</h1>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            <span className="text-[10px] text-muted-foreground/60">{item.shortcut}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {isDark ? 'Tema Chiaro' : 'Tema Scuro'}
        </button>
      </div>
    </aside>
  )
}
