import { ipcMain } from 'electron'
import * as bridge from '../services/animalhub-bridge.service'
import { getSetting } from '../services/settings.service'
import type { HubCompleteInput } from '../../../shared/types'

export function registerAnimalHubHandlers(): void {
  ipcMain.handle('hub:status', () => {
    return bridge.getStatus()
  })

  ipcMain.handle('hub:connect', async () => {
    const path = getSetting('animalhub_path')
    if (!path) {
      throw new Error('AnimalHub path not configured')
    }
    await bridge.connect(path)
    return bridge.getStatus()
  })

  ipcMain.handle('hub:disconnect', () => {
    bridge.disconnect()
    return bridge.getStatus()
  })

  ipcMain.handle('hub:scheduled:today', () => {
    return bridge.getScheduledToday()
  })

  ipcMain.handle('hub:scheduled:missed', () => {
    return bridge.getScheduledMissed()
  })

  ipcMain.handle('hub:scheduled:future', (_event, days: number) => {
    return bridge.getScheduledFuture(days)
  })

  ipcMain.handle('hub:scheduled:all', () => {
    return bridge.getAllScheduledWithStatus()
  })

  ipcMain.handle('hub:complete', (_event, id: string, input: HubCompleteInput) => {
    bridge.completeScheduled(id, input)
    return { success: true }
  })

  ipcMain.handle('hub:skip', (_event, id: string) => {
    bridge.skipScheduled(id)
    return { success: true }
  })

  ipcMain.handle('hub:dismiss', (_event, id: string) => {
    bridge.dismissScheduled(id)
    return { success: true }
  })

  ipcMain.handle('hub:isRunning', () => {
    return bridge.isHusbandryHubRunning()
  })
}
