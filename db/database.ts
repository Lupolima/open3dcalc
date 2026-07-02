import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema/index.js'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// ESM compatibility: __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Initialises the SQLite database, runs pending migrations (raw SQL files),
 * and returns a Drizzle ORM instance.
 *
 * The database file is stored at the path returned by `getDbPath()`.
 * Migrations are loaded from `db/migrations/` relative to this file.
 *
 * Usage (Electron main process):
 *   import { initDatabase } from './db/database'
 *   const db = initDatabase()
 */

/**
 * Resolves Electron's userData path via dynamic require for ESM compatibility.
 * Returns null when not running inside Electron (test/CLI environments).
 */
function getElectronUserData(): string | null {
  try {
    // Dynamic require for ESM compatibility
    const require = createRequire(import.meta.url)
    const electron = require('electron')
    return electron?.app?.getPath('userData') ?? null
  } catch {
    return null
  }
}

export function getDbPath(): string {
  const testPath = process.env['OPEN3DCALC_DB_PATH']
  if (testPath) return testPath

  // In Electron, use app.getPath('userData') for a platform-standard location
  const userData = getElectronUserData()
  if (userData) {
    const dbPath = path.join(userData, 'open3dcalc.db')
    return dbPath
  }

  // CLI / test fallback
  const fallbackPath = path.join(__dirname, '..', '..', '..', 'open3dcalc.db')
  console.log('[db] No Electron userData available, using fallback:', fallbackPath)
  return fallbackPath
}

/**
 * Reads and executes SQL migration files in order.
 * Each migration file must be idempotent or guarded with IF NOT EXISTS.
 */
function runMigrations(sqlite: Database.Database): void {
  const migrationsDir = path.join(__dirname, '..', '..', '..', 'db', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.warn('[db] Migrations directory not found at:', migrationsDir)
    console.warn('[db] Tables will NOT be created. The database may be empty.')
    return
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
    sqlite.exec(sql)
  }
}

// Singleton cache — initDatabase() should only be called once
let drizzleInstance: ReturnType<typeof drizzle> | null = null

/**
 * Creates and returns a Drizzle ORM instance backed by better-sqlite3.
 *
 * In Electron's main process: call initDatabase() once at startup.
 * In tests: call initDatabase(':memory:') for an isolated in-memory DB.
 */
export function initDatabase(dbPath?: string): ReturnType<typeof drizzle> {
  if (drizzleInstance) return drizzleInstance

  try {
    const resolvedPath = dbPath ?? getDbPath()
    console.log('[db] Opening database at:', resolvedPath)

    const sqlite = new Database(resolvedPath)

    // Recommended performance pragmas for better-sqlite3
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    sqlite.pragma('busy_timeout = 5000')

    runMigrations(sqlite)

    drizzleInstance = drizzle(sqlite, { schema })
    console.log('[db] Database initialized successfully')
    return drizzleInstance
  } catch (error) {
    console.error('[db] Failed to initialize database:', error)
    throw error
  }
}

// Re-export schema for convenience
export * as schema from './schema/index.js'
