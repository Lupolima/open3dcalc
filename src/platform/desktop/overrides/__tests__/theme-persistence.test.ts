/**
 * @vitest-environment jsdom
 *
 * Tests for theme-persistence module.
 * Uses jsdom to simulate browser + Electron IPC environment.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadThemePreference, saveThemePreference } from '../theme-persistence'

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockDb = {
  load: vi.fn(),
  save: vi.fn(),
}

function mockElectron(available: boolean): void {
  if (available) {
    ;(window as any).electronAPI = { db: mockDb }
  } else {
    delete (window as any).electronAPI
  }
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('theme-persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockDb.load.mockResolvedValue(null)
    mockDb.save.mockResolvedValue(undefined)
  })

  // ── loadThemePreference ────────────────────────────────────────────

  describe('loadThemePreference', () => {
    it('returns default "system" when no stored value exists', async () => {
      mockElectron(false)
      const theme = await loadThemePreference()
      expect(theme).toBe('system')
    })

    it('loads from localStorage when Electron is unavailable', async () => {
      mockElectron(false)
      localStorage.setItem('open3dcalc_theme', 'dark')
      const theme = await loadThemePreference()
      expect(theme).toBe('dark')
    })

    it('loads from SQLite when Electron is available', async () => {
      mockElectron(true)
      mockDb.load.mockResolvedValue('light')
      const theme = await loadThemePreference()
      expect(theme).toBe('light')
      expect(mockDb.load).toHaveBeenCalledWith('open3dcalc_theme')
    })

    it('syncs SQLite value to localStorage on load', async () => {
      mockElectron(true)
      mockDb.load.mockResolvedValue('dark')
      await loadThemePreference()
      expect(localStorage.getItem('open3dcalc_theme')).toBe('dark')
    })

    it('falls back to localStorage when SQLite returns null', async () => {
      mockElectron(true)
      mockDb.load.mockResolvedValue(null)
      localStorage.setItem('open3dcalc_theme', 'light')
      const theme = await loadThemePreference()
      expect(theme).toBe('light')
    })

    it('falls back to localStorage when SQLite throws', async () => {
      mockElectron(true)
      mockDb.load.mockRejectedValue(new Error('IPC failed'))
      localStorage.setItem('open3dcalc_theme', 'dark')
      const theme = await loadThemePreference()
      expect(theme).toBe('dark')
    })

    it('returns "system" for invalid stored values', async () => {
      mockElectron(false)
      localStorage.setItem('open3dcalc_theme', 'neon')
      const theme = await loadThemePreference()
      expect(theme).toBe('system')
    })

    it('returns "system" for invalid SQLite values', async () => {
      mockElectron(true)
      mockDb.load.mockResolvedValue('invalid')
      const theme = await loadThemePreference()
      expect(theme).toBe('system')
    })

    it('pushes to SQLite in background when loaded from localStorage', async () => {
      mockElectron(true)
      mockDb.load.mockResolvedValue(null)
      localStorage.setItem('open3dcalc_theme', 'dark')
      await loadThemePreference()
      expect(mockDb.save).toHaveBeenCalledWith('open3dcalc_theme', 'dark')
    })
  })

  // ── saveThemePreference ────────────────────────────────────────────

  describe('saveThemePreference', () => {
    it('saves to localStorage', async () => {
      mockElectron(false)
      await saveThemePreference('dark')
      expect(localStorage.getItem('open3dcalc_theme')).toBe('dark')
    })

    it('saves to SQLite when Electron is available', async () => {
      mockElectron(true)
      await saveThemePreference('light')
      expect(mockDb.save).toHaveBeenCalledWith('open3dcalc_theme', 'light')
    })

    it('does not throw when Electron save fails', async () => {
      mockElectron(true)
      mockDb.save.mockRejectedValue(new Error('IPC error'))
      await expect(saveThemePreference('dark')).resolves.toBeUndefined()
    })

    it('rejects invalid theme modes', async () => {
      mockElectron(false)
      await saveThemePreference('neon' as any)
      expect(localStorage.getItem('open3dcalc_theme')).toBeNull()
    })

    it('saves all valid theme modes', async () => {
      mockElectron(false)
      for (const mode of ['dark', 'light', 'system'] as const) {
        await saveThemePreference(mode)
        expect(localStorage.getItem('open3dcalc_theme')).toBe(mode)
      }
    })
  })
})
