import { contextBridge, ipcRenderer } from 'electron';

/**
 * Type-safe API exposed to the renderer process via contextBridge.
 *
 * All methods are async — they return Promises that resolve/reject
 * based on the IPC handler response from the main process.
 */
const electronAPI = {
  db: {
    /** Load a value from the key-value store by key. Returns null if not found. */
    load: (key: string): Promise<string | null> =>
      ipcRenderer.invoke('db:load', key),

    /** Save a key-value pair to the store. Creates or updates. */
    save: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke('db:save', key, value),

    /** Delete a key and its value from the store. */
    delete: (key: string): Promise<void> =>
      ipcRenderer.invoke('db:delete', key),

    /** List all keys in the key-value store, sorted alphabetically. */
    listKeys: (): Promise<string[]> =>
      ipcRenderer.invoke('db:list-keys'),

    /**
     * Execute a raw SQL query (SELECT / PRAGMA / EXPLAIN only).
     * Write operations must go through the dedicated save/delete methods.
     */
    query: (sql: string, params?: unknown[]): Promise<unknown[]> =>
      ipcRenderer.invoke('db:query', sql, params),

    /**
     * Export the database file to a user-chosen location.
     * Returns the destination file path on success.
     */
    exportDatabase: (): Promise<string> =>
      ipcRenderer.invoke('db:export'),

    /**
     * Import a database from an external backup file.
     * Replaces the current database. A backup of the current DB
     * is created before the replacement.
     */
    importDatabase: (filePath: string): Promise<void> =>
      ipcRenderer.invoke('db:import', filePath),
  },
} as const;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
