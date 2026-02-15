import { queryAll, queryOne, runSql } from '../database'
import type { Category, Tag, CreateCategoryInput } from '../../../shared/types'

export function getAllCategories(): Category[] {
  return queryAll('SELECT * FROM categories ORDER BY name').map((r) => ({
    id: r.id as number,
    name: r.name as string,
    color: r.color as string,
    icon: (r.icon as string) ?? null,
    createdAt: r.created_at as string
  }))
}

export function createCategory(input: CreateCategoryInput): Category {
  const id = runSql(
    'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
    [input.name, input.color ?? '#6366f1', input.icon ?? null]
  )
  const row = queryOne('SELECT * FROM categories WHERE id = ?', [id])!
  return {
    id: row.id as number,
    name: row.name as string,
    color: row.color as string,
    icon: (row.icon as string) ?? null,
    createdAt: row.created_at as string
  }
}

export function updateCategory(id: number, updates: Partial<CreateCategoryInput>): Category {
  const fields: string[] = []
  const values: unknown[] = []

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
  if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color) }
  if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon) }

  if (fields.length > 0) {
    values.push(id)
    runSql(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)
  }

  const row = queryOne('SELECT * FROM categories WHERE id = ?', [id])!
  return {
    id: row.id as number,
    name: row.name as string,
    color: row.color as string,
    icon: (row.icon as string) ?? null,
    createdAt: row.created_at as string
  }
}

export function deleteCategory(id: number): void {
  runSql('DELETE FROM categories WHERE id = ?', [id])
}

export function getAllTags(): Tag[] {
  return queryAll('SELECT * FROM tags ORDER BY name').map((r) => ({
    id: r.id as number,
    name: r.name as string
  }))
}

export function createTag(name: string): Tag {
  const existing = queryOne('SELECT * FROM tags WHERE name = ?', [name])
  if (existing) return { id: existing.id as number, name: existing.name as string }

  const id = runSql('INSERT INTO tags (name) VALUES (?)', [name])
  return { id, name }
}

export function deleteTag(id: number): void {
  runSql('DELETE FROM tags WHERE id = ?', [id])
}
