import { describe, expect, test } from 'vitest'
import {
  INITIAL_HEARD_LETTERS,
  heardLettersReducer,
  type HeardLettersAction,
  type HeardLettersState,
} from './heardLetters'

function run(actions: HeardLettersAction[]): HeardLettersState {
  return actions.reduce(heardLettersReducer, INITIAL_HEARD_LETTERS)
}

const partial = (letters: string[], active = true): HeardLettersAction => ({ type: 'partial', letters, active })
const final = (letters: string[], active = true): HeardLettersAction => ({ type: 'final', letters, active })

describe('heardLettersReducer', () => {
  test('a partial result shows the letter as a preview', () => {
    const state = run([partial(['c'])])

    expect(state.previewLetter).toBe('c')
    expect(state.confirmedLetter).toBeNull()
    expect(state.history).toEqual([])
  })

  test('the final result confirms the letter and adds it to the history', () => {
    const state = run([partial(['c']), final(['c'])])

    expect(state.previewLetter).toBeNull()
    expect(state.confirmedLetter).toBe('c')
    expect(state.history).toEqual(['c'])
  })

  test('the final result wins over a different partial', () => {
    const state = run([partial(['b']), final(['d'])])

    expect(state.confirmedLetter).toBe('d')
    expect(state.history).toEqual(['d'])
  })

  test('a final result without a partial still counts for the current letter', () => {
    const state = run([final(['a'])])

    expect(state.confirmedLetter).toBe('a')
    expect(state.history).toEqual(['a'])
  })

  test('a final that arrives after the teacher advanced goes only to the history', () => {
    const state = run([partial(['c']), { type: 'letter-changed' }, final(['c'])])

    expect(state.previewLetter).toBeNull()
    expect(state.confirmedLetter).toBeNull()
    expect(state.history).toEqual(['c'])
  })

  test('a final that arrives after the word changed is discarded', () => {
    const state = run([final(['x']), partial(['c']), { type: 'question-changed' }, final(['c'])])

    expect(state.confirmedLetter).toBeNull()
    expect(state.history).toEqual([])
  })

  test('changing letter clears the balloon but keeps the history', () => {
    const state = run([final(['c']), { type: 'letter-changed' }])

    expect(state.confirmedLetter).toBeNull()
    expect(state.previewLetter).toBeNull()
    expect(state.history).toEqual(['c'])
  })

  test('changing word clears everything', () => {
    const state = run([final(['c']), partial(['a']), { type: 'question-changed' }])

    expect(state.confirmedLetter).toBeNull()
    expect(state.previewLetter).toBeNull()
    expect(state.history).toEqual([])
  })

  test('an empty final clears the preview and keeps the previous confirmed letter', () => {
    const state = run([final(['c']), partial(['a']), final([])])

    expect(state.previewLetter).toBeNull()
    expect(state.confirmedLetter).toBe('c')
    expect(state.history).toEqual(['c'])
  })

  test('speech that started while the game was not active is ignored', () => {
    const state = run([partial(['c'], false), final(['c'], true)])

    expect(state.confirmedLetter).toBeNull()
    expect(state.history).toEqual([])
  })

  test('a final without a partial while the game is not active is ignored', () => {
    const state = run([final(['c'], false)])

    expect(state.history).toEqual([])
  })

  test('spelling several letters at once shows the last one and records all of them', () => {
    const state = run([partial(['c']), partial(['c', 'a']), final(['c', 'a', 't'])])

    expect(state.confirmedLetter).toBe('t')
    expect(state.history).toEqual(['c', 'a', 't'])
  })

  test('the next utterance after a final starts fresh', () => {
    const state = run([partial(['c']), { type: 'letter-changed' }, final(['c']), partial(['a'])])

    expect(state.previewLetter).toBe('a')
  })
})
