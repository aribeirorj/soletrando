import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { english } from '../language/english'
import { portuguese } from '../language/portuguese'
import { setLanguage } from '../language/current'
import { ListenAndTypeGame } from './ListenAndTypeGame'

function textbox() {
  return screen.getByRole('textbox') as HTMLInputElement
}

function type(value: string) {
  fireEvent.change(textbox(), { target: { value } })
}

function accentKey(letter: string) {
  return within(screen.getByRole('group', { name: 'Letras com acento' })).getByRole('button', { name: letter })
}

beforeEach(() => {
  setLanguage(portuguese)
  useGameStore.setState({
    mode: 'ouvir-digitar',
    difficulty: 'medio',
    category: null,
    currentWord: { text: 'açúcar', difficulty: 'medio' },
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
  setLanguage(english)
})

describe('Teclas de acento', () => {
  test('offers the Portuguese accented letters', () => {
    render(<ListenAndTypeGame />)

    const keys = within(screen.getByRole('group', { name: 'Letras com acento' })).getAllByRole('button')
    expect(keys.map((key) => key.textContent)).toEqual(['á', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'])
  })

  test('adds the letter at the end when typing', () => {
    render(<ListenAndTypeGame />)
    type('a')

    fireEvent.click(accentKey('ç'))

    expect(textbox().value).toBe('aç')
  })

  test('inserts the letter at the cursor, replacing the selection', () => {
    render(<ListenAndTypeGame />)
    type('acucar')
    textbox().setSelectionRange(1, 2)

    fireEvent.click(accentKey('ç'))

    expect(textbox().value).toBe('açucar')
  })

  test('keeps the cursor after the inserted letter', () => {
    render(<ListenAndTypeGame />)
    type('a')

    fireEvent.click(accentKey('ç'))
    fireEvent.click(accentKey('ú'))

    expect(textbox().value).toBe('açú')
    expect(textbox().selectionStart).toBe(3)
  })

  test('answering with the accent keys is a right answer', () => {
    render(<ListenAndTypeGame />)
    type('a')
    fireEvent.click(accentKey('ç'))
    fireEvent.click(accentKey('ú'))
    type(`${textbox().value}car`)

    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(useGameStore.getState().status).toBe('acertou')
  })

  test('the keys are disabled after answering', () => {
    render(<ListenAndTypeGame />)
    type('acucar')
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect((accentKey('ç') as HTMLButtonElement).disabled).toBe(true)
  })
})
