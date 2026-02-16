import { useEffect, useState } from 'react'
import { useTaskStore } from '@/stores/useTaskStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'
import { HubEventCard } from '@/components/animalhub/HubEventCard'
import { Plus, Filter, Bug } from 'lucide-react'
import { format } from 'date-fns'
import type { Priority, TaskStatus } from '../../../../shared/types'

type StatusFilterValue = TaskStatus | 'all' | 'overdue'

export function TasksPage() {
  const { tasks, fetchAllTasks } = useTaskStore()
  const { fetchCategories, fetchTags } = useCategoryStore()
  const { status, todayEvents, missedEvents, fetchStatus, fetchEvents } = useAnimalHubStore()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAllTasks()
    fetchCategories()
    fetchTags()
    fetchStatus()
  }, [fetchAllTasks, fetchCategories, fetchTags, fetchStatus])

  useEffect(() => {
    if (status?.connected) {
      fetchEvents()
    }
  }, [status?.connected, fetchEvents])

  const today = format(new Date(), 'yyyy-MM-dd')

  const filtered = tasks.filter((t) => {
    if (statusFilter === 'overdue') {
      if (t.status === 'completed' || t.status === 'cancelled') return false
      return (t.deadline && t.deadline < today) || (t.scheduledDate && t.scheduledDate < today)
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const isConnected = status?.connected === true
  const hubEvents = [...missedEvents, ...todayEvents]

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <Filter className="h-4 w-4" />
            Filtri
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nuovo Task
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="in_progress">In corso</option>
            <option value="completed">Completati</option>
            <option value="cancelled">Cancellati</option>
            <option value="overdue">Scaduti</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">Tutte le priorità</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Bassa</option>
          </select>
        </div>
      )}

      <TaskList tasks={filtered} />

      {isConnected && hubEvents.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bug className="h-5 w-5 text-teal-500" />
            <h3 className="text-lg font-semibold text-foreground">Husbandry Hub</h3>
          </div>
          <div className="space-y-2">
            {hubEvents.map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            fetchAllTasks()
          }}
        />
      )}
    </div>
  )
}
