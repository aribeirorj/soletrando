import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { HomeScreen } from './HomeScreen'

function choose(label: 'Jogar Individual' | 'Jogar com a Turma') {
  fireEvent.click(screen.getByRole('button', { name: label }))
}

function news() {
  return screen.queryByRole('region', { name: 'Novidades no Falar e Soletrar' })
}

describe('HomeScreen — novidades', () => {
  test('shows the news when playing with the class', () => {
    render(<HomeScreen />)

    choose('Jogar com a Turma')

    const text = news()?.textContent ?? ''
    expect(text).toContain('corrige sozinho')
    expect(text).toContain('3 tentativas')
    expect(text).toContain('Ouvir a pronúncia')
    expect(text).toContain('10 pontos na hora')
    expect(text).toContain('só conta como acerto se todas as letras estiverem certas')
    expect(text).toContain('Correto')
    expect(text).toContain('Incorreto')
  })

  test('also shows the news in individual play', () => {
    render(<HomeScreen />)

    choose('Jogar Individual')

    const text = news()?.textContent ?? ''
    expect(text).toContain('corrige sozinho')
    expect(text).toContain('10 pontos na hora')
  })

  test('does not show the news before choosing how to play', () => {
    render(<HomeScreen />)

    expect(news()).toBeNull()
  })

  test('Entendi closes the news', () => {
    render(<HomeScreen />)
    choose('Jogar com a Turma')

    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }))

    expect(news()).toBeNull()
  })

  test('the close button closes the news', () => {
    render(<HomeScreen />)
    choose('Jogar com a Turma')

    fireEvent.click(screen.getByRole('button', { name: 'Fechar novidades' }))

    expect(news()).toBeNull()
  })

  test('stays closed when switching between individual and class play', () => {
    render(<HomeScreen />)
    choose('Jogar com a Turma')
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }))

    choose('Jogar Individual')
    expect(news()).toBeNull()

    choose('Jogar com a Turma')
    expect(news()).toBeNull()
  })

  test('comes back on the next visit', () => {
    const { unmount } = render(<HomeScreen />)
    choose('Jogar com a Turma')
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }))
    unmount()

    render(<HomeScreen />)
    choose('Jogar com a Turma')

    expect(news()).not.toBeNull()
  })
})

describe('HomeScreen — regras no Jogo Individual', () => {
  function rulesButton() {
    return screen.queryByRole('button', { name: 'Ver regras' })
  }

  test('shows the rules button once Falar e Soletrar is chosen', () => {
    render(<HomeScreen />)
    choose('Jogar Individual')
    expect(rulesButton()).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Falar e Soletrar' }))
    fireEvent.click(rulesButton()!)

    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('Regras — Falar e Soletrar')
    expect(dialog.textContent).toContain('Recorde')
  })

  test('other modes need the difficulty before showing the rules', () => {
    render(<HomeScreen />)
    choose('Jogar Individual')

    fireEvent.click(screen.getByRole('button', { name: 'Letras Embaralhadas' }))
    expect(rulesButton()).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Fácil' }))
    expect(rulesButton()).not.toBeNull()
  })
})
