import { contextBridge, ipcRenderer } from 'electron'
import type { CreateTaskInput, UpdateTaskInput, CreateCategoryInput } from '../../shared/types'

const api = {
  // Tasks
  getTasks: (start: string, end: string) => ipcRenderer.invoke('tasks:getForRange', start, end),
  getAllTasks: () => ipcRenderer.invoke('tasks:getAll'),
  getTaskById: (id: number) => ipcRenderer.invoke('tasks:getById', id),
  createTask: (input: CreateTaskInput) => ipcRenderer.invoke('tasks:create', input),
  updateTask: (id: number, updates: UpdateTaskInput) =>
    ipcRenderer.invoke('tasks:update', id, updates),
  deleteTask: (id: number) => ipcRenderer.invoke('tasks:delete', id),
  toggleComplete: (id: number, occurrenceDate?: string) =>
    ipcRenderer.invoke('tasks:toggleComplete', id, occurrenceDate),

  // Categories
  getCategories: () => ipcRenderer.invoke('categories:getAll'),
  createCategory: (input: CreateCategoryInput) => ipcRenderer.invoke('categories:create', input),
  updateCategory: (id: number, updates: Partial<CreateCategoryInput>) =>
    ipcRenderer.invoke('categories:update', id, updates),
  deleteCategory: (id: number) => ipcRenderer.invoke('categories:delete', id),

  // Tags
  getTags: () => ipcRenderer.invoke('tags:getAll'),
  createTag: (name: string) => ipcRenderer.invoke('tags:create', name),
  deleteTag: (id: number) => ipcRenderer.invoke('tags:delete', id),

  // Stats
  getDashboardStats: () => ipcRenderer.invoke('stats:dashboard'),
  getStreakInfo: () => ipcRenderer.invoke('stats:streak'),
  getCompletionTrend: (days: number) => ipcRenderer.invoke('stats:trend', days)
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
