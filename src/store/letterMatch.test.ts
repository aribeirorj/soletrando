import { describe, expect, test } from 'vitest'
import { isLetterPronunciationCorrect } from './letterMatch'
import { LETTER_NAME_ALTERNATIVES } from '../data/letterNames'

describe('isLetterPronunciationCorrect', () => {
  test.each(Object.keys(LETTER_NAME_ALTERNATIVES))(
    'accepts the most common pronunciation of letter "%s"',
    (letter) => {
      const [firstAlternative] = LETTER_NAME_ALTERNATIVES[letter]
      expect(isLetterPronunciationCorrect(letter, firstAlternative)).toBe(true)
    },
  )

  test('is case-insensitive', () => {
    expect(isLetterPronunciationCorrect('c', 'SEE')).toBe(true)
  })

  test('trims surrounding whitespace', () => {
    expect(isLetterPronunciationCorrect('c', '  see  ')).toBe(true)
  })

  test('strips trailing punctuation from the transcript', () => {
    expect(isLetterPronunciationCorrect('c', 'see.')).toBe(true)
  })

  test('rejects a transcript that does not match the letter', () => {
    expect(isLetterPronunciationCorrect('c', 'dog')).toBe(false)
  })

  test('rejects an empty transcript', () => {
    expect(isLetterPronunciationCorrect('a', '')).toBe(false)
  })
})
