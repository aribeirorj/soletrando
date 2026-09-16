import { describe, expect, test } from 'vitest'
import { WORDS } from './words'
import { getWordHint } from './wordHints'

describe('getWordHint', () => {
  test.each(WORDS.map((w) => w.text))('"%s" has a hint that does not reveal the word', (word) => {
    const hint = getWordHint(word)

    expect(hint).toBeTruthy()
    expect(hint!.toLowerCase()).not.toContain(word.toLowerCase())
  })

  test('is case-insensitive', () => {
    expect(getWordHint('CAT')).toBe(getWordHint('cat'))
  })

  test('returns null for unknown words', () => {
    expect(getWordHint('asdfghjkl')).toBeNull()
  })
})
