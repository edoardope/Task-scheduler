import { ipcMain } from 'electron'
import * as statsService from '../services/stats.service'

export function registerStatsHandlers(): void {
  ipcMain.handle('stats:dashboard', () => {
    return statsService.getDashboardStats()
  })

  ipcMain.handle('stats:streak', () => {
    return statsService.getStreakInfo()
  })

  ipcMain.handle('stats:trend', (_event, days: number) => {
    return statsService.getCompletionTrend(days)
  })
}
