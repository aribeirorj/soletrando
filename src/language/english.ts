import { getWordsByDifficulty } from '../data/words'
import { SPEAK_AND_SPELL_CATEGORIES, getSpeakAndSpellWords } from '../data/speakAndSpellCategories'
import { getWordHint } from '../data/wordHints'
import { matchesExpectedLetter } from '../speech/letterNames'
import { ENGLISH_RECOGNIZER } from '../speech/letterRecognition'
import logoJogo from '../assets/logo-jogo.png'
import heroAbelha from '../assets/hero-abelha-eua.png'
import type { LanguagePack } from './types'

const toUpperCase = (unit: string) => unit.toUpperCase()

// Spelling Bee: só aponta para o que já existia, para o jogo em inglês não mudar.
export const english: LanguagePack = {
  id: 'en',
  appName: 'Spelling Bee',
  storagePrefix: 'soletrando',
  speechLang: 'en-US',
  getWordsByDifficulty,
  categories: SPEAK_AND_SPELL_CATEGORIES,
  getSpeakAndSpellWords,
  getHint: getWordHint,
  matchesExpectedUnit: matchesExpectedLetter,
  speakUnit: toUpperCase,
  unitLabel: toUpperCase,
  recognizer: ENGLISH_RECOGNIZER,
  accentButtons: [],
  strictTypingInput: false,
  logo: { src: logoJogo, alt: 'Jogo de Soletrar' },
  hero: { src: heroAbelha, alt: 'Abelha de óculos escuros com microfone, blocos ABC, a bandeira dos Estados Unidos e o logo Spelling Bee' },
  showWhatsNew: true,
  texts: {
    typeWordPlaceholder: 'Digite a palavra em inglês',
    howToPlay: {
      'ouvir-digitar': 'Ouça a palavra em inglês e digite como ela se escreve.',
      'letras-embaralhadas': 'Coloque as letras embaralhadas na ordem certa para formar a palavra.',
      'falar-soletrar': 'Fale em inglês cada letra da palavra. Pelo microfone, o app confere cada letra e avança sozinho.',
    },
    speakInstruction: 'Fale em inglês a letra destacada.',
    spellingUnitsNote: 'espaços não contam',
  },
}
