import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Task, HubScheduledEvent } from '../../../../../shared/types'
import { TaskCard } from '@/components/tasks/TaskCard'
import { HubEventCard } from '@/components/animalhub/HubEventCard'
import { CalendarDays } from 'lucide-react'

interface DayDetailProps {
  date: Date | null
  tasks: Task[]
  hubEvents?: HubScheduledEvent[]
}

export function DayDetail({ date, tasks, hubEvents = [] }: DayDetailProps) {
  if (!date) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <CalendarDays className="mb-2 h-10 w-10" />
          <p className="text-sm">Seleziona un giorno</p>
        </div>
      </div>
    )
  }

  const hasContent = tasks.length > 0 || hubEvents.length > 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold capitalize text-foreground">
        {format(date, "EEEE d MMMM", { locale: it })}
      </h3>

      {!hasContent ? (
        <p className="text-sm text-muted-foreground">Nessun task per questo giorno</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <TaskCard key={`${task.id}-${task.occurrenceDate ?? i}`} task={task} compact />
          ))}
          {hubEvents.map((event) => (
            <HubEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
