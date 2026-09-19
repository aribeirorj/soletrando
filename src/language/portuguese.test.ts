import { describe, expect, test } from 'vitest'
import { PT_SPEAK_AND_SPELL_CATEGORIES } from '../data/pt/speakAndSpellCategories'
import { getPortugueseWordsByDifficulty } from '../data/pt/words'
import { english } from './english'
import { languageFromDocument } from './current'
import { portuguese } from './portuguese'

function documentWith(idioma?: string): Document {
  const doc = document.implementation.createHTMLDocument()
  if (idioma) doc.documentElement.dataset.idioma = idioma
  return doc
}

describe('portuguese (Soletrando)', () => {
  test('is the Soletrando, saved under its own keys', () => {
    expect(portuguese.id).toBe('pt')
    expect(portuguese.appName).toBe('Soletrando')
    expect(portuguese.storagePrefix).toBe('soletrando-pt')
    expect(portuguese.speechLang).toBe('pt-BR')
  })

  test('plays the Portuguese word banks', () => {
    expect(portuguese.getWordsByDifficulty('facil')).toEqual(getPortugueseWordsByDifficulty('facil'))
    expect(portuguese.categories).toBe(PT_SPEAK_AND_SPELL_CATEGORIES)
    expect(portuguese.getHint('café')).toContain('Bebida')
  })

  test('has no voice correction yet: only the Correto/Incorreto buttons', () => {
    expect(portuguese.recognizer).toBeNull()
  })

  test('a Letra only matches itself, accent included', () => {
    expect(portuguese.matchesExpectedUnit('é', 'é')).toBe(true)
    expect(portuguese.matchesExpectedUnit('e', 'é')).toBe(false)
    expect(portuguese.matchesExpectedUnit('g', 't')).toBe(false)
  })

  test.each([
    ['c', 'cê'],
    ['h', 'agá'],
    ['w', 'dáblio'],
    ['y', 'ípsilon'],
    ['é', 'é com acento agudo'],
    ['ê', 'ê com acento circunflexo'],
    ['ó', 'ó com acento agudo'],
    ['ô', 'ô com acento circunflexo'],
    ['á', 'a com acento agudo'],
    ['â', 'a com acento circunflexo'],
    ['ã', 'a com til'],
    ['õ', 'o com til'],
    ['í', 'i com acento agudo'],
    ['ú', 'u com acento agudo'],
    ['à', 'a com crase'],
    ['ç', 'cê cedilha'],
    ['-', 'hífen'],
  ])('says %s as "%s"', (unit, spoken) => {
    expect(portuguese.speakUnit(unit)).toBe(spoken)
  })

  test('shows a Letra in upper case, and the hyphen by name', () => {
    expect(portuguese.unitLabel('é')).toBe('É')
    expect(portuguese.unitLabel('ç')).toBe('Ç')
    expect(portuguese.unitLabel('-')).toBe('HÍFEN')
  })

  test('has accent keys and no Novidades', () => {
    expect(portuguese.accentButtons).toEqual(['á', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'])
    expect(portuguese.strictTypingInput).toBe(true)
    expect(portuguese.showWhatsNew).toBe(false)
  })

  test('no text mentions English', () => {
    const texts = JSON.stringify(portuguese.texts)

    expect(texts).not.toMatch(/ingl[eê]s/i)
  })
})

describe('languageFromDocument', () => {
  test('the /pt/ page plays Portuguese', () => {
    expect(languageFromDocument(documentWith('pt'))).toBe(portuguese)
  })

  test('any other page plays English', () => {
    expect(languageFromDocument(documentWith())).toBe(english)
    expect(languageFromDocument(documentWith('fr'))).toBe(english)
    expect(languageFromDocument(undefined)).toBe(english)
  })
})
