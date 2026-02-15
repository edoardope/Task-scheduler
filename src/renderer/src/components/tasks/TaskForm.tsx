import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTaskStore } from '@/stores/useTaskStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useToast } from '@/components/ui/Toast'
import type { Task, Priority, RecurrenceType, CreateTaskInput } from '../../../../../shared/types'

interface TaskFormProps {
  task?: Task
  onClose: () => void
  onSaved: () => void
}

export function TaskForm({ task, onClose, onSaved }: TaskFormProps) {
  const { createTask, updateTask } = useTaskStore()
  const { categories, tags } = useCategoryStore()
  const { toast } = useToast()

  // Escape key closes the form
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [categoryId, setCategoryId] = useState<number | undefined>(task?.categoryId ?? undefined)
  const [deadline, setDeadline] = useState(task?.deadline ?? '')
  const [scheduledDate, setScheduledDate] = useState(task?.scheduledDate ?? '')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | ''>(
    task?.recurrenceType ?? ''
  )
  const [recurrenceInterval, setRecurrenceInterval] = useState(task?.recurrenceInterval ?? 1)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    task?.tags?.map((t) => t.id) ?? []
  )
  const [saving, setSaving] = useState(false)

  const isEdit = !!task

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId: categoryId || undefined,
      deadline: deadline || undefined,
      scheduledDate: scheduledDate || undefined,
      recurrenceType: recurrenceType || undefined,
      recurrenceInterval: recurrenceType ? recurrenceInterval : undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
    }

    if (isEdit) {
      await updateTask(task.id, input)
      toast('Task aggiornato', 'success')
    } else {
      await createTask(input)
      toast('Task creato!', 'success')
    }
    setSaving(false)
    onSaved()
  }

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isEdit ? 'Modifica Task' : 'Nuovo Task'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Titolo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome del task..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Descrizione</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dettagli..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Priorità</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
              <select
                value={categoryId ?? ''}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Nessuna</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Scadenza
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Data programmata
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Ricorrenza</label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType | '')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Nessuna</option>
                <option value="daily">Giornaliera</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
                <option value="custom">Personalizzata</option>
              </select>
            </div>
            {recurrenceType && (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Ogni N {recurrenceType === 'daily' ? 'giorni' : recurrenceType === 'weekly' ? 'settimane' : recurrenceType === 'monthly' ? 'mesi' : 'giorni'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Tag</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : isEdit ? 'Salva' : 'Crea Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
