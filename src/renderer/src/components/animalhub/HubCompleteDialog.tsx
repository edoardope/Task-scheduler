import { useState, useEffect } from 'react'
import type { HubScheduledEvent, HubCompleteInput } from '../../../../../shared/types'
import { HUB_META_FIELDS } from '../../../../../shared/types'

interface HubCompleteDialogProps {
  event: HubScheduledEvent
  open: boolean
  onClose: () => void
  onComplete: (input: HubCompleteInput) => void
}

export function HubCompleteDialog({ event, open, onClose, onComplete }: HubCompleteDialogProps) {
  const [detail, setDetail] = useState('')
  const [notes, setNotes] = useState('')
  const [meta, setMeta] = useState<Record<string, string | boolean>>({})

  const metaFields = HUB_META_FIELDS[event.type] || []

  useEffect(() => {
    if (open) {
      setDetail('')
      setNotes('')
      // Pre-fill meta from event
      setMeta(event.meta || {})
    }
  }, [open, event])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onComplete({ detail, notes, meta })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground">Completa: {event.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Target: {event.targetName}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Meta fields */}
          {metaFields.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Dati Evento</p>
              {metaFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(meta[field.key] as string) || ''}
                    onChange={(e) => setMeta({ ...meta, [field.key]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Detail */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Dettaglio</label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Descrizione breve..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Completa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
