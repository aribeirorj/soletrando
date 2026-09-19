import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { UnscrambleGame } from './UnscrambleGame'

function tiles(testId: 'available-letters' | 'placed-letters') {
  return within(screen.getByTestId(testId))
    .queryAllByRole('button')
    .map((button) => button.textContent)
}

function place(letters: string[]) {
  for (const letter of letters) {
    fireEvent.click(within(screen.getByTestId('available-letters')).getAllByRole('button', { name: letter })[0])
  }
}

beforeEach(() => {
  useGameStore.setState({
    mode: 'letras-embaralhadas',
    difficulty: 'medio',
    category: null,
    currentWord: { text: 'apple', difficulty: 'medio' },
    status: 'jogando',
    score: 0,
    streak: 0,
    hintUsedThisQuestion: false,
    turnLength: null,
    questionsAnsweredInTurn: 0,
    correctCount: 0,
    wrongCount: 0,
  })
})

describe('UnscrambleGame (Spelling Bee)', () => {
  test('offers one tile per letter of the word, shuffled', () => {
    render(<UnscrambleGame />)

    expect(tiles('available-letters').sort()).toEqual(['a', 'e', 'l', 'p', 'p'])
    expect(tiles('available-letters').join('')).not.toBe('apple')
    expect(tiles('placed-letters')).toEqual([])
  })

  test('placing every letter in order submits a right answer', () => {
    render(<UnscrambleGame />)

    place(['a', 'p', 'p', 'l', 'e'])

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(20)
  })

  test('placing every letter in the wrong order submits a wrong answer', () => {
    render(<UnscrambleGame />)

    place(['p', 'a', 'p', 'l', 'e'])

    expect(useGameStore.getState().status).toBe('errou')
  })

  test('does not submit before every letter is placed', () => {
    render(<UnscrambleGame />)

    place(['a', 'p', 'p', 'l'])

    expect(useGameStore.getState().status).toBe('jogando')
    expect(tiles('placed-letters')).toEqual(['a', 'p', 'p', 'l'])
  })
})
