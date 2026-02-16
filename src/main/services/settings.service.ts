import { queryOne, runSql } from '../database'

export function getSetting(key: string): string | null {
  const row = queryOne('SELECT value FROM app_settings WHERE key = ?', [key])
  return row ? (row.value as string) : null
}

export function setSetting(key: string, value: string): void {
  runSql(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  )
}

export function deleteSetting(key: string): void {
  runSql('DELETE FROM app_settings WHERE key = ?', [key])
}
