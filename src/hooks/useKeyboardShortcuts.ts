import { useEffect } from 'react'

export interface ShortcutCallbacks {
  onSave?: () => void
  onHistory?: () => void
  onDashboard?: () => void
  onEscape?: () => void
}

/**
 * Global keyboard shortcuts hook.
 *
 * - Ctrl/Cmd + S → onSave()
 * - Ctrl/Cmd + H → onHistory()
 * - Ctrl/Cmd + D → onDashboard()
 * - Escape       → onEscape()
 *
 * Shortcuts are suppressed when focus is on `<input>`, `<textarea>`, or `<select>`.
 */
export function useKeyboardShortcuts({
  onSave,
  onHistory,
  onDashboard,
  onEscape,
}: ShortcutCallbacks) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Suppress shortcuts when focus is on form elements
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 's') {
        e.preventDefault()
        onSave?.()
        return
      }

      if (mod && e.key === 'h') {
        e.preventDefault()
        onHistory?.()
        return
      }

      if (mod && e.key === 'd') {
        e.preventDefault()
        onDashboard?.()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSave, onHistory, onDashboard, onEscape])
}
