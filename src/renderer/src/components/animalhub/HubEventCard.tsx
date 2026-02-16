import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, SkipForward, EyeOff, AlertTriangle } from 'lucide-react'
import type { HubScheduledEvent, HubCompleteInput } from '../../../../../shared/types'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { HubCompleteDialog } from './HubCompleteDialog'
import { cn } from '@/lib/utils'

interface HubEventCardProps {
  event: HubScheduledEvent
  compact?: boolean
}

const eventTypeColors: Record<string, string> = {
  Feeding: 'border-l-emerald-500',
  Test: 'border-l-blue-500',
  Manutenzione: 'border-l-amber-500',
  HealthVet: 'border-l-red-500',
  Pesa: 'border-l-purple-500',
  Acquisto: 'border-l-orange-500',
  Altro: 'border-l-gray-500'
}

export function HubEventCard({ event, compact = false }: HubEventCardProps) {
  const { skipEvent, dismissEvent } = useAnimalHubStore()
  const { toast } = useToast()
  const [showComplete, setShowComplete] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  const isMissed = event.status === 'missed'
  const isToday = event.status === 'today'

  async function handleSkip() {
    await skipEvent(event.id)
    toast('Evento saltato', 'info')
    setShowSkipConfirm(false)
  }

  async function handleDismiss() {
    await dismissEvent(event.id)
    toast('Evento ignorato per oggi', 'info')
  }

  const metaPreview = Object.entries(event.meta)
    .slice(0, 2)
    .map(([k, v]) => `${v}`)
    .join(', ')

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 rounded-lg border border-border border-l-4 bg-card p-3 transition-all hover:bg-accent/30',
          eventTypeColors[event.type] || 'border-l-gray-500',
          isMissed && 'border-red-500'
        )}
      >
        {/* Icon indicator */}
        <div className="mt-0.5 flex-shrink-0">
          {isMissed ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-primary" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{event.label}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {/* Hub badge */}
            <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
              Husbandry Hub
            </span>

            {/* Target name */}
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {event.targetName}
            </span>

            {/* Event type */}
            <span className="text-[10px] text-muted-foreground">{event.type}</span>

            {/* Due date */}
            <span
              className={cn(
                'text-[10px]',
                isMissed ? 'text-red-500 font-medium' : 'text-muted-foreground'
              )}
            >
              {format(parseISO(event.nextDueDate), 'dd/MM')}
            </span>

            {/* Meta preview */}
            {!compact && metaPreview && (
              <span className="text-[10px] text-muted-foreground">• {metaPreview}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setShowComplete(true)}
              className="rounded p-1 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500"
              title="Completa"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Salta"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            {isToday && (
              <button
                onClick={handleDismiss}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Ignora per oggi"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {showComplete && (
        <HubCompleteDialog
          event={event}
          open={showComplete}
          onClose={() => setShowComplete(false)}
          onComplete={async (input: HubCompleteInput) => {
            const { completeEvent } = useAnimalHubStore.getState()
            await completeEvent(event.id, input)
            toast('Evento completato!', 'success')
            setShowComplete(false)
          }}
        />
      )}

      <ConfirmDialog
        open={showSkipConfirm}
        title="Salta Evento"
        message={`Vuoi saltare "${event.label}"? L'evento verrà rimandato alla prossima scadenza.`}
        confirmLabel="Salta"
        onConfirm={handleSkip}
        onCancel={() => setShowSkipConfirm(false)}
      />
    </>
  )
}
