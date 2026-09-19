import { describe, expect, test } from 'vitest'
import { getWordsByDifficulty } from '../data/words'
import { SPEAK_AND_SPELL_CATEGORIES, getSpeakAndSpellWords } from '../data/speakAndSpellCategories'
import { getWordHint } from '../data/wordHints'
import { LETTER_GRAMMAR, parseHeardLetters } from '../speech/letterNames'
import { english } from './english'

describe('english (Spelling Bee)', () => {
  test('is the Spelling Bee, saved under the original keys', () => {
    expect(english.id).toBe('en')
    expect(english.appName).toBe('Spelling Bee')
    expect(english.storagePrefix).toBe('soletrando')
    expect(english.speechLang).toBe('en-US')
  })

  test('plays the existing word banks and hints', () => {
    expect(english.getWordsByDifficulty('medio')).toEqual(getWordsByDifficulty('medio'))
    expect(english.categories).toBe(SPEAK_AND_SPELL_CATEGORIES)
    expect(english.getSpeakAndSpellWords(['colors'])).toEqual(getSpeakAndSpellWords(['colors']))
    expect(english.getHint('cat')).toBe(getWordHint('cat'))
  })

  test('recognizes letters with the English model and grammar', () => {
    expect(english.recognizer?.modelUrl).toMatch(/models\/vosk-model-small-en-us-0\.15\.tar\.gz$/)
    expect(english.recognizer?.grammar).toBe(LETTER_GRAMMAR)
    expect(english.recognizer?.parse('see double you')).toEqual(parseHeardLetters('see double you'))
  })

  test('keeps the accent tolerance (T expected, G heard)', () => {
    expect(english.matchesExpectedUnit('g', 't')).toBe(true)
    expect(english.matchesExpectedUnit('t', 'g')).toBe(false)
  })

  test('says and shows a letter in upper case', () => {
    expect(english.speakUnit('c')).toBe('C')
    expect(english.unitLabel('c')).toBe('C')
  })

  test('has no accent keys and shows the Novidades', () => {
    expect(english.accentButtons).toEqual([])
    expect(english.strictTypingInput).toBe(false)
    expect(english.homeNotice).toBe('novidades')
  })

  test('labels in English, important information in Portuguese', () => {
    expect(english.texts.typeWordPlaceholder).toBe('Type the word')
    expect(english.labels.playSolo).toBe('Play Solo')
    expect(english.labels.modes['falar-soletrar']).toBe('Speak and Spell')
    expect(english.labels.rankPosition(1)).toBe('1st')
    expect(english.labels.rankPosition(12)).toBe('12th')
    expect(english.labels.rankPosition(23)).toBe('23rd')
    expect(english.categories[0].label).toBe('Colors')
    expect(english.texts.speakInstruction).toBe('Fale em inglês a letra destacada.')
    expect(english.texts.howToPlay['ouvir-digitar']).toBe('Ouça a palavra em inglês e digite como ela se escreve.')
  })
})
