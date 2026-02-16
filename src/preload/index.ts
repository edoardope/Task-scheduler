import { contextBridge, ipcRenderer } from 'electron'
import type { CreateTaskInput, UpdateTaskInput, CreateCategoryInput, HubCompleteInput } from '../../shared/types'

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
  getCompletionTrend: (days: number) => ipcRenderer.invoke('stats:trend', days),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  deleteSetting: (key: string) => ipcRenderer.invoke('settings:delete', key),
  selectDirectory: () => ipcRenderer.invoke('settings:selectDirectory'),

  // AnimalHub
  hubGetStatus: () => ipcRenderer.invoke('hub:status'),
  hubConnect: () => ipcRenderer.invoke('hub:connect'),
  hubDisconnect: () => ipcRenderer.invoke('hub:disconnect'),
  hubGetScheduledToday: () => ipcRenderer.invoke('hub:scheduled:today'),
  hubGetScheduledMissed: () => ipcRenderer.invoke('hub:scheduled:missed'),
  hubGetScheduledFuture: (days: number) => ipcRenderer.invoke('hub:scheduled:future', days),
  hubGetAllScheduled: () => ipcRenderer.invoke('hub:scheduled:all'),
  hubCompleteEvent: (id: string, input: HubCompleteInput) =>
    ipcRenderer.invoke('hub:complete', id, input),
  hubSkipEvent: (id: string) => ipcRenderer.invoke('hub:skip', id),
  hubDismissEvent: (id: string) => ipcRenderer.invoke('hub:dismiss', id),
  hubIsAppRunning: () => ipcRenderer.invoke('hub:isRunning')
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
