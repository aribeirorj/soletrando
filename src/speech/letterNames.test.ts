import { describe, expect, test } from 'vitest'
import { LETTER_GRAMMAR, matchesExpectedLetter, parseHeardLetters } from './letterNames'

describe('parseHeardLetters', () => {
  test.each([
    ['c', ['c']],
    ['c a t', ['c', 'a', 't']],
    ['C', ['c']],
    ['  b  ', ['b']],
    ['zed', ['z']],
    ['bee', ['b']],
    ['see', ['c']],
    ['why', ['y']],
    ['double you', ['w']],
    ['double u', ['w']],
    ['a double you b', ['a', 'w', 'b']],
  ])('"%s" → %j', (text, expected) => {
    expect(parseHeardLetters(text)).toEqual(expected)
  })

  test.each(['', '   ', '[unk]', 'double', 'hello', 'the', 'constructor'])('ignores non-letters: "%s"', (text) => {
    expect(parseHeardLetters(text)).toEqual([])
  })

  test('drops [unk] between letters', () => {
    expect(parseHeardLetters('a [unk] b')).toEqual(['a', 'b'])
  })
})

describe('LETTER_GRAMMAR', () => {
  const words: string[] = JSON.parse(LETTER_GRAMMAR)

  test('includes every letter of the alphabet and [unk]', () => {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      expect(words).toContain(letter)
    }
    expect(words).toContain('[unk]')
  })

  test.each(words.filter((w) => w !== '[unk]'))('"%s" parses to exactly one letter', (word) => {
    expect(parseHeardLetters(word)).toHaveLength(1)
  })
})

describe('matchesExpectedLetter', () => {
  test.each<[string, string, boolean]>([
    ['t', 't', true],
    ['g', 't', true],
    ['t', 'g', false],
    ['d', 't', false],
    ['c', 'c', true],
    ['k', 'c', false],
  ])('heard "%s" for expected "%s" → %s', (heard, expected, matches) => {
    expect(matchesExpectedLetter(heard, expected)).toBe(matches)
  })
})
