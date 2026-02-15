import { queryAll, queryOne, runSql } from '../database'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../../shared/types'
import { expandRecurrences } from './recurrence.service'

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    title: row.title as string,
    description: (row.description as string) ?? '',
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    categoryId: (row.category_id as number) ?? null,
    deadline: (row.deadline as string) ?? null,
    scheduledDate: (row.scheduled_date as string) ?? null,
    recurrenceType: (row.recurrence_type as Task['recurrenceType']) ?? null,
    recurrenceInterval: (row.recurrence_interval as number) ?? 1,
    recurrenceDays: row.recurrence_days ? JSON.parse(row.recurrence_days as string) : null,
    recurrenceEndDate: (row.recurrence_end_date as string) ?? null,
    recurrenceCount: (row.recurrence_count as number) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    categoryName: (row.category_name as string) ?? undefined,
    categoryColor: (row.category_color as string) ?? undefined
  }
}

function getTagsForTask(taskId: number) {
  return queryAll(
    'SELECT t.id, t.name FROM tags t JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ?',
    [taskId]
  ).map((r) => ({ id: r.id as number, name: r.name as string }))
}

export function getAllTasks(): Task[] {
  const rows = queryAll(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     ORDER BY t.created_at DESC`
  )

  return rows.map((row) => {
    const task = rowToTask(row)
    task.tags = getTagsForTask(task.id)
    return task
  })
}

export function getTasksForRange(startDate: string, endDate: string): Task[] {
  const regularRows = queryAll(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.recurrence_type IS NULL
       AND ((t.scheduled_date BETWEEN ? AND ?) OR (t.deadline BETWEEN ? AND ?))
     ORDER BY COALESCE(t.scheduled_date, t.deadline), t.priority DESC`,
    [startDate, endDate, startDate, endDate]
  )

  const regularTasks = regularRows.map((row) => {
    const task = rowToTask(row)
    task.tags = getTagsForTask(task.id)
    return task
  })

  const recurringRows = queryAll(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.recurrence_type IS NOT NULL
       AND t.status != 'cancelled'
       AND (t.recurrence_end_date IS NULL OR t.recurrence_end_date >= ?)
       AND COALESCE(t.scheduled_date, t.deadline, DATE(t.created_at)) <= ?`,
    [startDate, endDate]
  )

  const expandedTasks: Task[] = []
  for (const row of recurringRows) {
    const task = rowToTask(row)
    task.tags = getTagsForTask(task.id)

    const completions = queryAll(
      'SELECT occurrence_date FROM task_completions WHERE task_id = ? AND occurrence_date BETWEEN ? AND ?',
      [task.id, startDate, endDate]
    )
    const completionSet = new Set(completions.map((c) => c.occurrence_date as string))
    const occurrences = expandRecurrences(task, startDate, endDate, completionSet)
    expandedTasks.push(...occurrences)
  }

  return [...regularTasks, ...expandedTasks]
}

export function getTaskById(id: number): Task | null {
  const row = queryOne(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = ?`,
    [id]
  )

  if (!row) return null
  const task = rowToTask(row)
  task.tags = getTagsForTask(task.id)
  return task
}

export function createTask(input: CreateTaskInput): Task {
  const taskId = runSql(
    `INSERT INTO tasks (title, description, priority, category_id, deadline, scheduled_date,
      recurrence_type, recurrence_interval, recurrence_days, recurrence_end_date, recurrence_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description ?? '',
      input.priority ?? 'medium',
      input.categoryId ?? null,
      input.deadline ?? null,
      input.scheduledDate ?? null,
      input.recurrenceType ?? null,
      input.recurrenceInterval ?? 1,
      input.recurrenceDays ? JSON.stringify(input.recurrenceDays) : null,
      input.recurrenceEndDate ?? null,
      input.recurrenceCount ?? null
    ]
  )

  if (input.tagIds?.length) {
    for (const tagId of input.tagIds) {
      runSql('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId])
    }
  }

  return getTaskById(taskId)!
}

export function updateTask(id: number, updates: UpdateTaskInput): Task {
  const fields: string[] = []
  const values: unknown[] = []

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description) }
  if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority) }
  if (updates.status !== undefined) {
    fields.push('status = ?'); values.push(updates.status)
    if (updates.status === 'completed') {
      fields.push("completed_at = datetime('now')")
    }
  }
  if (updates.categoryId !== undefined) { fields.push('category_id = ?'); values.push(updates.categoryId) }
  if (updates.deadline !== undefined) { fields.push('deadline = ?'); values.push(updates.deadline) }
  if (updates.scheduledDate !== undefined) { fields.push('scheduled_date = ?'); values.push(updates.scheduledDate) }
  if (updates.recurrenceType !== undefined) { fields.push('recurrence_type = ?'); values.push(updates.recurrenceType) }
  if (updates.recurrenceInterval !== undefined) { fields.push('recurrence_interval = ?'); values.push(updates.recurrenceInterval) }
  if (updates.recurrenceDays !== undefined) {
    fields.push('recurrence_days = ?')
    values.push(updates.recurrenceDays ? JSON.stringify(updates.recurrenceDays) : null)
  }
  if (updates.recurrenceEndDate !== undefined) { fields.push('recurrence_end_date = ?'); values.push(updates.recurrenceEndDate) }
  if (updates.recurrenceCount !== undefined) { fields.push('recurrence_count = ?'); values.push(updates.recurrenceCount) }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')")
    values.push(id)
    runSql(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values)
  }

  if (updates.tagIds !== undefined) {
    runSql('DELETE FROM task_tags WHERE task_id = ?', [id])
    if (updates.tagIds.length) {
      for (const tagId of updates.tagIds) {
        runSql('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [id, tagId])
      }
    }
  }

  return getTaskById(id)!
}

export function deleteTask(id: number): void {
  runSql('DELETE FROM tasks WHERE id = ?', [id])
}

export function toggleComplete(id: number, occurrenceDate?: string): Task {
  if (occurrenceDate) {
    const existing = queryOne(
      'SELECT id FROM task_completions WHERE task_id = ? AND occurrence_date = ?',
      [id, occurrenceDate]
    )
    if (existing) {
      runSql('DELETE FROM task_completions WHERE task_id = ? AND occurrence_date = ?', [id, occurrenceDate])
    } else {
      runSql('INSERT INTO task_completions (task_id, occurrence_date) VALUES (?, ?)', [id, occurrenceDate])
    }
  } else {
    const task = queryOne('SELECT status FROM tasks WHERE id = ?', [id])
    if (task) {
      if (task.status === 'completed') {
        runSql("UPDATE tasks SET status = 'pending', completed_at = NULL, updated_at = datetime('now') WHERE id = ?", [id])
      } else {
        runSql("UPDATE tasks SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [id])
      }
    }
  }

  return getTaskById(id)!
}
