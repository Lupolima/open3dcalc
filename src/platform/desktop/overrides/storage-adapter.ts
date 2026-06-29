/**
 * SQLite Storage Adapter — replaces localStorage in the desktop app.
 * 
 * Implements the same key-value interface as localStorage but backed by
 * SQLite via Electron IPC. All values are JSON-serialized.
 * 
 * Usage in stores:
 *   import { storageAdapter } from '../overrides/storage-adapter'
 *   const data = await storageAdapter.load('my-key')
 *   await storageAdapter.save('my-key', data)
 */

import { dbBridge } from './db-bridge'

export const storageAdapter = {
  /** Load and parse a value. Returns null if key doesn't exist. */
  async load<T = unknown>(key: string): Promise<T | null> {
    try {
      return await dbBridge.load<T>(key)
    } catch {
      return null
    }
  },

  /** Save a value (auto-serialized to JSON). Fire-and-forget. */
  save(key: string, value: unknown): void {
    dbBridge.save(key, value).catch((error) => {
      console.error(`[storageAdapter] Failed to save "${key}":`, error)
    })
  },

  /** Delete a key. */
  async delete(key: string): Promise<void> {
    await dbBridge.delete(key)
  },

  /** List all stored keys. */
  async listKeys(): Promise<string[]> {
    return dbBridge.listKeys()
  },

  /** Check if a key exists. */
  async has(key: string): Promise<boolean> {
    const value = await this.load(key)
    return value !== null
  },
} as const
