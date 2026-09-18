import { describe, expect, test, vi } from 'vitest'
import {
  isLetterRecognitionSupported,
  isRecognitionUnavailable,
  startLetterRecognition,
  type LetterRecognitionStatus,
} from './letterRecognition'

describe('letterRecognition without browser support (jsdom)', () => {
  test('reports it is not supported', () => {
    expect(isLetterRecognitionSupported()).toBe(false)
  })

  test('start reports "unsupported" and returns a harmless stop', () => {
    const onStatusChange = vi.fn()
    const onLettersHeard = vi.fn()

    const stop = startLetterRecognition({ onStatusChange, onLettersHeard })

    expect(onStatusChange).toHaveBeenCalledWith('unsupported')
    expect(() => stop()).not.toThrow()
    expect(onLettersHeard).not.toHaveBeenCalled()
  })
})

describe('isRecognitionUnavailable', () => {
  test.each<[LetterRecognitionStatus, boolean]>([
    ['unsupported', true],
    ['mic-denied', true],
    ['no-mic', true],
    ['error', true],
    ['idle', false],
    ['loading', false],
    ['listening', false],
  ])('%s → %s', (status, unavailable) => {
    expect(isRecognitionUnavailable(status)).toBe(unavailable)
  })
})
