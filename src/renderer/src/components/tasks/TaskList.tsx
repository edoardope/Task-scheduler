import type { Task } from '../../../../../shared/types'
import { TaskCard } from './TaskCard'
import { ClipboardList } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16 text-muted-foreground">
        <ClipboardList className="mb-3 h-12 w-12" />
        <p className="text-sm">Nessun task trovato</p>
        <p className="text-xs">Crea un nuovo task per iniziare</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <TaskCard key={`${task.id}-${task.occurrenceDate ?? i}`} task={task} />
      ))}
    </div>
  )
}
