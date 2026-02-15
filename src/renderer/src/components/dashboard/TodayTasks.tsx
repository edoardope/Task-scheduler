import type { Task } from '../../../../../shared/types'
import { TaskCard } from '@/components/tasks/TaskCard'
import { ClipboardList } from 'lucide-react'

interface TodayTasksProps {
  tasks: Task[]
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Task di oggi</h3>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <ClipboardList className="mb-2 h-10 w-10" />
          <p className="text-sm">Nessun task per oggi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <TaskCard key={`${task.id}-${task.occurrenceDate ?? i}`} task={task} compact />
          ))}
        </div>
      )}
    </div>
  )
}
