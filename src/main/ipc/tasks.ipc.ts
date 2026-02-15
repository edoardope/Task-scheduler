import { ipcMain } from 'electron'
import * as taskService from '../services/task.service'
import type { CreateTaskInput, UpdateTaskInput } from '../../../shared/types'

export function registerTaskHandlers(): void {
  ipcMain.handle('tasks:getForRange', (_event, startDate: string, endDate: string) => {
    return taskService.getTasksForRange(startDate, endDate)
  })

  ipcMain.handle('tasks:getById', (_event, id: number) => {
    return taskService.getTaskById(id)
  })

  ipcMain.handle('tasks:create', (_event, input: CreateTaskInput) => {
    return taskService.createTask(input)
  })

  ipcMain.handle('tasks:update', (_event, id: number, updates: UpdateTaskInput) => {
    return taskService.updateTask(id, updates)
  })

  ipcMain.handle('tasks:delete', (_event, id: number) => {
    return taskService.deleteTask(id)
  })

  ipcMain.handle('tasks:toggleComplete', (_event, id: number, occurrenceDate?: string) => {
    return taskService.toggleComplete(id, occurrenceDate)
  })

  ipcMain.handle('tasks:getAll', () => {
    return taskService.getAllTasks()
  })
}
