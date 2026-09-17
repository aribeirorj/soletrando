import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import { useGameStore } from '../store/gameStore'
import { HintButton } from './HintButton'

describe('HintButton', () => {
  beforeEach(() => {
    useGameStore.setState({ hintUsedThisQuestion: false })
  })

  test('shows the local hint and marks the hint as used', () => {
    render(<HintButton word="cat" />)

    fireEvent.click(screen.getByRole('button', { name: /dica/i }))

    expect(screen.getByText(/^Dica:/).textContent).toContain('mia')
    expect(useGameStore.getState().hintUsedThisQuestion).toBe(true)
  })

  test('does not consume the hint when the word has none', () => {
    render(<HintButton word="asdfghjkl" />)

    expect((screen.getByRole('button', { name: /dica/i }) as HTMLButtonElement).disabled).toBe(true)
    expect(useGameStore.getState().hintUsedThisQuestion).toBe(false)
  })
})
