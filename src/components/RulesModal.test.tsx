import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { RulesButton } from './RulesModal'

function openRules() {
  fireEvent.click(screen.getByRole('button', { name: /rules/i }))
  return screen.getByRole('dialog')
}

describe('RulesButton', () => {
  test('starts closed', () => {
    render(<RulesButton mode="ouvir-digitar" difficulty="medio" />)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('shows Listen and Type rules with the session difficulty points', () => {
    render(<RulesButton mode="ouvir-digitar" difficulty="medio" />)

    const dialog = openRules()

    expect(dialog.textContent).toContain('Ouvir e Digitar')
    expect(dialog.textContent).toContain('20 segundos')
    expect(dialog.textContent).toContain('20 pontos')
    expect(dialog.textContent).toContain('metade')
  })

  test('shows Unscramble rules', () => {
    render(<RulesButton mode="letras-embaralhadas" difficulty="facil" />)

    const dialog = openRules()

    expect(dialog.textContent).toContain('Letras Embaralhadas')
    expect(dialog.textContent).toContain('25 segundos')
    expect(dialog.textContent).toContain('10 pontos')
  })

  test('shows Speak and Spell rules without hint', () => {
    render(<RulesButton mode="falar-soletrar" difficulty="dificil" />)

    const dialog = openRules()

    expect(dialog.textContent).toContain('Falar e Soletrar')
    expect(dialog.textContent).toContain('5 segundos por letra')
    expect(dialog.textContent).toContain('mínimo de 30 segundos')
    expect(dialog.textContent).toContain('3 tentativas')
    expect(dialog.textContent).toContain('Correto ou Incorreto')
    expect(dialog.textContent).toContain('passa sozinho para a próxima')
    expect(dialog.textContent).toContain('Cada letra certa vale 10 pontos')
    expect(dialog.textContent).not.toContain('a palavra vale 0')
    expect(dialog.textContent).not.toContain('Dica')
  })

  test('closes with the Entendi button and with Escape', () => {
    render(<RulesButton mode="ouvir-digitar" difficulty="facil" />)

    openRules()
    fireEvent.click(screen.getByRole('button', { name: /entendi/i }))
    expect(screen.queryByRole('dialog')).toBeNull()

    openRules()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('RulesButton — Jogo Individual', () => {
  test('explains that the points go to the player score and the record', () => {
    render(<RulesButton mode="falar-soletrar" difficulty="dificil" playMode="individual" />)

    const dialog = openRules()

    expect(dialog.textContent).toContain('Recorde')
    expect(dialog.textContent).not.toContain('Ranking')
  })

  test('class play keeps talking about the turn and the ranking', () => {
    render(<RulesButton mode="falar-soletrar" difficulty="dificil" />)

    const dialog = openRules()

    expect(dialog.textContent).toContain('Ranking')
  })
})
