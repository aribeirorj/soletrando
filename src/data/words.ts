import type { Difficulty, Word } from '../types'

const FACIL: string[] = [
  'cat', 'dog', 'sun', 'hat', 'pen', 'box', 'cup', 'run', 'big', 'red',
  'bed', 'egg', 'ice', 'jam', 'key', 'leg', 'map', 'net', 'owl', 'pig',
]

const MEDIO: string[] = [
  'apple', 'bread', 'chair', 'dance', 'eagle', 'flower', 'garden', 'hammer',
  'island', 'jungle', 'kitten', 'lemon', 'mirror', 'nickel', 'orange',
  'pencil', 'rabbit', 'silver', 'tiger', 'violet',
]

const DIFICIL: string[] = [
  'beautiful', 'chocolate', 'dangerous', 'dictionary', 'elephant', 'favorite',
  'government', 'hospital', 'important', 'knowledge', 'language', 'mountain',
  'necessary', 'parliament', 'restaurant', 'telephone', 'umbrella',
  'vegetable', 'wonderful', 'xylophone',
]

function toWords(list: string[], difficulty: Difficulty): Word[] {
  return list.map((text) => ({ text, difficulty }))
}

export const WORDS: Word[] = [
  ...toWords(FACIL, 'facil'),
  ...toWords(MEDIO, 'medio'),
  ...toWords(DIFICIL, 'dificil'),
]

export function getWordsByDifficulty(difficulty: Difficulty): Word[] {
  return WORDS.filter((w) => w.difficulty === difficulty)
}
