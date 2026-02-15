import type {
  Task,
  Category,
  Tag,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCategoryInput,
  DashboardStats,
  StreakInfo,
  TrendDataPoint
} from '../../shared/types'

export interface ElectronAPI {
  getTasks(start: string, end: string): Promise<Task[]>
  getAllTasks(): Promise<Task[]>
  getTaskById(id: number): Promise<Task | null>
  createTask(input: CreateTaskInput): Promise<Task>
  updateTask(id: number, updates: UpdateTaskInput): Promise<Task>
  deleteTask(id: number): Promise<void>
  toggleComplete(id: number, occurrenceDate?: string): Promise<Task>

  getCategories(): Promise<Category[]>
  createCategory(input: CreateCategoryInput): Promise<Category>
  updateCategory(id: number, updates: Partial<CreateCategoryInput>): Promise<Category>
  deleteCategory(id: number): Promise<void>

  getTags(): Promise<Tag[]>
  createTag(name: string): Promise<Tag>
  deleteTag(id: number): Promise<void>

  getDashboardStats(): Promise<DashboardStats>
  getStreakInfo(): Promise<StreakInfo>
  getCompletionTrend(days: number): Promise<TrendDataPoint[]>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
