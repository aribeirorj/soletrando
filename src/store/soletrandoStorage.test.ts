import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// O Soletrando e o Spelling Bee ficam na mesma origem: cada um guarda Recorde, Jogador e
// Sessão nas suas chaves. As stores leem o Idioma da página quando carregam.
async function loadStoresOnThePortuguesePage() {
  document.documentElement.dataset.idioma = 'pt'
  vi.resetModules()
  const { useGameStore } = await import('./gameStore')
  const { useSessionStore } = await import('./sessionStore')
  return { useGameStore, useSessionStore }
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  delete document.documentElement.dataset.idioma
  localStorage.clear()
})

describe('Soletrando storage', () => {
  test('reads its own Recorde and Jogador, not the Spelling Bee ones', async () => {
    localStorage.setItem('soletrando:highScore', '900')
    localStorage.setItem('soletrando:playerName', 'Ana')
    localStorage.setItem('soletrando-pt:highScore', '40')
    localStorage.setItem('soletrando-pt:playerName', 'Bia')

    const { useGameStore } = await loadStoresOnThePortuguesePage()

    expect(useGameStore.getState().highScore).toBe(40)
    expect(useGameStore.getState().playerName).toBe('Bia')
  })

  test('saves the Recorde and Jogador under soletrando-pt and leaves the Spelling Bee keys alone', async () => {
    localStorage.setItem('soletrando:highScore', '900')
    const { useGameStore } = await loadStoresOnThePortuguesePage()

    useGameStore.getState().setPlayerName('Bia')
    useGameStore.getState().awardSpellingLetters(3)

    expect(localStorage.getItem('soletrando-pt:highScore')).toBe('30')
    expect(localStorage.getItem('soletrando-pt:playerName')).toBe('Bia')
    expect(localStorage.getItem('soletrando:highScore')).toBe('900')
    expect(localStorage.getItem('soletrando:playerName')).toBeNull()
  })

  test('saves the Sessão under soletrando-pt', async () => {
    const { useSessionStore } = await loadStoresOnThePortuguesePage()

    useSessionStore.getState().addStudent('Caio')

    expect(localStorage.getItem('soletrando-pt:session')).toContain('Caio')
    expect(localStorage.getItem('soletrando:session')).toBeNull()
  })

  test('plays Portuguese words', async () => {
    const { useGameStore } = await loadStoresOnThePortuguesePage()

    useGameStore.getState().startGame('falar-soletrar', 'dificil', undefined, ['days-of-week'])

    expect(useGameStore.getState().currentWord?.text).toMatch(/^(domingo|sábado|[a-zç]+-feira)$/)
  })
})
