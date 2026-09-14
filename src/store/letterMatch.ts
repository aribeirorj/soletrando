import { LETTER_NAME_ALTERNATIVES } from '../data/letterNames'

export function isLetterPronunciationCorrect(letter: string, transcript: string): boolean {
  const normalized = transcript.trim().toLowerCase().replace(/[.,!?]/g, '')
  const alternatives = LETTER_NAME_ALTERNATIVES[letter.toLowerCase()] ?? []
  return alternatives.includes(normalized)
}
