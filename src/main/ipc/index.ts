import { registerTaskHandlers } from './tasks.ipc'
import { registerCategoryHandlers } from './categories.ipc'
import { registerStatsHandlers } from './stats.ipc'

export function registerAllHandlers(): void {
  registerTaskHandlers()
  registerCategoryHandlers()
  registerStatsHandlers()
}
