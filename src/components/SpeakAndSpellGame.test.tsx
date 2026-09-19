import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import {
  startLetterRecognition,
  type LetterRecognitionHandlers,
  type LetterRecognitionStatus,
} from '../speech/letterRecognition'
import { SpeakAndSpellGame } from './SpeakAndSpellGame'

vi.mock('../speech/letterRecognition', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../speech/letterRecognition')>()),
  startLetterRecognition: vi.fn(),
}))

const stop = vi.fn()
let handlers: LetterRecognitionHandlers

function recognitionStartsWith(status: LetterRecognitionStatus) {
  vi.mocked(startLetterRecognition).mockImplementation((h) => {
    handlers = h
    h.onStatusChange(status)
    return stop
  })
}

function hear(letters: string[], isFinal = true) {
  act(() => handlers.onLettersHeard(letters, isFinal))
}

function balloon() {
  return screen.getByTestId('heard-letter')
}

function correctButton() {
  return screen.queryByRole('button', { name: 'Correct' })
}

function clickCorrect() {
  fireEvent.click(screen.getByRole('button', { name: 'Correct' }))
}

function clickIncorrect() {
  fireEvent.click(screen.getByRole('button', { name: 'Incorrect' }))
}

function letterCounter() {
  return screen.getByText(/^Letter \d+ of \d+$/).textContent
}

beforeEach(() => {
  stop.mockReset()
  vi.mocked(startLetterRecognition).mockReset()
  recognitionStartsWith('listening')
  useGameStore.setState({
    mode: 'falar-soletrar',
    difficulty: 'dificil',
    category: ['colors'],
    currentWord: { text: 'cat', difficulty: 'dificil' },
    status: 'jogando',
    score: 0,
    streak: 0,
    turnLength: null,
    questionsAnsweredInTurn: 0,
    correctCount: 0,
    wrongCount: 0,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('SpeakAndSpellGame — correção pela voz', () => {
  test('hides the Correto/Incorreto buttons while the microphone works', () => {
    render(<SpeakAndSpellGame />)

    expect(screen.getByText('Listening…')).toBeTruthy()
    expect(correctButton()).toBeNull()
  })

  test('a right letter confirms and moves to the next one', () => {
    render(<SpeakAndSpellGame />)

    hear(['c'])

    expect(letterCounter()).toBe('Letter 2 of 3')
    expect(balloon().textContent).toContain('C')
    expect(balloon().textContent).toContain('matches')
  })

  test('a wrong letter asks to try again and stays on the letter', () => {
    render(<SpeakAndSpellGame />)

    hear(['k'])

    expect(letterCounter()).toBe('Letter 1 of 3')
    expect(balloon().textContent).toContain('K')
    expect(balloon().textContent).toContain('Tente de novo (2 de 3)')
  })

  test('getting the letter right within 3 tries still wins the word', () => {
    render(<SpeakAndSpellGame />)

    hear(['k'])
    hear(['k'])
    hear(['c'])
    hear(['a'])
    hear(['t'])

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(30)
  })

  test('three wrong tries show the right letter; the other letters keep their points', () => {
    render(<SpeakAndSpellGame />)

    hear(['k'])
    hear(['k'])
    hear(['k'])

    expect(letterCounter()).toBe('Letter 2 of 3')
    expect(balloon().textContent).toContain('A letra certa era C')

    hear(['a', 't'])

    expect(useGameStore.getState().status).toBe('errou')
    expect(useGameStore.getState().score).toBe(20)
    expect(useGameStore.getState().correctCount).toBe(0)
    expect(useGameStore.getState().wrongCount).toBe(1)
  })

  test('each right letter adds its points to the scoreboard right away', () => {
    render(<SpeakAndSpellGame />)

    hear(['c'])
    expect(useGameStore.getState().score).toBe(10)
    expect(screen.getByText('Points: 10')).toBeTruthy()

    hear(['k'])
    expect(useGameStore.getState().score).toBe(10)

    hear(['a'])
    expect(useGameStore.getState().score).toBe(20)
  })

  test('the last letter also scores and the word counts as correct', () => {
    render(<SpeakAndSpellGame />)

    hear(['c'])
    hear(['a'])
    hear(['t'])

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(30)
    expect(useGameStore.getState().correctCount).toBe(1)
  })

  test('spelling several letters at once corrects them in sequence', () => {
    render(<SpeakAndSpellGame />)

    hear(['c', 'a', 't'])

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(30)
  })

  test('shows a preview while the student is still speaking', () => {
    render(<SpeakAndSpellGame />)

    hear(['c'], false)

    expect(balloon().textContent).toContain('C')
    expect(letterCounter()).toBe('Letter 1 of 3')
  })

  test('lists every letter heard in the question', () => {
    render(<SpeakAndSpellGame />)

    hear(['c'])
    hear(['k'])

    expect(screen.getByText('Heard: C · K')).toBeTruthy()
  })

  test('starts fresh when the word changes', () => {
    render(<SpeakAndSpellGame />)
    hear(['c'])

    act(() => useGameStore.setState({ currentWord: { text: 'dog', difficulty: 'dificil' } }))

    expect(letterCounter()).toBe('Letter 1 of 3')
    expect(screen.queryByText(/Heard:/)).toBeNull()
    expect(balloon().textContent).toContain('—')
  })

  test('suggests the buttons after two letters in a row fail', () => {
    render(<SpeakAndSpellGame />)

    hear(['k', 'k', 'k'])
    expect(screen.queryByText(/O microfone não está me ajudando\?/)).toBeNull()

    hear(['k', 'k', 'k'])
    expect(screen.getByText(/O microfone não está me ajudando\?/)).toBeTruthy()
  })

  test('switching to the buttons turns the microphone off, and it can come back', () => {
    render(<SpeakAndSpellGame />)

    fireEvent.click(screen.getByRole('button', { name: 'Use Right/Wrong buttons' }))

    expect(stop).toHaveBeenCalled()
    expect(correctButton()).toBeTruthy()
    expect(screen.queryByText('Listening…')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Back to speaking' }))

    expect(startLetterRecognition).toHaveBeenCalledTimes(2)
    expect(correctButton()).toBeNull()
  })

  test('stops listening when the game screen closes', () => {
    const { unmount } = render(<SpeakAndSpellGame />)

    unmount()

    expect(stop).toHaveBeenCalled()
  })
})

describe('SpeakAndSpellGame — sem microfone', () => {
  test('shows the Correto/Incorreto buttons when the microphone is blocked', () => {
    recognitionStartsWith('mic-denied')
    render(<SpeakAndSpellGame />)

    expect(screen.getByText('Microfone bloqueado')).toBeTruthy()
    expect(screen.queryByTestId('heard-letter')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Back to speaking' })).toBeNull()

    clickCorrect()
    clickCorrect()
    clickCorrect()

    expect(useGameStore.getState().status).toBe('acertou')
    expect(useGameStore.getState().score).toBe(30)
  })

  test('falls back to the buttons when recognition fails to start', () => {
    vi.mocked(startLetterRecognition).mockImplementation(() => {
      throw new Error('boom')
    })
    render(<SpeakAndSpellGame />)

    expect(screen.getByText('Não foi possível ativar o reconhecimento de voz')).toBeTruthy()

    clickCorrect()
    clickCorrect()
    clickCorrect()

    expect(useGameStore.getState().status).toBe('acertou')
  })

  test('Incorreto marks the letter wrong; the other letters keep their points', () => {
    recognitionStartsWith('no-mic')
    render(<SpeakAndSpellGame />)

    clickIncorrect()
    expect(screen.getByText('Essa letra ficou incorreta.')).toBeTruthy()
    expect(useGameStore.getState().score).toBe(0)

    clickCorrect()
    expect(useGameStore.getState().score).toBe(10)

    clickCorrect()

    expect(useGameStore.getState().status).toBe('errou')
    expect(useGameStore.getState().score).toBe(20)
  })
})

describe('SpeakAndSpellGame — avanço automático', () => {
  test('moves to the next word 2 seconds after getting it right', () => {
    vi.useFakeTimers()
    render(<SpeakAndSpellGame />)

    hear(['c', 'a', 't'])
    act(() => vi.advanceTimersByTime(1999))
    expect(useGameStore.getState().currentWord?.text).toBe('cat')

    act(() => vi.advanceTimersByTime(1))
    expect(useGameStore.getState().currentWord?.text).not.toBe('cat')
    expect(useGameStore.getState().status).toBe('jogando')
    expect(useGameStore.getState().questionsAnsweredInTurn).toBe(1)
  })

  test('moves to the next word 5 seconds after getting it wrong', () => {
    vi.useFakeTimers()
    render(<SpeakAndSpellGame />)

    hear(['k', 'k', 'k', 'a', 't'])
    act(() => vi.advanceTimersByTime(4999))
    expect(useGameStore.getState().status).toBe('errou')

    act(() => vi.advanceTimersByTime(1))
    expect(useGameStore.getState().status).toBe('jogando')
    expect(useGameStore.getState().currentWord?.text).not.toBe('cat')
  })

  test('finishes the turn after the last word', () => {
    vi.useFakeTimers()
    const finishTurn = vi.fn()
    const originalFinishTurn = useSessionStore.getState().finishTurn
    useSessionStore.setState({ finishTurn })
    useGameStore.setState({ turnLength: 1 })
    try {
      render(<SpeakAndSpellGame />)

      hear(['c', 'a', 't'])
      act(() => vi.advanceTimersByTime(2000))

      expect(finishTurn).toHaveBeenCalledTimes(1)
    } finally {
      useSessionStore.setState({ finishTurn: originalFinishTurn })
    }
  })

  test('the next word button still skips the wait', () => {
    vi.useFakeTimers()
    render(<SpeakAndSpellGame />)

    hear(['c', 'a', 't'])
    fireEvent.click(screen.getByRole('button', { name: 'Next word' }))
    expect(useGameStore.getState().currentWord?.text).not.toBe('cat')
    const next = useGameStore.getState().currentWord

    act(() => vi.advanceTimersByTime(5000))
    expect(useGameStore.getState().currentWord).toBe(next)
  })

  test('gives 5 seconds per letter with a 30-second minimum', () => {
    useGameStore.setState({ currentWord: { text: 'electric guitar', difficulty: 'dificil' } })
    render(<SpeakAndSpellGame />)

    expect(screen.getByText('70s')).toBeTruthy()
  })
})

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

describe('SpeakAndSpellGame — ouvir a pronúncia', () => {
  const speak = vi.fn<(utterance: FakeUtterance) => void>()

  function stubSpeechSynthesis() {
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() })
  }

  function speakerButton() {
    return screen.getByRole('button', { name: 'Hear the pronunciation' })
  }

  beforeEach(() => {
    speak.mockReset()
  })

  test('speaks the highlighted letter in English', () => {
    stubSpeechSynthesis()
    render(<SpeakAndSpellGame />)

    fireEvent.click(speakerButton())

    expect(speak).toHaveBeenCalledTimes(1)
    expect(speak.mock.calls[0][0].text).toBe('C')
    expect(speak.mock.calls[0][0].lang).toBe('en-US')
  })

  test('speaks the new highlighted letter after a right letter', () => {
    stubSpeechSynthesis()
    render(<SpeakAndSpellGame />)

    hear(['c'])
    fireEvent.click(speakerButton())

    expect(speak.mock.calls[0][0].text).toBe('A')
  })

  test('says the right letter after three wrong tries', () => {
    stubSpeechSynthesis()
    render(<SpeakAndSpellGame />)

    hear(['k', 'k', 'k'])

    expect(speak).toHaveBeenCalledTimes(1)
    expect(speak.mock.calls[0][0].text).toBe('C')
  })

  test('mutes the microphone while the app is speaking and shortly after', () => {
    vi.useFakeTimers()
    stubSpeechSynthesis()
    render(<SpeakAndSpellGame />)
    expect(handlers.isMuted?.()).toBe(false)

    fireEvent.click(speakerButton())
    const utterance = speak.mock.calls[0][0]
    act(() => utterance.onstart?.())

    expect(handlers.isMuted?.()).toBe(true)

    act(() => utterance.onend?.())
    expect(handlers.isMuted?.()).toBe(true)

    act(() => vi.advanceTimersByTime(500))
    expect(handlers.isMuted?.()).toBe(false)
  })

  test('still speaks the letter when the microphone is blocked', () => {
    stubSpeechSynthesis()
    recognitionStartsWith('mic-denied')
    render(<SpeakAndSpellGame />)

    fireEvent.click(speakerButton())

    expect(speak).toHaveBeenCalledTimes(1)
  })

  test('hides the speaker button once the word is finished', () => {
    stubSpeechSynthesis()
    render(<SpeakAndSpellGame />)

    hear(['c', 'a', 't'])

    expect(screen.queryByRole('button', { name: 'Hear the pronunciation' })).toBeNull()
  })

  test('has no speaker button when the browser cannot speak', () => {
    render(<SpeakAndSpellGame />)

    expect(screen.queryByRole('button', { name: 'Hear the pronunciation' })).toBeNull()
  })
})

describe('SpeakAndSpellGame — mensagem do fim da palavra', () => {
  function feedbackText() {
    return screen.getByRole('button', { name: 'Next word' }).parentElement?.textContent ?? ''
  }

  test('a right word shows the points earned', () => {
    render(<SpeakAndSpellGame />)

    hear(['c', 'a', 't'])

    expect(feedbackText()).toContain('Correct! +30 points')
  })

  test('a wrong word says which letter was wrong and the points the others earned', () => {
    render(<SpeakAndSpellGame />)

    hear(['k', 'k', 'k', 'a', 't'])

    expect(feedbackText()).toContain('Você errou a letra C.')
    expect(feedbackText()).toContain('Palavra: CAT · +20 de 30 pontos (a letra errada não pontua)')
  })

  test('lists every wrong letter', () => {
    recognitionStartsWith('mic-denied')
    render(<SpeakAndSpellGame />)

    clickIncorrect()
    clickCorrect()
    clickIncorrect()

    expect(feedbackText()).toContain('Você errou as letras C e T.')
    expect(feedbackText()).toContain('Palavra: CAT · +10 de 30 pontos (as letras erradas não pontuam)')
  })

  test('getting every letter wrong says no points were earned', () => {
    recognitionStartsWith('mic-denied')
    render(<SpeakAndSpellGame />)

    clickIncorrect()
    clickIncorrect()
    clickIncorrect()

    expect(feedbackText()).toContain('Você errou as letras C, A e T.')
    expect(feedbackText()).toContain('Palavra: CAT · nenhum ponto')
    expect(feedbackText()).not.toContain('0 de 30')
  })

  test('running out of time says where it stopped and the points earned', () => {
    vi.useFakeTimers()
    render(<SpeakAndSpellGame />)

    hear(['c'])
    act(() => vi.advanceTimersByTime(30_000))

    expect(useGameStore.getState().status).toBe('tempo-esgotado')
    expect(feedbackText()).toContain('O tempo acabou na letra A.')
    expect(feedbackText()).toContain('Palavra: CAT · +10 de 30 pontos')
  })

  test('running out of time without any right letter says no points were earned', () => {
    vi.useFakeTimers()
    render(<SpeakAndSpellGame />)

    act(() => vi.advanceTimersByTime(30_000))

    expect(feedbackText()).toContain('Palavra: CAT · nenhum ponto')
    expect(feedbackText()).not.toContain('0 de 30')
  })
})
