import { describe, expect, test } from 'vitest'
import { INITIAL_SPELLING_PROGRESS, spellingProgressReducer } from './spellingProgress'

const spellable = ['c', 'a', 'f', 'é']

describe('spellingProgressReducer — matches', () => {
  test('uses the given comparison for each heard Letra', () => {
    const exact = (heard: string, expected: string) => heard === expected

    const state = spellingProgressReducer(INITIAL_SPELLING_PROGRESS, {
      type: 'attempt',
      letters: ['c', 'a', 'f', 'é'],
      spellable,
      matches: exact,
    })

    expect(state.correctLetters).toBe(4)
    expect(state.finished).toBe(true)
    expect(state.hasMistake).toBe(false)
  })

  test('a letter without its accent is a wrong try', () => {
    const exact = (heard: string, expected: string) => heard === expected
    const start = { ...INITIAL_SPELLING_PROGRESS, letterIndex: 3 }

    const state = spellingProgressReducer(start, { type: 'attempt', letters: ['e'], spellable, matches: exact })

    expect(state.letterIndex).toBe(3)
    expect(state.feedback).toEqual({ kind: 'retry', heard: 'e', attempt: 2 })
  })

  test('without a comparison, keeps the Spelling Bee accent tolerance', () => {
    const state = spellingProgressReducer(INITIAL_SPELLING_PROGRESS, {
      type: 'attempt',
      letters: ['g'],
      spellable: ['t'],
    })

    expect(state.correctLetters).toBe(1)
  })
})
