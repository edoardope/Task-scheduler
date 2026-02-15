import {
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  format,
  getDay,
  isBefore,
  isAfter
} from 'date-fns'
import type { Task } from '../../../shared/types'

export function expandRecurrences(
  task: Task,
  rangeStart: string,
  rangeEnd: string,
  completions: Set<string>
): Task[] {
  if (!task.recurrenceType) return []

  const results: Task[] = []
  // Use scheduledDate or deadline as anchor; fall back to createdAt date portion
  // (createdAt is UTC via datetime('now'), so extract just the date to avoid timezone shift)
  const anchorStr = task.scheduledDate ?? task.deadline ?? task.createdAt.slice(0, 10)
  const anchor = parseISO(anchorStr)
  const start = parseISO(rangeStart)
  const end = parseISO(rangeEnd)
  const endLimit = task.recurrenceEndDate ? parseISO(task.recurrenceEndDate) : null
  const interval = task.recurrenceInterval || 1
  const maxCount = task.recurrenceCount ?? 10000

  let current = anchor
  let count = 0

  while (count < maxCount) {
    if (endLimit && isAfter(current, endLimit)) break
    if (isAfter(current, end)) break

    if (!isBefore(current, start)) {
      const dateStr = format(current, 'yyyy-MM-dd')

      if (task.recurrenceType === 'weekly' && task.recurrenceDays?.length) {
        if (task.recurrenceDays.includes(getDay(current))) {
          results.push({
            ...task,
            scheduledDate: null,
            deadline: null,
            occurrenceDate: dateStr,
            isCompleted: completions.has(dateStr)
          })
        }
      } else {
        results.push({
          ...task,
          scheduledDate: null,
          deadline: null,
          occurrenceDate: dateStr,
          isCompleted: completions.has(dateStr)
        })
      }
    }

    switch (task.recurrenceType) {
      case 'daily':
        current = addDays(current, interval)
        break
      case 'weekly':
        if (task.recurrenceDays?.length) {
          current = addDays(current, 1)
        } else {
          current = addWeeks(current, interval)
        }
        break
      case 'monthly':
        current = addMonths(current, interval)
        break
      case 'custom':
        current = addDays(current, interval)
        break
    }
    count++
  }

  return results
}
