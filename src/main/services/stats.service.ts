import { format, subDays, parseISO, isPast, eachDayOfInterval } from 'date-fns'
import { getTasksForRange } from './task.service'
import type { Task, DashboardStats, StreakInfo, TrendDataPoint } from '../../../shared/types'

function isTaskComplete(t: Task): boolean {
  return t.status === 'completed' || !!t.isCompleted
}

function getTaskDate(t: Task): string | null {
  return t.occurrenceDate ?? t.scheduledDate ?? t.deadline ?? null
}

export function getDashboardStats(): DashboardStats {
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  // Fetch expanded tasks for relevant ranges
  const todayTasks = getTasksForRange(today, today)
  const weeklyTasks = getTasksForRange(weekAgo, today)
  const monthlyTasks = getTasksForRange(monthAgo, today)

  const totalToday = todayTasks.length
  const completedToday = todayTasks.filter(isTaskComplete).length

  const weeklyTotal = weeklyTasks.length
  const weeklyCompleted = weeklyTasks.filter(isTaskComplete).length

  const monthlyTotal = monthlyTasks.length
  const monthlyCompleted = monthlyTasks.filter(isTaskComplete).length

  // Overdue: tasks from the past month whose date has passed and are not completed
  const overdueCount = monthlyTasks.filter((t) => {
    if (isTaskComplete(t)) return false
    const date = getTaskDate(t)
    if (!date) return false
    return date < today
  }).length

  return {
    totalToday,
    completedToday,
    overdueCount,
    successRatio: totalToday > 0 ? completedToday / totalToday : 0,
    weeklyCompleted,
    weeklyTotal,
    monthlyCompleted,
    monthlyTotal
  }
}

export function getStreakInfo(): StreakInfo {
  const today = new Date()
  const startDate = subDays(today, 90)

  const tasks = getTasksForRange(
    format(startDate, 'yyyy-MM-dd'),
    format(today, 'yyyy-MM-dd')
  )

  // Group tasks by date
  const byDate = new Map<string, { total: number; completed: number }>()
  for (const t of tasks) {
    const date = getTaskDate(t)
    if (!date) continue
    const entry = byDate.get(date) ?? { total: 0, completed: 0 }
    entry.total++
    if (isTaskComplete(t)) entry.completed++
    byDate.set(date, entry)
  }

  // Walk backwards from today
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let streakBroken = false
  let lastCompletionDate: string | null = null

  const days = eachDayOfInterval({ start: startDate, end: today }).reverse()
  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const entry = byDate.get(dateStr)
    if (entry && entry.total > 0 && entry.completed === entry.total) {
      tempStreak++
      if (!lastCompletionDate) lastCompletionDate = dateStr
    } else if (entry && entry.total > 0) {
      // Had tasks but not all completed - streak broken
      if (!streakBroken) {
        currentStreak = tempStreak
        streakBroken = true
      }
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 0
    }
    // Days with no tasks don't break the streak
  }

  if (!streakBroken) currentStreak = tempStreak
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak, lastCompletionDate }
}

export function getCompletionTrend(days: number): TrendDataPoint[] {
  const today = new Date()
  const startDate = subDays(today, days)

  const tasks = getTasksForRange(
    format(startDate, 'yyyy-MM-dd'),
    format(today, 'yyyy-MM-dd')
  )

  // Group by date
  const byDate = new Map<string, { total: number; completed: number }>()
  for (const t of tasks) {
    const date = getTaskDate(t)
    if (!date) continue
    const entry = byDate.get(date) ?? { total: 0, completed: 0 }
    entry.total++
    if (isTaskComplete(t)) entry.completed++
    byDate.set(date, entry)
  }

  // Generate entries for each day in range
  const allDays = eachDayOfInterval({ start: startDate, end: today })
  return allDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const entry = byDate.get(dateStr) ?? { total: 0, completed: 0 }
    return {
      date: dateStr,
      total: entry.total,
      completed: entry.completed,
      ratio: entry.total > 0 ? entry.completed / entry.total : 0
    }
  })
}
