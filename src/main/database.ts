import initSqlJs from 'sql.js'
import type { Database as SqlJsDatabase } from 'sql.js'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

let db: SqlJsDatabase | null = null
let dbPath = ''
let saveTimer: ReturnType<typeof setTimeout> | null = null

const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    color      TEXT NOT NULL DEFAULT '#6366f1',
    icon       TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT NOT NULL,
    description         TEXT DEFAULT '',
    priority            TEXT NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('low', 'medium', 'high')),
    status              TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    deadline            TEXT,
    scheduled_date      TEXT,
    recurrence_type     TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'custom')),
    recurrence_interval INTEGER DEFAULT 1,
    recurrence_days     TEXT,
    recurrence_end_date TEXT,
    recurrence_count    INTEGER,
    completed_at        TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS task_completions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id         INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    occurrence_date TEXT NOT NULL,
    completed_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(task_id, occurrence_date)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON tasks(scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
  CREATE INDEX IF NOT EXISTS idx_completions_task ON task_completions(task_id);
  CREATE INDEX IF NOT EXISTS idx_completions_date ON task_completions(occurrence_date);
  CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);

  INSERT OR IGNORE INTO categories (name, color, icon) VALUES ('Work', '#3b82f6', '💼');
  INSERT OR IGNORE INTO categories (name, color, icon) VALUES ('Personal', '#8b5cf6', '👤');
  INSERT OR IGNORE INTO categories (name, color, icon) VALUES ('Health', '#10b981', '💪');
  INSERT OR IGNORE INTO categories (name, color, icon) VALUES ('Learning', '#f59e0b', '📚');
`

export function saveToDisk(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(dbPath, buffer)
}

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveToDisk, 300)
}

export async function initDatabase(): Promise<void> {
  await getDatabase()
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db

  const SQL = await initSqlJs()

  const userDataPath = app.getPath('userData')
  mkdirSync(userDataPath, { recursive: true })
  dbPath = join(userDataPath, 'task-scheduler.db')

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')
  db.run(MIGRATION_SQL)
  saveToDisk()

  return db
}

// Sync getter (after init)
export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

// Helper: run query and return all rows as objects
export function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const database = getDb()
  const stmt = database.prepare(sql)
  if (params.length > 0) stmt.bind(params)

  const rows: Record<string, unknown>[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>)
  }
  stmt.free()
  return rows
}

// Helper: run query and return first row
export function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | undefined {
  const rows = queryAll(sql, params)
  return rows[0]
}

// Helper: run statement (INSERT/UPDATE/DELETE) and return changes info
export function runSql(sql: string, params: unknown[] = []): number {
  const database = getDb()
  database.run(sql, params as unknown[])
  scheduleSave()
  const result = database.exec('SELECT last_insert_rowid() as id')
  return result.length > 0 ? (result[0].values[0][0] as number) : 0
}

// Helper: execute raw SQL
export function execSql(sql: string): void {
  const database = getDb()
  database.run(sql)
  scheduleSave()
}
