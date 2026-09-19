import { describe, expect, test } from 'vitest'
import { getSpellingSeconds, isAnswerCorrect } from './gameStore'

describe('isAnswerCorrect — Sinais gráficos e hífen', () => {
  test('ignores case on accented letters', () => {
    expect(isAnswerCorrect('CAFÉ', 'café')).toBe(true)
  })

  test('a decomposed accent matches the composed one', () => {
    expect(isAnswerCorrect('cafe\u0301', 'café')).toBe(true)
  })

  test('a missing accent is a wrong answer', () => {
    expect(isAnswerCorrect('cafe', 'café')).toBe(false)
  })

  test('a missing cedilla is a wrong answer', () => {
    expect(isAnswerCorrect('excecao', 'exceção')).toBe(false)
  })

  test('a missing hyphen is a wrong answer', () => {
    expect(isAnswerCorrect('guarda chuva', 'guarda-chuva')).toBe(false)
    expect(isAnswerCorrect('guardachuva', 'guarda-chuva')).toBe(false)
  })
})

describe('getSpellingSeconds — counts Letras', () => {
  test('the hyphen counts as a Letra', () => {
    expect(getSpellingSeconds('guarda-chuva')).toBe(60)
  })

  test('a decomposed accent counts once', () => {
    expect(getSpellingSeconds('excec\u0327a\u0303o')).toBe(35)
  })
})
