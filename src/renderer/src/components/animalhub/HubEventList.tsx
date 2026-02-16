import type { HubScheduledEvent } from '../../../../../shared/types'
import { HubEventCard } from './HubEventCard'
import { Bug } from 'lucide-react'

interface HubEventListProps {
  today: HubScheduledEvent[]
  missed: HubScheduledEvent[]
  future: HubScheduledEvent[]
}

export function HubEventList({ today, missed, future }: HubEventListProps) {
  const hasAny = today.length > 0 || missed.length > 0 || future.length > 0

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center py-8 text-muted-foreground">
        <Bug className="mb-2 h-10 w-10" />
        <p className="text-sm">Nessun evento programmato</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Missed events */}
      {missed.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-red-500">In ritardo</h4>
          <div className="space-y-2">
            {missed.map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Today events */}
      {today.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-primary">Oggi</h4>
          <div className="space-y-2">
            {today.map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Future events */}
      {future.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Prossimi giorni</h4>
          <div className="space-y-2">
            {future.map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
