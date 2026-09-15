import { describe, expect, test } from 'vitest'
import { getSpeakAndSpellWords, SPEAK_AND_SPELL_CATEGORIES } from './speakAndSpellCategories'

describe('SPEAK_AND_SPELL_CATEGORIES', () => {
  test('every category has a unique id and at least one word', () => {
    const ids = SPEAK_AND_SPELL_CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const category of SPEAK_AND_SPELL_CATEGORIES) {
      expect(category.words.length).toBeGreaterThan(0)
    }
  })
})

describe('getSpeakAndSpellWords', () => {
  test('returns the words for a known category with a fixed difficulty', () => {
    const words = getSpeakAndSpellWords(['colors'])

    expect(words.length).toBe(12)
    expect(words.every((w) => w.difficulty === 'dificil')).toBe(true)
    expect(words.map((w) => w.text)).toContain('blue')
  })

  test('combines the words from every selected category', () => {
    const words = getSpeakAndSpellWords(['colors', 'seasons'])

    expect(words.length).toBe(12 + 5)
    expect(words.map((w) => w.text)).toContain('blue')
    expect(words.map((w) => w.text)).toContain('winter')
  })

  test('ignores unknown category ids while keeping known ones', () => {
    const words = getSpeakAndSpellWords(['colors', 'not-a-category'])

    expect(words.length).toBe(12)
  })

  test('returns an empty list for an unknown category', () => {
    expect(getSpeakAndSpellWords(['not-a-category'])).toEqual([])
  })

  test('returns an empty list when no category is given', () => {
    expect(getSpeakAndSpellWords(null)).toEqual([])
  })

  test('returns an empty list when an empty category list is given', () => {
    expect(getSpeakAndSpellWords([])).toEqual([])
  })
})
