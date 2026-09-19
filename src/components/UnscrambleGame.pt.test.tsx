import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { english } from '../language/english'
import { portuguese } from '../language/portuguese'
import { setLanguage } from '../language/current'
import { UnscrambleGame } from './UnscrambleGame'

function availableTiles() {
  return within(screen.getByTestId('available-letters'))
    .getAllByRole('button')
    .map((button) => button.textContent)
}

function place(letters: string[]) {
  for (const letter of letters) {
    fireEvent.click(within(screen.getByTestId('available-letters')).getAllByRole('button', { name: letter })[0])
  }
}

function playWord(text: string) {
  useGameStore.setState({
    mode: 'letras-embaralhadas',
    difficulty: 'dificil',
    category: null,
    currentWord: { text, difficulty: 'dificil' },
    status: 'jogando',
    score: 0,
    streak: 0,
    hintUsedThisQuestion: false,
    turnLength: null,
    questionsAnsweredInTurn: 0,
    correctCount: 0,
    wrongCount: 0,
  })
  render(<UnscrambleGame />)
}

beforeEach(() => {
  setLanguage(portuguese)
})

afterEach(() => {
  setLanguage(english)
})

describe('UnscrambleGame no Soletrando', () => {
  test('an accented letter and the hyphen are tiles of their own', () => {
    playWord('arco-íris')

    expect(availableTiles().sort()).toEqual(['-', 'a', 'c', 'i', 'o', 'r', 'r', 's', 'í'].sort())
  })

  test('placing every tile in order is a right answer', () => {
    playWord('exceção')

    place(['e', 'x', 'c', 'e', 'ç', 'ã', 'o'])

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(30)
  })

  test('the Dica comes from the Portuguese hints', () => {
    playWord('exceção')

    fireEvent.click(screen.getByRole('button', { name: /dica/i }))

    expect(screen.getByText(/^Dica:/).textContent).toContain('foge à regra')
  })
})
