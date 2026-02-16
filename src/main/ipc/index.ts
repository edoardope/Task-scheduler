import { registerTaskHandlers } from './tasks.ipc'
import { registerCategoryHandlers } from './categories.ipc'
import { registerStatsHandlers } from './stats.ipc'
import { registerSettingsHandlers } from './settings.ipc'
import { registerAnimalHubHandlers } from './animalhub.ipc'

export function registerAllHandlers(): void {
  registerTaskHandlers()
  registerCategoryHandlers()
  registerStatsHandlers()
  registerSettingsHandlers()
  registerAnimalHubHandlers()
}
