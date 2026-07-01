import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUpdaterAutoCheck } from '../useUpdaterAutoCheck'
import { useUpdaterStore } from '../../components/UpdateNotification/UpdaterStore'

// ── Mocks ──────────────────────────────────────────────────────────

function createMockUpdater(): ElectronUpdaterApi {
  return {
    check: vi.fn().mockResolvedValue({ available: false }),
    download: vi.fn().mockResolvedValue(undefined),
    install: vi.fn().mockResolvedValue(undefined),
    skip: vi.fn().mockResolvedValue(undefined),
    getStatus: vi.fn().mockResolvedValue({ status: 'idle' }),
    onProgress: vi.fn().mockReturnValue(vi.fn()),
    onAvailable: vi.fn().mockReturnValue(vi.fn()),
    onDownloaded: vi.fn().mockReturnValue(vi.fn()),
    onError: vi.fn().mockReturnValue(vi.fn()),
    onNotAvailable: vi.fn().mockReturnValue(vi.fn()),
    onChecking: vi.fn().mockReturnValue(vi.fn()),
  }
}

function mockElectronAPI(updater?: ElectronUpdaterApi) {
  Object.defineProperty(window, 'electronAPI', {
    value: updater ? { db: {} as ElectronDBApi, updater } : undefined,
    writable: true,
    configurable: true,
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  useUpdaterStore.setState({
    status: 'idle',
    version: null,
    releaseNotes: null,
    progress: 0,
    downloadSpeed: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    errorMessage: null,
    skippedVersion: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete (window as Partial<Window>).electronAPI
})

// ── Tests ──────────────────────────────────────────────────────────

describe('useUpdaterAutoCheck', () => {
  it('does nothing when electronAPI is not available', () => {
    mockElectronAPI(undefined)
    renderHook(() => useUpdaterAutoCheck())

    act(() => {
      vi.advanceTimersByTime(6_000)
    })

    expect(useUpdaterStore.getState().status).toBe('idle')
  })

  it('calls checkForUpdates after 5 seconds when electronAPI is available', async () => {
    const mockUpdater = createMockUpdater()
    mockElectronAPI(mockUpdater)

    renderHook(() => useUpdaterAutoCheck())

    // Before the delay — should still be idle
    act(() => {
      vi.advanceTimersByTime(4_000)
    })
    expect(mockUpdater.check).not.toHaveBeenCalled()

    // After the delay — should trigger check
    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })

    expect(mockUpdater.check).toHaveBeenCalledOnce()
  })

  it('resets store to idle on unmount', () => {
    const mockUpdater = createMockUpdater()
    mockElectronAPI(mockUpdater)

    const { unmount } = renderHook(() => useUpdaterAutoCheck())

    // Simulate some state change
    useUpdaterStore.setState({ status: 'checking' })

    unmount()

    expect(useUpdaterStore.getState().status).toBe('idle')
  })

  it('clears the timer on unmount before it fires', () => {
    const mockUpdater = createMockUpdater()
    mockElectronAPI(mockUpdater)

    const { unmount } = renderHook(() => useUpdaterAutoCheck())

    // Unmount before the 5s delay
    act(() => {
      vi.advanceTimersByTime(3_000)
    })
    unmount()

    // Advance past the original delay — check should NOT be called
    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    expect(mockUpdater.check).not.toHaveBeenCalled()
  })

  it('only runs once even with multiple renders', () => {
    const mockUpdater = createMockUpdater()
    mockElectronAPI(mockUpdater)

    const { rerender } = renderHook(() => useUpdaterAutoCheck())
    rerender()

    act(() => {
      vi.advanceTimersByTime(6_000)
    })

    // Should only trigger once due to empty dependency array
    expect(mockUpdater.check).toHaveBeenCalledOnce()
  })
})
