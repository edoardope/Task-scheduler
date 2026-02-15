import { ipcMain } from 'electron'
import * as categoryService from '../services/category.service'
import type { CreateCategoryInput } from '../../../shared/types'

export function registerCategoryHandlers(): void {
  ipcMain.handle('categories:getAll', () => {
    return categoryService.getAllCategories()
  })

  ipcMain.handle('categories:create', (_event, input: CreateCategoryInput) => {
    return categoryService.createCategory(input)
  })

  ipcMain.handle('categories:update', (_event, id: number, updates: Partial<CreateCategoryInput>) => {
    return categoryService.updateCategory(id, updates)
  })

  ipcMain.handle('categories:delete', (_event, id: number) => {
    return categoryService.deleteCategory(id)
  })

  ipcMain.handle('tags:getAll', () => {
    return categoryService.getAllTags()
  })

  ipcMain.handle('tags:create', (_event, name: string) => {
    return categoryService.createTag(name)
  })

  ipcMain.handle('tags:delete', (_event, id: number) => {
    return categoryService.deleteTag(id)
  })
}
