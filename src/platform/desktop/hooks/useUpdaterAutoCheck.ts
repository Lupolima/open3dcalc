import { useEffect } from 'react'
import { useUpdaterStore } from '../components/UpdateNotification/UpdaterStore'

const AUTO_CHECK_DELAY_MS = 5_000

/**
 * Auto-initializes updater event listeners and triggers an update check
 * shortly after mount. Cleans up listeners on unmount.
 *
 * Only active when `window.electronAPI` is available (desktop mode).
 */
export function useUpdaterAutoCheck() {
  useEffect(() => {
    if (!window.electronAPI?.updater) return

    const timer = setTimeout(() => {
      useUpdaterStore.getState().checkForUpdates()
    }, AUTO_CHECK_DELAY_MS)

    return () => {
      clearTimeout(timer)
      // Reset the store to idle on unmount so stale listeners don't linger
      useUpdaterStore.getState().dismiss()
    }
  }, [])
}
