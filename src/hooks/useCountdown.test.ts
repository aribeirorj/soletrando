import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('decrements the remaining seconds every second', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 5 }))

    expect(result.current.remaining).toBe(5)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remaining).toBe(4)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(2)
  })

  test('calls onExpire exactly once when it reaches zero', () => {
    const onExpire = vi.fn()
    renderHook(() => useCountdown({ seconds: 2, onExpire }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  test('reset restarts the countdown with a new duration', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 3 }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(1)

    act(() => {
      result.current.reset(10)
    })
    expect(result.current.remaining).toBe(10)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remaining).toBe(9)
  })
})
