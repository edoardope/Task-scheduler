import { useEffect, useCallback, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TaskForm } from '@/components/tasks/TaskForm'
import { useTaskStore } from '@/stores/useTaskStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

export function AppShell() {
  const navigate = useNavigate()
  const { fetchAllTasks } = useTaskStore()
  const { fetchCategories, fetchTags } = useCategoryStore()
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            navigate('/dashboard')
            break
          case '2':
            e.preventDefault()
            navigate('/calendar')
            break
          case '3':
            e.preventDefault()
            navigate('/tasks')
            break
          case '4':
            e.preventDefault()
            navigate('/settings')
            break
          case 'n':
            e.preventDefault()
            fetchCategories()
            fetchTags()
            setShowQuickAdd(true)
            break
        }
      }
    },
    [navigate, fetchCategories, fetchTags]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-6">
        <Outlet />
      </main>
      {showQuickAdd && (
        <TaskForm
          onClose={() => setShowQuickAdd(false)}
          onSaved={() => {
            setShowQuickAdd(false)
            fetchAllTasks()
          }}
        />
      )}
    </div>
  )
}
