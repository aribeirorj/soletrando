import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { ListenAndTypeGame } from './ListenAndTypeGame'

class FakeUtterance {
  text: string
  lang = ''
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

const speak = vi.fn<(utterance: FakeUtterance) => void>()

function stubSpeechSynthesis() {
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() })
}

function answer(text: string) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Check' }))
}

beforeEach(() => {
  speak.mockReset()
  useGameStore.setState({
    mode: 'ouvir-digitar',
    difficulty: 'facil',
    category: null,
    currentWord: { text: 'cat', difficulty: 'facil' },
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ListenAndTypeGame (Spelling Bee)', () => {
  test('asks for the word with an English label', () => {
    render(<ListenAndTypeGame />)

    expect(screen.getByPlaceholderText('Type the word')).toBeTruthy()
  })

  test('narrates the word in American English', () => {
    stubSpeechSynthesis()
    render(<ListenAndTypeGame />)

    expect(speak).toHaveBeenCalledTimes(1)
    expect(speak.mock.calls[0][0].text).toBe('cat')
    expect(speak.mock.calls[0][0].lang).toBe('en-US')
  })

  test('a right answer ignores case and scores the difficulty points', () => {
    render(<ListenAndTypeGame />)

    answer('  CAT ')

    expect(screen.getByText('Correct!')).toBeTruthy()
    expect(useGameStore.getState().score).toBe(10)
  })

  test('a wrong answer shows the right word', () => {
    render(<ListenAndTypeGame />)

    answer('kat')

    expect(screen.getByText('Wrong. The correct word was: cat')).toBeTruthy()
  })

  test('has no accent keys', () => {
    render(<ListenAndTypeGame />)

    expect(screen.queryByRole('button', { name: 'é' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'ç' })).toBeNull()
  })
})
