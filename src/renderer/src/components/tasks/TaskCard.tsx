import { useState } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { Circle, CheckCircle2, Clock, AlertTriangle, Trash2, Pencil } from 'lucide-react'
import type { Task } from '../../../../../shared/types'
import { useTaskStore } from '@/stores/useTaskStore'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { TaskForm } from './TaskForm'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-400'
}

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Bassa'
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { toggleComplete, deleteTask, fetchAllTasks } = useTaskStore()
  const { toast } = useToast()
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isComplete = task.status === 'completed' || task.isCompleted
  const isOverdue =
    task.deadline && !isComplete && isPast(parseISO(task.deadline + 'T23:59:59'))

  async function handleToggle() {
    await toggleComplete(task.id, task.occurrenceDate)
    toast(isComplete ? 'Task riaperto' : 'Task completato!', 'success')
  }

  async function handleDelete() {
    await deleteTask(task.id)
    toast('Task eliminato', 'info')
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 rounded-lg border border-border border-l-4 bg-card p-3 transition-all hover:bg-accent/30',
          priorityColors[task.priority],
          isComplete && 'opacity-60'
        )}
      >
        {/* Completion toggle */}
        <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium text-foreground',
              isComplete && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>

          {!compact && task.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {/* Category badge */}
            {task.categoryName && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: task.categoryColor || '#6366f1' }}
              >
                {task.categoryName}
              </span>
            )}

            {/* Priority */}
            {!compact && (
              <span className="text-[10px] text-muted-foreground">
                {priorityLabels[task.priority]}
              </span>
            )}

            {/* Deadline */}
            {task.deadline && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px]',
                  isOverdue ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {isOverdue ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {format(parseISO(task.deadline), 'dd/MM')}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
              >
                #{tag.name}
              </span>
            ))}

            {/* Recurrence indicator */}
            {task.recurrenceType && (
              <span className="text-[10px] text-muted-foreground">🔄</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {showEdit && (
        <TaskForm
          task={task}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            fetchAllTasks()
          }}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Elimina Task"
        message={`Vuoi davvero eliminare "${task.title}"? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
