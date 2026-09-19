import { describe, expect, test } from 'vitest'
import { SPEAK_AND_SPELL_CATEGORIES } from '../speakAndSpellCategories'
import { PT_WORDS, getPortugueseWordsByDifficulty } from './words'
import { getPortugueseWordHint } from './wordHints'
import { PT_SPEAK_AND_SPELL_CATEGORIES, getPortugueseSpeakAndSpellWords } from './speakAndSpellCategories'

// Letras do português (sem trema desde o Acordo de 2009) e o hífen.
const DIFFICULTY_WORD = /^[a-záâãéêíóôõúç]+(-[a-záâãéêíóôõúç]+)*$/
// Nas Categorias a palavra fica à vista, então pode ter espaço (como "sala de jantar").
const CATEGORY_WORD = /^[a-záâãéêíóôõúç]+([ -][a-záâãéêíóôõúç]+)*$/

// No Ouvir e Digitar o aluno só ouve a palavra: um homófono não teria resposta certa única.
const HOMOPHONES = [
  'acender', 'ascender', 'acento', 'assento', 'caçar', 'cassar', 'cela', 'sela', 'cem', 'sem',
  'censo', 'senso', 'cessão', 'seção', 'sessão', 'chá', 'xá', 'cheque', 'xeque', 'concerto',
  'conserto', 'conselho', 'concelho', 'coser', 'cozer', 'espiar', 'expiar', 'estrato', 'extrato',
  'maça', 'massa', 'paço', 'passo', 'taxa', 'tacha', 'traz', 'trás', 'viagem', 'viajem',
]

function withoutAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

const difficultyWords = PT_WORDS.map((word) => word.text)
const categoryWords = PT_SPEAK_AND_SPELL_CATEGORIES.flatMap((category) => category.words)

describe('Banco de Palavras do Soletrando — por Dificuldade', () => {
  test.each(['facil', 'medio', 'dificil'] as const)('%s has 20 words', (difficulty) => {
    expect(getPortugueseWordsByDifficulty(difficulty)).toHaveLength(20)
  })

  test('has no repeated word', () => {
    expect(new Set(difficultyWords).size).toBe(difficultyWords.length)
  })

  test.each(difficultyWords)('%s is lower case NFC with only Portuguese letters and hyphens', (word) => {
    expect(word).toBe(word.normalize('NFC'))
    expect(word).toMatch(DIFFICULTY_WORD)
  })

  test.each(difficultyWords)('%s has a hint without the word itself', (word) => {
    const hint = getPortugueseWordHint(word)

    expect(hint).toBeTruthy()
    expect(withoutAccents(hint!)).not.toContain(withoutAccents(word))
  })

  test('has no homophones', () => {
    expect(difficultyWords.filter((word) => HOMOPHONES.includes(word))).toEqual([])
  })

  test('finds the hint of a decomposed or capitalized word', () => {
    expect(getPortugueseWordHint('CAFE\u0301')).toBe(getPortugueseWordHint('café'))
  })
})

describe('Banco de Palavras do Soletrando — Categorias', () => {
  test('has the same themes as the Spelling Bee, in the same order', () => {
    expect(PT_SPEAK_AND_SPELL_CATEGORIES.map(({ id, label }) => ({ id, label }))).toEqual(
      SPEAK_AND_SPELL_CATEGORIES.map(({ id, label }) => ({ id, label })),
    )
  })

  test.each(PT_SPEAK_AND_SPELL_CATEGORIES.map((category) => [category.id, category.words] as const))(
    '%s has no repeated word',
    (_id, words) => {
      expect(new Set(words).size).toBe(words.length)
    },
  )

  test.each(categoryWords)('%s is lower case NFC with only Portuguese letters, spaces and hyphens', (word) => {
    expect(word).toBe(word.normalize('NFC'))
    expect(word).toMatch(CATEGORY_WORD)
  })

  test('the days of the week keep their hyphen', () => {
    expect(getPortugueseSpeakAndSpellWords(['days-of-week']).map((word) => word.text)).toContain('segunda-feira')
  })

  test('plays only the chosen categories', () => {
    expect(getPortugueseSpeakAndSpellWords(null)).toEqual([])
    expect(getPortugueseSpeakAndSpellWords(['seasons']).map((word) => word.text)).toEqual([
      'primavera', 'verão', 'outono', 'inverno',
    ])
  })
})
