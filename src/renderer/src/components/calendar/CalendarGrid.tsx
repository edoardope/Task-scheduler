import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay
} from 'date-fns'
import { it } from 'date-fns/locale'
import { useCalendarStore } from '@/stores/useCalendarStore'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import type { Task, HubScheduledEvent } from '../../../../../shared/types'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

interface CalendarGridProps {
  tasks: Task[]
}

function getTasksForDay(tasks: Task[], day: Date) {
  const dateStr = format(day, 'yyyy-MM-dd')
  return tasks.filter(
    (t) =>
      t.scheduledDate === dateStr || t.deadline === dateStr || t.occurrenceDate === dateStr
  )
}

function getHubEventsForDay(events: HubScheduledEvent[], day: Date) {
  const dateStr = format(day, 'yyyy-MM-dd')
  return events.filter((e) => e.nextDueDate === dateStr)
}

export function CalendarGrid({ tasks }: CalendarGridProps) {
  const { currentDate, selectedDate, selectDate } = useCalendarStore()
  const { allEvents } = useAnimalHubStore()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium uppercase text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayTasks = getTasksForDay(tasks, day)
          const dayHubEvents = getHubEventsForDay(allEvents, day)
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const selected = selectedDate ? isSameDay(day, selectedDate) : false
          const hasOverdue = dayTasks.some(
            (t) =>
              t.deadline === format(day, 'yyyy-MM-dd') &&
              t.status !== 'completed' &&
              !t.isCompleted &&
              day < new Date()
          )

          return (
            <button
              key={day.toISOString()}
              onClick={() => selectDate(day)}
              className={cn(
                'relative min-h-[80px] border-b border-r border-border p-1.5 text-left transition-colors hover:bg-accent/50',
                !inMonth && 'bg-muted/30 text-muted-foreground',
                selected && 'bg-primary/5 ring-2 ring-primary ring-inset'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  today && 'bg-primary text-primary-foreground',
                  !today && inMonth && 'text-foreground',
                  !today && !inMonth && 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Task and Hub event dots */}
              {(dayTasks.length > 0 || dayHubEvents.length > 0) && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 3).map((task, i) => {
                    const isComplete =
                      task.status === 'completed' || task.isCompleted
                    return (
                      <span
                        key={`task-${task.id}-${i}`}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isComplete
                            ? 'bg-emerald-500'
                            : hasOverdue
                              ? 'bg-red-500'
                              : 'bg-primary'
                        )}
                        style={
                          !isComplete && task.categoryColor
                            ? { backgroundColor: task.categoryColor }
                            : undefined
                        }
                      />
                    )
                  })}
                  {dayHubEvents.slice(0, 4 - dayTasks.length).map((event, i) => (
                    <span
                      key={`hub-${event.id}-${i}`}
                      className="h-1.5 w-1.5 rounded-full bg-teal-500"
                    />
                  ))}
                  {dayTasks.length + dayHubEvents.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{dayTasks.length + dayHubEvents.length - 4}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
