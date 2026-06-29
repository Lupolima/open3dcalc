import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useReducedMotion } from '../useReducedMotion'

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false by default when matchMedia returns no-preference', () => {
    const mq = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when prefers-reduced-motion is reduce', () => {
    const mq = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when prefers-reduced-motion is no-preference', () => {
    const mq = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('listens for change events and updates', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null
    const mq = {
      matches: false,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') changeHandler = handler
      }),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    // Simulate user changing preference
    act(() => {
      changeHandler?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)

    // Simulate switching back
    act(() => {
      changeHandler?.({ matches: false } as MediaQueryListEvent)
    })
    expect(result.current).toBe(false)
  })

  it('cleans up event listener on unmount', () => {
    const mq = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { unmount } = renderHook(() => useReducedMotion())
    unmount()

    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
