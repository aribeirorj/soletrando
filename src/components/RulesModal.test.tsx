import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { RulesButton } from './RulesModal'

function openRules() {
  fireEvent.click(screen.getByRole('button', { name: /regras/i }))
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
    expect(dialog.textContent).toContain('30 segundos')
    expect(dialog.textContent).toContain('10 pontos por letra')
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
