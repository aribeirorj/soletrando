import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { startLetterRecognition } from '../speech/letterRecognition'
import { english } from '../language/english'
import { portuguese } from '../language/portuguese'
import { setLanguage } from '../language/current'
import { SpeakAndSpellGame } from './SpeakAndSpellGame'

vi.mock('../speech/letterRecognition', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../speech/letterRecognition')>()),
  startLetterRecognition: vi.fn(() => () => {}),
}))

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

function playWord(text: string) {
  useGameStore.setState({
    mode: 'falar-soletrar',
    difficulty: 'dificil',
    category: ['drinks'],
    currentWord: { text, difficulty: 'dificil' },
    status: 'jogando',
    score: 0,
    streak: 0,
    turnLength: null,
    questionsAnsweredInTurn: 0,
    correctCount: 0,
    wrongCount: 0,
  })
  render(<SpeakAndSpellGame />)
}

function letterCounter() {
  return screen.getByText(/^Letra \d+ de \d+$/).textContent
}

function clickCorrect(times = 1) {
  for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name: 'Correto' }))
}

beforeEach(() => {
  setLanguage(portuguese)
  speak.mockReset()
  vi.mocked(startLetterRecognition).mockClear()
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() })
})

afterEach(() => {
  setLanguage(english)
  vi.unstubAllGlobals()
})

describe('SpeakAndSpellGame no Soletrando', () => {
  test('starts with the Correto/Incorreto buttons and never turns the microphone on', () => {
    playWord('café')

    expect(screen.getByRole('button', { name: 'Correto' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Voltar a falar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Usar botões Certo/Errado' })).toBeNull()
    expect(startLetterRecognition).not.toHaveBeenCalled()
  })

  test('an accented letter is a single Letra', () => {
    playWord('café')

    expect(letterCounter()).toBe('Letra 1 de 4')
  })

  test('a whole accented word scores 10 points per Letra', () => {
    playWord('café')

    clickCorrect(4)

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(40)
  })

  test('the hyphen is a Letra worth 10 points', () => {
    playWord('guarda-chuva')

    expect(letterCounter()).toBe('Letra 1 de 12')
    clickCorrect(12)

    expect(useGameStore.getState().score).toBe(120)
  })

  test('the space still does not count', () => {
    playWord('água de coco')

    expect(letterCounter()).toBe('Letra 1 de 10')
  })

  test('Ouvir a pronúncia says the letter with its accent, in Brazilian Portuguese', () => {
    playWord('café')
    clickCorrect(3)

    fireEvent.click(screen.getByRole('button', { name: 'Ouvir a pronúncia' }))

    expect(speak.mock.calls[0][0].text).toBe('é com acento agudo')
    expect(speak.mock.calls[0][0].lang).toBe('pt-BR')
  })

  test('Ouvir a pronúncia says "hífen" on the hyphen', () => {
    playWord('guarda-chuva')
    clickCorrect(6)

    fireEvent.click(screen.getByRole('button', { name: 'Ouvir a pronúncia' }))

    expect(speak.mock.calls[0][0].text).toBe('hífen')
  })

  test('a wrong accented letter is named in the result', () => {
    playWord('café')
    clickCorrect(3)

    fireEvent.click(screen.getByRole('button', { name: 'Incorreto' }))

    expect(screen.getByText('Você errou a letra É.')).toBeTruthy()
  })

  test('says nothing about English', () => {
    playWord('café')

    expect(document.body.textContent).not.toMatch(/ingl[eê]s/i)
  })
})
