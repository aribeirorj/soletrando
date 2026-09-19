import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { english } from '../language/english'
import { portuguese } from '../language/portuguese'
import { setLanguage } from '../language/current'
import { useGameStore } from '../store/gameStore'
import { HomeScreen } from './HomeScreen'
import { RulesButton } from './RulesModal'
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

function openRules() {
  fireEvent.click(screen.getByRole('button', { name: /regras/i }))
  return screen.getByRole('dialog')
}

beforeEach(() => {
  setLanguage(portuguese)
})

afterEach(() => {
  setLanguage(english)
  vi.unstubAllGlobals()
})

describe('HomeScreen no Soletrando', () => {
  test('shows the Soletrando name', () => {
    render(<HomeScreen />)

    expect(screen.getByRole('heading', { name: 'Soletrando' })).toBeTruthy()
    expect(screen.queryByAltText('Jogo de Soletrar')).toBeNull()
  })

  test('shows the bee with the Soletrando logo, not the Spelling Bee one', () => {
    render(<HomeScreen />)

    expect(screen.getByAltText('Abelha de óculos escuros com microfone, blocos ABC e o logo Soletrando')).toBeTruthy()
    expect(screen.queryByAltText(/logo Spelling Bee/)).toBeNull()
  })

  test('does not show the Spelling Bee news', () => {
    render(<HomeScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Jogar com a Turma' }))

    expect(screen.queryByRole('region', { name: 'Novidades no Falar e Soletrar' })).toBeNull()
  })
})

describe('Aviso "Como funciona o Soletrando"', () => {
  function notice() {
    return screen.queryByRole('region', { name: 'Como funciona o Soletrando' })
  }

  test.each(['Jogar Individual', 'Jogar com a Turma'])('shows after choosing %s', (playMode) => {
    render(<HomeScreen />)

    fireEvent.click(screen.getByRole('button', { name: playMode }))

    const text = notice()?.textContent ?? ''
    expect(text).toContain('"cafe" no lugar de "café" é erro')
    expect(text).toContain('á â ã é ê í ó ô õ ú ç')
    expect(text).toContain('blocos próprios')
    expect(text).toContain('"é com acento agudo"')
    expect(text).toContain('Correto')
    expect(text).toContain('Incorreto')
    expect(text).toContain('Ouvir a pronúncia')
    expect(text).toContain('10 pontos na hora')
    expect(text).toContain('só conta como acerto se todas as letras estiverem certas')
  })

  test('tells nothing that the Soletrando does not do', () => {
    render(<HomeScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Jogar Individual' }))

    const text = notice()?.textContent ?? ''
    expect(text).not.toMatch(/ingl[eê]s/i)
    expect(text).not.toContain('microfone')
  })

  test('does not show before choosing how to play', () => {
    render(<HomeScreen />)

    expect(notice()).toBeNull()
  })

  test('Entendi and × close it', () => {
    render(<HomeScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Jogar Individual' }))

    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(notice()).toBeNull()
  })

  test('× closes it', () => {
    render(<HomeScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Jogar com a Turma' }))

    fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }))
    expect(notice()).toBeNull()
  })
})

describe('Regras no Soletrando', () => {
  test('Falar e Soletrar: buttons only, accents and hyphen count', () => {
    render(<RulesButton mode="falar-soletrar" difficulty="dificil" />)

    const text = openRules().textContent ?? ''

    expect(text).toContain('Alguém marca Correto ou Incorreto para cada letra.')
    expect(text).not.toContain('tentativas')
    expect(text).toContain('hífen')
    expect(text).toContain('acento')
    expect(text).not.toMatch(/ingl[eê]s/i)
  })

  test('Ouvir e Digitar: accents and hyphen are part of the answer', () => {
    render(<RulesButton mode="ouvir-digitar" difficulty="medio" />)

    const text = openRules().textContent ?? ''

    expect(text).toContain('20 pontos')
    expect(text).toContain('acentos e hífen')
    expect(text).not.toMatch(/ingl[eê]s/i)
  })
})

describe('ListenAndTypeGame no Soletrando', () => {
  beforeEach(() => {
    useGameStore.setState({
      mode: 'ouvir-digitar',
      difficulty: 'facil',
      category: null,
      currentWord: { text: 'café', difficulty: 'facil' },
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

  test('narrates the word in Brazilian Portuguese', () => {
    const speak = vi.fn<(utterance: FakeUtterance) => void>()
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() })

    render(<ListenAndTypeGame />)

    expect(speak.mock.calls[0][0].text).toBe('café')
    expect(speak.mock.calls[0][0].lang).toBe('pt-BR')
  })

  test('asks for the word without mentioning English', () => {
    render(<ListenAndTypeGame />)

    expect(screen.getByPlaceholderText('Digite a palavra')).toBeTruthy()
  })

  test('a missing accent is a wrong answer', () => {
    render(<ListenAndTypeGame />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'cafe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(screen.getByText('Errou. A palavra correta era: café')).toBeTruthy()
  })

  test('the keyboard does not correct or suggest words for the student', () => {
    render(<ListenAndTypeGame />)

    const input = screen.getByRole('textbox')
    expect(input.getAttribute('autocorrect')).toBe('off')
    expect(input.getAttribute('autocapitalize')).toBe('off')
    expect(input.getAttribute('spellcheck')).toBe('false')
    expect(input.getAttribute('autocomplete')).toBe('off')
  })
})
