import { afterEach, describe, expect, test } from 'vitest'
import { english } from './english'
import { getLanguage, setLanguage, storageKey } from './current'

afterEach(() => {
  setLanguage(english)
})

describe('current language', () => {
  test('is English when nothing sets it', () => {
    expect(getLanguage()).toBe(english)
  })

  test('storage keys use the language prefix', () => {
    expect(storageKey('highScore')).toBe('soletrando:highScore')

    setLanguage({ ...english, storagePrefix: 'outro' })

    expect(storageKey('highScore')).toBe('outro:highScore')
  })
})
