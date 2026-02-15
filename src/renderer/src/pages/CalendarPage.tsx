import { useEffect } from 'react'
import { useCalendarStore } from '@/stores/useCalendarStore'
import { useTaskStore } from '@/stores/useTaskStore'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format
} from 'date-fns'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { DayDetail } from '@/components/calendar/DayDetail'

export function CalendarPage() {
  const { currentDate, selectedDate } = useCalendarStore()
  const { fetchTasksForRange, tasks } = useTaskStore()

  useEffect(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    fetchTasksForRange(format(gridStart, 'yyyy-MM-dd'), format(gridEnd, 'yyyy-MM-dd'))
  }, [currentDate, fetchTasksForRange])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <CalendarHeader />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CalendarGrid tasks={tasks} />
        </div>
        <div>
          <DayDetail
            date={selectedDate}
            tasks={tasks.filter((t) => {
              if (!selectedDate) return false
              const dateStr = format(selectedDate, 'yyyy-MM-dd')
              return (
                t.scheduledDate === dateStr ||
                t.deadline === dateStr ||
                t.occurrenceDate === dateStr
              )
            })}
          />
        </div>
      </div>
    </div>
  )
}
