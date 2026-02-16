import initSqlJs from 'sql.js'
import type { Database as SqlJsDatabase } from 'sql.js'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { HubScheduledEvent, HubCompleteInput, AnimalHubStatus } from '../../../shared/types'

let hubDb: SqlJsDatabase | null = null
let hubDbPath: string | null = null
let sqlModule: Awaited<ReturnType<typeof initSqlJs>> | null = null

// Helper: Get today's date in YYYY-MM-DD format
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Helper: Add days to a date string
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Helper: Check if Husbandry Hub is running
export function isHusbandryHubRunning(): boolean {
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq Husbandry Hub.exe" /NH', {
      encoding: 'utf-8'
    })
    return output.includes('Husbandry Hub')
  } catch {
    return false
  }
}

// Helper: Parse a scheduled row from SQL to HubScheduledEvent
function parseScheduledRow(row: Record<string, unknown>): HubScheduledEvent {
  return {
    id: row.id as string,
    label: row.label as string,
    type: row.type as HubScheduledEvent['type'],
    targetId: row.target_id as string,
    targetName: row.target_name as string,
    frequencyDays: (row.frequency_days as number) ?? null,
    nextDueDate: row.next_due_date as string,
    active: (row.active as number) === 1,
    single: (row.single as number) === 1,
    meta: row.meta ? JSON.parse(row.meta as string) : {},
    ignoreMissedUntil: (row.ignore_missed_until as string) ?? null,
    ignoreTodayDate: (row.ignore_today_date as string) ?? null,
    createdAt: row.created_at as string
  }
}

// Helper: Query all rows from hubDb
function hubQueryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  if (!hubDb) throw new Error('AnimalHub database not connected')

  const stmt = hubDb.prepare(sql)
  if (params.length > 0) stmt.bind(params)

  const rows: Record<string, unknown>[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>)
  }
  stmt.free()
  return rows
}

// Helper: Execute SQL on hubDb
function hubExecute(sql: string, params: unknown[] = []): void {
  if (!hubDb) throw new Error('AnimalHub database not connected')
  hubDb.run(sql, params)
}

// Helper: Save hubDb to disk
function saveHubDb(): void {
  if (!hubDb || !hubDbPath) return

  if (isHusbandryHubRunning()) {
    throw new Error('Husbandry Hub is running. Close it before saving.')
  }

  const data = hubDb.export()
  writeFileSync(hubDbPath, Buffer.from(data))
}

// Connect to AnimalHub database
export async function connect(winUnpackedPath: string): Promise<void> {
  // Verify the installation path exists
  if (!existsSync(winUnpackedPath)) {
    throw new Error(`AnimalHub installation not found at: ${winUnpackedPath}`)
  }

  // Derive the database path from %APPDATA%
  const appData = process.env.APPDATA
  if (!appData) {
    throw new Error('APPDATA environment variable not found')
  }

  const dbPath = join(appData, 'husbandry-hub', 'husbandry-hub.db')

  if (!existsSync(dbPath)) {
    throw new Error(`AnimalHub database not found at: ${dbPath}`)
  }

  // Initialize sql.js if needed
  if (!sqlModule) {
    sqlModule = await initSqlJs()
  }

  // Load the database into memory
  const buffer = readFileSync(dbPath)
  hubDb = new sqlModule.Database(buffer)
  hubDbPath = dbPath
}

// Disconnect from AnimalHub database
export function disconnect(): void {
  if (hubDb) {
    hubDb.close()
    hubDb = null
  }
  hubDbPath = null
}

// Reload database from disk
export async function reload(): Promise<void> {
  if (!hubDbPath) {
    throw new Error('No database path configured')
  }

  const savedPath = hubDbPath
  disconnect()

  // Re-read from disk
  if (!sqlModule) {
    sqlModule = await initSqlJs()
  }

  const buffer = readFileSync(savedPath)
  hubDb = new sqlModule.Database(buffer)
  hubDbPath = savedPath
}

// Check if connected
export function isConnected(): boolean {
  return hubDb !== null
}

// Get status
export function getStatus(): AnimalHubStatus {
  return {
    enabled: hubDbPath !== null,
    connected: hubDb !== null,
    dbPath: hubDbPath,
    appRunning: isHusbandryHubRunning(),
    lastSync: hubDb ? new Date().toISOString() : null
  }
}

// Get scheduled events for today
export function getScheduledToday(): HubScheduledEvent[] {
  const today = todayStr()
  const rows = hubQueryAll(
    `SELECT * FROM scheduled
     WHERE active = 1
       AND next_due_date = ?
       AND (ignore_today_date IS NULL OR ignore_today_date != ?)`,
    [today, today]
  )
  return rows.map(parseScheduledRow)
}

// Get missed (overdue) scheduled events
export function getScheduledMissed(): HubScheduledEvent[] {
  const today = todayStr()
  const rows = hubQueryAll(
    `SELECT * FROM scheduled
     WHERE active = 1
       AND next_due_date < ?
       AND (ignore_missed_until IS NULL OR ignore_missed_until < ?)`,
    [today, today]
  )
  return rows.map(parseScheduledRow)
}

// Get future scheduled events
export function getScheduledFuture(days = 30): HubScheduledEvent[] {
  const today = todayStr()
  const futureDate = addDays(today, days)
  const rows = hubQueryAll(
    `SELECT * FROM scheduled
     WHERE active = 1
       AND next_due_date > ?
       AND next_due_date <= ?
     ORDER BY next_due_date ASC`,
    [today, futureDate]
  )
  return rows.map(parseScheduledRow)
}

// Get all scheduled events with status
export function getAllScheduledWithStatus(): HubScheduledEvent[] {
  const today = todayStr()
  const rows = hubQueryAll(
    `SELECT *,
       CASE
         WHEN next_due_date < ? THEN 'missed'
         WHEN next_due_date = ? THEN 'today'
         ELSE 'future'
       END AS status
     FROM scheduled
     WHERE active = 1
     ORDER BY next_due_date ASC`,
    [today, today]
  )
  return rows.map(r => ({
    ...parseScheduledRow(r),
    status: r.status as 'today' | 'missed' | 'future'
  }))
}

// Complete a scheduled event
export function completeScheduled(id: string, input: HubCompleteInput = {}): void {
  const rows = hubQueryAll('SELECT * FROM scheduled WHERE id = ?', [id])
  if (rows.length === 0) {
    throw new Error(`Scheduled event ${id} not found`)
  }

  const ev = parseScheduledRow(rows[0])
  const today = todayStr()

  // Step 1: Insert event log
  hubExecute(
    `INSERT INTO events (id, date, type, target_id, target_name, detail, notes, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      today,
      ev.type,
      ev.targetId,
      ev.targetName,
      input.detail ?? '',
      input.notes ?? '',
      JSON.stringify(input.meta ?? {})
    ]
  )

  // Step 2: Advance recurrence or delete
  if (ev.single) {
    hubExecute('DELETE FROM scheduled WHERE id = ?', [id])
  } else {
    const freq = ev.frequencyDays ?? 1
    const nextDate = addDays(today, freq)
    hubExecute(
      `UPDATE scheduled
       SET next_due_date = ?, ignore_missed_until = NULL, ignore_today_date = NULL
       WHERE id = ?`,
      [nextDate, id]
    )
  }

  // Step 3: Update last_meal_date for Feeding events
  if (ev.type === 'Feeding' && ev.targetId) {
    hubExecute('UPDATE animals SET last_meal_date = ? WHERE id = ?', [today, ev.targetId])
    hubExecute('UPDATE enclosures SET last_meal_date = ? WHERE id = ?', [today, ev.targetId])
  }

  saveHubDb()
}

// Skip a scheduled event (no log)
export function skipScheduled(id: string): void {
  const rows = hubQueryAll('SELECT * FROM scheduled WHERE id = ?', [id])
  if (rows.length === 0) {
    throw new Error(`Scheduled event ${id} not found`)
  }

  const ev = parseScheduledRow(rows[0])
  const today = todayStr()

  if (ev.single) {
    hubExecute('DELETE FROM scheduled WHERE id = ?', [id])
  } else {
    let nextDate = addDays(today, ev.frequencyDays ?? 1)
    // Safeguard: if calculated date is not future, force tomorrow
    if (nextDate <= today) {
      nextDate = addDays(today, 1)
    }
    hubExecute(
      `UPDATE scheduled
       SET next_due_date = ?, ignore_today_date = NULL, ignore_missed_until = NULL
       WHERE id = ?`,
      [nextDate, id]
    )
  }

  saveHubDb()
}

// Dismiss a scheduled event (hide for today)
export function dismissScheduled(id: string): void {
  const rows = hubQueryAll('SELECT * FROM scheduled WHERE id = ?', [id])
  if (rows.length === 0) return

  const ev = parseScheduledRow(rows[0])

  if (ev.single) {
    hubExecute('DELETE FROM scheduled WHERE id = ?', [id])
  } else {
    hubExecute('UPDATE scheduled SET ignore_today_date = ? WHERE id = ?', [todayStr(), id])
  }

  saveHubDb()
}
