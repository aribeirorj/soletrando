import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useDictionaryHint } from './useDictionaryHint'

describe('useDictionaryHint', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('fetches and exposes the definition on success', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [
        { meanings: [{ definitions: [{ definition: 'a small domesticated feline' }] }] },
      ],
    })
    const { result } = renderHook(() => useDictionaryHint())

    await act(async () => {
      await result.current.fetchHint('cat')
    })

    expect(result.current.definition).toBe('a small domesticated feline')
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  test('sets a friendly error when the word is not found', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, json: async () => ({}) })
    const { result } = renderHook(() => useDictionaryHint())

    await act(async () => {
      await result.current.fetchHint('asdfghjkl')
    })

    expect(result.current.definition).toBeNull()
    expect(result.current.error).toBe('dica não disponível para esta palavra')
  })

  test('sets a friendly error when the network request fails', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useDictionaryHint())

    await act(async () => {
      await result.current.fetchHint('cat')
    })

    expect(result.current.error).toBe('dica não disponível para esta palavra')
  })

  test('exposes isLoading as true while the request is in flight', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    ;(fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )
    const { result } = renderHook(() => useDictionaryHint())

    act(() => {
      void result.current.fetchHint('cat')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => [{ meanings: [{ definitions: [{ definition: 'x' }] }] }],
      })
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
