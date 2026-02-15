import { useCalendarStore } from '@/stores/useCalendarStore'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarHeader() {
  const { currentDate, goNextMonth, goPrevMonth, goToday } = useCalendarStore()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold capitalize text-foreground">
          {format(currentDate, 'MMMM yyyy', { locale: it })}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={goToday}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent"
        >
          Oggi
        </button>
        <button
          onClick={goPrevMonth}
          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goNextMonth}
          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
