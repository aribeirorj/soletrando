import { matchesExpectedLetter } from '../speech/letterNames'

// Progresso da soletração de uma palavra no Falar e Soletrar. Serve aos dois jeitos de
// corrigir: `attempt` (voz, com até MAX_ATTEMPTS tentativas por letra) e `mark` (botões
// Correto/Incorreto, uma decisão por letra). `spellable` são as letras da palavra, em
// minúsculas e sem espaços.
export const MAX_ATTEMPTS = 3

export type SpellingFeedback =
  | { kind: 'correct'; letter: string }
  | { kind: 'retry'; heard: string; attempt: number }
  | { kind: 'failed'; heard: string | null; expected: string }

export interface SpellingProgressState {
  letterIndex: number
  attempts: number
  wrongIndices: number[]
  hasMistake: boolean
  consecutiveFailedLetters: number
  feedback: SpellingFeedback | null
  // Letras certas na palavra: cada uma vale pontos na hora, mesmo que outra letra erre.
  correctLetters: number
  // Calculado no momento da ação, com as letras da palavra daquele momento.
  finished: boolean
}

export type SpellingProgressAction =
  | { type: 'attempt'; letters: string[]; spellable: string[] }
  | { type: 'mark'; correct: boolean; spellable: string[] }
  | { type: 'reset' }

export const INITIAL_SPELLING_PROGRESS: SpellingProgressState = {
  letterIndex: 0,
  attempts: 0,
  wrongIndices: [],
  hasMistake: false,
  consecutiveFailedLetters: 0,
  feedback: null,
  correctLetters: 0,
  finished: false,
}

function withFinished(state: SpellingProgressState, spellable: string[]): SpellingProgressState {
  return { ...state, finished: state.letterIndex >= spellable.length }
}

function failLetter(state: SpellingProgressState, heard: string | null, expected: string): SpellingProgressState {
  return {
    ...state,
    letterIndex: state.letterIndex + 1,
    attempts: 0,
    wrongIndices: [...state.wrongIndices, state.letterIndex],
    hasMistake: true,
    feedback: { kind: 'failed', heard, expected },
  }
}

function attemptLetter(state: SpellingProgressState, heard: string, spellable: string[]): SpellingProgressState {
  if (state.finished) return state

  const expected = spellable[state.letterIndex]
  if (matchesExpectedLetter(heard, expected)) {
    return {
      ...state,
      letterIndex: state.letterIndex + 1,
      attempts: 0,
      consecutiveFailedLetters: 0,
      correctLetters: state.correctLetters + 1,
      feedback: { kind: 'correct', letter: expected },
    }
  }

  const attempts = state.attempts + 1
  if (attempts < MAX_ATTEMPTS) {
    return { ...state, attempts, feedback: { kind: 'retry', heard, attempt: attempts + 1 } }
  }
  return { ...failLetter(state, heard, expected), consecutiveFailedLetters: state.consecutiveFailedLetters + 1 }
}

export function spellingProgressReducer(
  state: SpellingProgressState,
  action: SpellingProgressAction,
): SpellingProgressState {
  switch (action.type) {
    case 'attempt':
      return action.letters.reduce((current, letter) => {
        const next = attemptLetter(current, letter, action.spellable)
        return next === current ? current : withFinished(next, action.spellable)
      }, state)
    case 'mark': {
      if (state.finished) return state
      const expected = action.spellable[state.letterIndex]
      const next = action.correct
        ? {
            ...state,
            letterIndex: state.letterIndex + 1,
            attempts: 0,
            correctLetters: state.correctLetters + 1,
            feedback: { kind: 'correct' as const, letter: expected },
          }
        : failLetter(state, null, expected)
      return withFinished(next, action.spellable)
    }
    case 'reset':
      return INITIAL_SPELLING_PROGRESS
  }
}
