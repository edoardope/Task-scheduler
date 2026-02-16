import { useEffect } from 'react'
import { Bug, AlertTriangle, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import { HubEventCard } from './HubEventCard'

export function HubSection() {
  const { status, todayEvents, missedEvents, fetchStatus, fetchEvents } = useAnimalHubStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (status?.connected) {
      fetchEvents()
    }
  }, [status?.connected, fetchEvents])

  const isConnected = status?.connected === true
  const todayCount = todayEvents.length
  const missedCount = missedEvents.length
  const hasEvents = todayCount > 0 || missedCount > 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-teal-500" />
          <h3 className="text-lg font-semibold text-foreground">Husbandry Hub</h3>
        </div>
        {isConnected && hasEvents && (
          <span className="text-sm text-muted-foreground">
            {todayCount} oggi{missedCount > 0 && `, ${missedCount} in ritardo`}
          </span>
        )}
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
          <Settings className="mb-2 h-8 w-8" />
          <p className="text-sm">Non connesso</p>
          <button
            onClick={() => navigate('/settings')}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Configura nelle Impostazioni
          </button>
        </div>
      ) : !hasEvents ? (
        <div className="flex flex-col items-center py-6 text-muted-foreground">
          <Bug className="mb-2 h-8 w-8" />
          <p className="text-sm">Nessun evento per oggi</p>
        </div>
      ) : (
        <>
          {/* Missed alert */}
          {missedCount > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {missedCount} evento{missedCount > 1 ? 'i' : ''} in ritardo
              </p>
            </div>
          )}

          {/* Event list */}
          <div className="space-y-2">
            {missedEvents.slice(0, 3).map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
            {todayEvents.slice(0, 5 - missedEvents.length).map((event) => (
              <HubEventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
