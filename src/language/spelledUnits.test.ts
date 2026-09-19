import { describe, expect, test } from 'vitest'
import { WORDS } from '../data/words'
import { SPEAK_AND_SPELL_CATEGORIES } from '../data/speakAndSpellCategories'
import { displayUnits, spelledUnits } from './spelledUnits'

const DECOMPOSED_CAFE = 'cafe\u0301'

describe('spelledUnits', () => {
  test('an accented letter is a single Letra', () => {
    expect(spelledUnits('café')).toEqual(['c', 'a', 'f', 'é'])
  })

  test('a decomposed accent still makes a single, composed Letra', () => {
    const units = spelledUnits(DECOMPOSED_CAFE)

    expect(units).toEqual(['c', 'a', 'f', 'é'])
    expect(units[3]).toBe('é')
  })

  test('the hyphen is a Letra', () => {
    const units = spelledUnits('guarda-chuva')

    expect(units).toHaveLength(12)
    expect(units[6]).toBe('-')
  })

  test('the space is not a Letra', () => {
    expect(spelledUnits('living room')).toEqual('livingroom'.split(''))
  })

  test('comes out in lower case', () => {
    expect(spelledUnits('CAFÉ')).toEqual(['c', 'a', 'f', 'é'])
  })
})

describe('displayUnits', () => {
  test('keeps spaces and case, and composes accents', () => {
    expect(displayUnits('Dining room')).toEqual('Dining room'.split(''))
    expect(displayUnits(DECOMPOSED_CAFE)).toEqual(['c', 'a', 'f', 'é'])
  })

  test('the cedilla and the tilde stay on their letters', () => {
    expect(displayUnits('exceção')).toEqual(['e', 'x', 'c', 'e', 'ç', 'ã', 'o'])
  })
})

describe('Spelling Bee words split exactly as before', () => {
  const englishWords = [
    ...WORDS.map((word) => word.text),
    ...SPEAK_AND_SPELL_CATEGORIES.flatMap((category) => category.words),
  ]

  test.each(englishWords)('%s', (word) => {
    expect(spelledUnits(word)).toEqual(word.replace(/ /g, '').toLowerCase().split(''))
    expect(displayUnits(word)).toEqual(word.split(''))
  })
})
