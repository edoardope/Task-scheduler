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
