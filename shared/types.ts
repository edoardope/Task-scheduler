// ---- Enums ----
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom'

// ---- Core Models ----
export interface Task {
  id: number
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  categoryId: number | null
  deadline: string | null
  scheduledDate: string | null
  recurrenceType: RecurrenceType | null
  recurrenceInterval: number
  recurrenceDays: number[] | null
  recurrenceEndDate: string | null
  recurrenceCount: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  // Joined fields
  categoryName?: string
  categoryColor?: string
  tags?: Tag[]
  // Virtual fields for recurring task instances
  occurrenceDate?: string
  isCompleted?: boolean
}

export interface Category {
  id: number
  name: string
  color: string
  icon: string | null
  createdAt: string
}

export interface Tag {
  id: number
  name: string
}

// ---- Inputs ----
export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Priority
  categoryId?: number
  deadline?: string
  scheduledDate?: string
  recurrenceType?: RecurrenceType
  recurrenceInterval?: number
  recurrenceDays?: number[]
  recurrenceEndDate?: string
  recurrenceCount?: number
  tagIds?: number[]
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus
}

export interface CreateCategoryInput {
  name: string
  color?: string
  icon?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  categoryId?: number
  tagIds?: number[]
  hasDeadline?: boolean
  isOverdue?: boolean
}

// ---- Stats ----
export interface DashboardStats {
  totalToday: number
  completedToday: number
  overdueCount: number
  successRatio: number
  weeklyCompleted: number
  weeklyTotal: number
  monthlyCompleted: number
  monthlyTotal: number
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastCompletionDate: string | null
}

export interface TrendDataPoint {
  date: string
  total: number
  completed: number
  ratio: number
}

// ---- AnimalHub (Husbandry Hub) Integration ----

export type HubEventType =
  | 'Feeding'
  | 'Manutenzione'
  | 'Test'
  | 'HealthVet'
  | 'Pesa'
  | 'Acquisto'
  | 'Altro'

export interface HubScheduledEvent {
  id: string
  label: string
  type: HubEventType
  targetId: string
  targetName: string
  frequencyDays: number | null
  nextDueDate: string // YYYY-MM-DD
  active: boolean
  single: boolean
  meta: Record<string, string | boolean>
  ignoreMissedUntil: string | null
  ignoreTodayDate: string | null
  createdAt: string
  // Computed
  status?: 'today' | 'missed' | 'future'
}

export interface HubCompleteInput {
  detail?: string
  notes?: string
  meta?: Record<string, string | boolean>
}

export interface AnimalHubStatus {
  enabled: boolean
  connected: boolean
  dbPath: string | null
  appRunning: boolean
  lastSync: string | null
}

// Meta field definitions per event type
export const HUB_META_FIELDS: Record<HubEventType, { key: string; label: string }[]> = {
  Feeding: [
    { key: 'food', label: 'Alimento' },
    { key: 'amount', label: 'Quantità' }
  ],
  Test: [
    { key: 'param', label: 'Parametro' },
    { key: 'value', label: 'Valore' }
  ],
  Manutenzione: [
    { key: 'added', label: 'Aggiunto' },
    { key: 'removed', label: 'Rimosso' }
  ],
  HealthVet: [
    { key: 'reason', label: 'Motivo' },
    { key: 'cost', label: 'Costo' }
  ],
  Pesa: [{ key: 'weight', label: 'Peso' }],
  Acquisto: [
    { key: 'item', label: 'Oggetto' },
    { key: 'cost', label: 'Costo' },
    { key: 'reason', label: 'Ragione' }
  ],
  Altro: []
}
