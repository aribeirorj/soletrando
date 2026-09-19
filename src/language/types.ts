import type { WordCategory } from '../data/speakAndSpellCategories'
import type { RecognizerConfig } from '../speech/letterRecognition'
import type { Difficulty, GameMode, Word } from '../types'

export type LanguageId = 'en' | 'pt'

// Aviso da tela inicial: as Novidades do Spelling Bee ou o "Como funciona" do Soletrando.
export type HomeNotice = 'novidades' | 'como-funciona-soletrando'

export interface LanguageArt {
  src: string
  alt: string
}

export interface LanguageTexts {
  typeWordPlaceholder: string
  howToPlay: Record<GameMode, string>
  // Falar e Soletrar, no modo voz.
  speakInstruction: string
  // Entre parênteses na regra de Pontos por letra.
  spellingUnitsNote: string
}

// Tudo o que muda entre as Versões. Um Idioma nunca importa store/ nem components/:
// ele é lido pelas stores quando elas carregam.
export interface LanguagePack {
  id: LanguageId
  appName: string
  storagePrefix: string
  speechLang: string
  getWordsByDifficulty: (difficulty: Difficulty) => Word[]
  categories: WordCategory[]
  getSpeakAndSpellWords: (categoryIds: string[] | null) => Word[]
  getHint: (word: string) => string | null
  matchesExpectedUnit: (heard: string, expected: string) => boolean
  // Texto narrado por "Ouvir a pronúncia" e depois da 3ª Tentativa errada.
  speakUnit: (unit: string) => string
  // Como a Letra aparece nas mensagens ("A letra certa era X").
  unitLabel: (unit: string) => string
  // null: sem correção por voz, só Correto/Incorreto.
  recognizer: RecognizerConfig | null
  accentButtons: string[]
  // Desliga correção automática e sugestões do teclado, que acentuariam pelo aluno.
  strictTypingInput: boolean
  // null: o nome aparece em texto.
  logo: LanguageArt | null
  hero: LanguageArt | null
  homeNotice: HomeNotice
  texts: LanguageTexts
}
