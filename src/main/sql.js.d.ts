declare module 'sql.js' {
  interface SqlJsStatic {
    Database: typeof Database
  }

  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  interface ParamsObject {
    [key: string]: unknown
  }

  interface Statement {
    bind(params?: unknown[] | ParamsObject): boolean
    step(): boolean
    getAsObject(params?: unknown): Record<string, unknown>
    get(params?: unknown): unknown[]
    free(): boolean
    reset(): void
  }

  class Database {
    constructor(data?: ArrayLike<number> | Buffer | null)
    run(sql: string, params?: unknown[]): Database
    exec(sql: string, params?: unknown[]): QueryExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
    getRowsModified(): number
  }

  interface SqlJsConfig {
    locateFile?: (file: string) => string
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>
  export { Database, Statement, QueryExecResult, SqlJsStatic }
}
