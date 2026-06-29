/**
 * Type declarations for the Electron contextBridge API.
 *
 * These types mirror the API exposed by `electron/preload.ts`
 * and consumed by `src/overrides/db-bridge.ts`.
 */

/** Database operations available through IPC. */
interface ElectronDBApi {
  /** Load a JSON-encoded value from the key-value store by key. */
  load(key: string): Promise<string | null>;

  /** Save a JSON-encoded value to the key-value store. */
  save(key: string, value: string): Promise<void>;

  /** Delete a key and its value from the store. */
  delete(key: string): Promise<void>;

  /** List all keys in the store, sorted alphabetically. */
  listKeys(): Promise<string[]>;

  /**
   * Run a raw SQL query (SELECT / PRAGMA / EXPLAIN only).
   * Write operations must use the dedicated save/delete helpers.
   */
  query(sql: string, params?: unknown[]): Promise<unknown[]>;

  /** Open a save dialog and export the database file. Returns the chosen path. */
  exportDatabase(): Promise<string>;

  /** Import a database from a backup file, replacing the current one. */
  importDatabase(filePath: string): Promise<void>;
}

/** Full Electron API exposed via contextBridge. */
export interface ElectronAPI {
  db: ElectronDBApi;
}

/** Augment the global Window interface. */
declare global {
  interface Window {
    /** Electron context-bridge API. Only available in Electron. */
    electronAPI?: ElectronAPI;
  }
}
