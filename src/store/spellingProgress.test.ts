import { describe, expect, test } from 'vitest'
import {
  INITIAL_SPELLING_PROGRESS,
  spellingProgressReducer,
  type SpellingProgressAction,
  type SpellingProgressState,
} from './spellingProgress'

const CAT = ['c', 'a', 't']

function run(actions: SpellingProgressAction[]): SpellingProgressState {
  return actions.reduce(spellingProgressReducer, INITIAL_SPELLING_PROGRESS)
}

const say = (...letters: string[]): SpellingProgressAction => ({ type: 'attempt', letters, spellable: CAT })
const mark = (correct: boolean): SpellingProgressAction => ({ type: 'mark', correct, spellable: CAT })

describe('spellingProgressReducer — voice attempts', () => {
  test('a right letter advances to the next one', () => {
    const state = run([say('c')])

    expect(state.letterIndex).toBe(1)
    expect(state.feedback).toEqual({ kind: 'correct', letter: 'c' })
    expect(state.hasMistake).toBe(false)
    expect(state.finished).toBe(false)
  })

  test('a wrong letter asks to try again without advancing', () => {
    const state = run([say('k')])

    expect(state.letterIndex).toBe(0)
    expect(state.attempts).toBe(1)
    expect(state.feedback).toEqual({ kind: 'retry', heard: 'k', attempt: 2 })
  })

  test('the second wrong try announces the third attempt', () => {
    const state = run([say('k'), say('g')])

    expect(state.feedback).toEqual({ kind: 'retry', heard: 'g', attempt: 3 })
  })

  test('getting it right on the third try counts as right', () => {
    const state = run([say('k'), say('k'), say('c')])

    expect(state.letterIndex).toBe(1)
    expect(state.attempts).toBe(0)
    expect(state.hasMistake).toBe(false)
    expect(state.wrongIndices).toEqual([])
  })

  test('three wrong tries mark the letter wrong and advance', () => {
    const state = run([say('k'), say('k'), say('k')])

    expect(state.letterIndex).toBe(1)
    expect(state.attempts).toBe(0)
    expect(state.wrongIndices).toEqual([0])
    expect(state.hasMistake).toBe(true)
    expect(state.feedback).toEqual({ kind: 'failed', heard: 'k', expected: 'c' })
  })

  test('several letters in one utterance are corrected in sequence', () => {
    const state = run([say('c', 'a', 't')])

    expect(state.finished).toBe(true)
    expect(state.hasMistake).toBe(false)
  })

  test('counts letters that failed in a row and resets on a right letter', () => {
    const twoFailed = run([say('k', 'k', 'k'), say('k', 'k', 'k')])
    expect(twoFailed.consecutiveFailedLetters).toBe(2)

    const recovered = spellingProgressReducer(twoFailed, say('t'))
    expect(recovered.consecutiveFailedLetters).toBe(0)
  })

  test('ignores letters after the word is finished', () => {
    const finished = run([say('c', 'a', 't')])

    expect(spellingProgressReducer(finished, say('x'))).toBe(finished)
  })
})

describe('spellingProgressReducer — Correto/Incorreto buttons', () => {
  test('Correto advances without a mistake', () => {
    const state = run([mark(true)])

    expect(state.letterIndex).toBe(1)
    expect(state.hasMistake).toBe(false)
    expect(state.feedback).toEqual({ kind: 'correct', letter: 'c' })
  })

  test('Incorreto marks the letter wrong and advances at once', () => {
    const state = run([mark(false)])

    expect(state.letterIndex).toBe(1)
    expect(state.wrongIndices).toEqual([0])
    expect(state.hasMistake).toBe(true)
    expect(state.feedback).toEqual({ kind: 'failed', heard: null, expected: 'c' })
  })

  test('marking every letter finishes the word', () => {
    const state = run([mark(true), mark(false), mark(true)])

    expect(state.finished).toBe(true)
    expect(state.wrongIndices).toEqual([1])
  })

  test('reset starts the word over', () => {
    const state = run([mark(false), { type: 'reset' }])

    expect(state).toEqual(INITIAL_SPELLING_PROGRESS)
  })
})

describe('spellingProgressReducer — letras certas (pontuação)', () => {
  test.each<[string, number, SpellingProgressAction[]]>([
    ['a right letter', 1, [say('c')]],
    ['right on the third try', 1, [say('k'), say('k'), say('c')]],
    ['three wrong tries', 0, [say('k', 'k', 'k')]],
    ['a whole word in one utterance', 3, [say('c', 'a', 't')]],
    ['one wrong letter among right ones', 2, [say('k', 'k', 'k', 'a', 't')]],
    ['Correto', 1, [mark(true)]],
    ['Incorreto', 0, [mark(false)]],
    ['Correto, Incorreto, Correto', 2, [mark(true), mark(false), mark(true)]],
    ['reset', 0, [say('c', 'a'), { type: 'reset' }]],
  ])('%s → %i correct letters', (_, expected, actions) => {
    expect(run(actions).correctLetters).toBe(expected)
  })
})

describe('spellingProgressReducer — sotaque brasileiro', () => {
  const TOP = ['t', 'o', 'p']
  const GO = ['g', 'o']

  test('accepts the Brazilian "tchí", heard as G, when T is expected', () => {
    const state = spellingProgressReducer(INITIAL_SPELLING_PROGRESS, { type: 'attempt', letters: ['g'], spellable: TOP })

    expect(state.letterIndex).toBe(1)
    expect(state.correctLetters).toBe(1)
    expect(state.feedback).toEqual({ kind: 'correct', letter: 't' })
  })

  test('does not accept T when G is expected', () => {
    const state = spellingProgressReducer(INITIAL_SPELLING_PROGRESS, { type: 'attempt', letters: ['t'], spellable: GO })

    expect(state.letterIndex).toBe(0)
    expect(state.feedback).toEqual({ kind: 'retry', heard: 't', attempt: 2 })
  })
})
