import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as settingsService from '../services/settings.service'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', (_event, key: string) => {
    return settingsService.getSetting(key)
  })

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    return settingsService.setSetting(key, value)
  })

  ipcMain.handle('settings:delete', (_event, key: string) => {
    return settingsService.deleteSetting(key)
  })

  ipcMain.handle('settings:selectDirectory', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })

    return result.canceled ? null : result.filePaths[0]
  })
}
