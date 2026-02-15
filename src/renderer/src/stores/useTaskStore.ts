import { create } from 'zustand'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../../../shared/types'

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasksForRange: (start: string, end: string) => Promise<void>
  fetchAllTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: number, updates: UpdateTaskInput) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  toggleComplete: (id: number, occurrenceDate?: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasksForRange: async (start, end) => {
    set({ loading: true })
    const tasks = await window.api.getTasks(start, end)
    set({ tasks, loading: false })
  },

  fetchAllTasks: async () => {
    set({ loading: true })
    const tasks = await window.api.getAllTasks()
    set({ tasks, loading: false })
  },

  createTask: async (input) => {
    const task = await window.api.createTask(input)
    const tasks = get().tasks
    set({ tasks: [task, ...tasks] })
    return task
  },

  updateTask: async (id, updates) => {
    const updated = await window.api.updateTask(id, updates)
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) })
  },

  deleteTask: async (id) => {
    await window.api.deleteTask(id)
    set({ tasks: get().tasks.filter((t) => t.id !== id) })
  },

  toggleComplete: async (id, occurrenceDate) => {
    const updated = await window.api.toggleComplete(id, occurrenceDate)
    if (occurrenceDate) {
      // For recurring tasks, update the specific occurrence
      set({
        tasks: get().tasks.map((t) =>
          t.id === id && t.occurrenceDate === occurrenceDate
            ? { ...t, isCompleted: !t.isCompleted }
            : t
        )
      })
    } else {
      set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) })
    }
  }
}))
