import { getPortugueseWordsByDifficulty } from '../data/pt/words'
import { PT_SPEAK_AND_SPELL_CATEGORIES, getPortugueseSpeakAndSpellWords } from '../data/pt/speakAndSpellCategories'
import { getPortugueseWordHint } from '../data/pt/wordHints'
import heroSoletrando from '../assets/pt/hero-soletrando.png'
import logoSoletrando from '../assets/pt/logo-soletrando.png'
import { PORTUGUESE_LABELS } from './portugueseLabels'
import type { LanguagePack } from './types'

// Nome de cada letra como o aluno fala ao soletrar.
const LETTER_NAMES: Record<string, string> = {
  a: 'a', b: 'bê', c: 'cê', d: 'dê', e: 'é', f: 'efe', g: 'gê', h: 'agá', i: 'i', j: 'jota',
  k: 'cá', l: 'ele', m: 'eme', n: 'ene', o: 'ó', p: 'pê', q: 'quê', r: 'erre', s: 'esse',
  t: 'tê', u: 'u', v: 'vê', w: 'dáblio', x: 'xis', y: 'ípsilon', z: 'zê',
}

// Sinais gráficos (marcas combinantes do Unicode) e como se falam depois da letra.
const ACUTE = '́'
const GRAVE = '̀'
const CIRCUMFLEX = '̂'
const TILDE = '̃'
const CEDILLA = '̧'

const MARK_NAMES: Record<string, string> = {
  [ACUTE]: 'acento agudo',
  [GRAVE]: 'crase',
  [CIRCUMFLEX]: 'acento circunflexo',
  [TILDE]: 'til',
}

// E e O com acento dizem o timbre da vogal: "é com acento agudo", "ô com acento circunflexo".
const VOWEL_WITH_MARK: Record<string, string> = {
  [`e${ACUTE}`]: 'é',
  [`e${CIRCUMFLEX}`]: 'ê',
  [`o${ACUTE}`]: 'ó',
  [`o${CIRCUMFLEX}`]: 'ô',
}

function vowelName(base: string, mark: string): string {
  return VOWEL_WITH_MARK[base + mark] ?? base
}

// "é com acento agudo", "cê cedilha", "hífen": o que o app fala em "Ouvir a pronúncia".
function speakPortugueseUnit(unit: string): string {
  if (unit === '-') return 'hífen'
  const [base, ...marks] = unit.normalize('NFD').toLowerCase()
  if (marks.length === 0) return LETTER_NAMES[base] ?? base
  if (marks[0] === CEDILLA) return `${LETTER_NAMES[base] ?? base} cedilha`
  const markName = MARK_NAMES[marks[0]]
  return markName ? `${vowelName(base, marks[0])} com ${markName}` : unit
}

function portugueseUnitLabel(unit: string): string {
  return unit === '-' ? 'HÍFEN' : unit.toUpperCase()
}

// Soletrando: palavras em português, com Sinais gráficos e hífen fazendo parte da grafia.
export const portuguese: LanguagePack = {
  id: 'pt',
  appName: 'Soletrando',
  storagePrefix: 'soletrando-pt',
  speechLang: 'pt-BR',
  getWordsByDifficulty: getPortugueseWordsByDifficulty,
  categories: PT_SPEAK_AND_SPELL_CATEGORIES,
  getSpeakAndSpellWords: getPortugueseSpeakAndSpellWords,
  getHint: getPortugueseWordHint,
  matchesExpectedUnit: (heard, expected) => heard.normalize('NFC') === expected.normalize('NFC'),
  speakUnit: speakPortugueseUnit,
  unitLabel: portugueseUnitLabel,
  // O modelo de voz em português não reconhece os nomes das letras
  // (docs/spikes/2026-09-19-voz-em-portugues.md): só Correto/Incorreto.
  recognizer: null,
  accentButtons: ['á', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'],
  strictTypingInput: true,
  logo: { src: logoSoletrando, alt: 'Soletrando' },
  hero: { src: heroSoletrando, alt: 'Abelha de óculos escuros com microfone, blocos ABC e o logo Soletrando' },
  homeNotice: 'como-funciona-soletrando',
  labels: PORTUGUESE_LABELS,
  texts: {
    typeWordPlaceholder: 'Digite a palavra',
    howToPlay: {
      'ouvir-digitar': 'Ouça a palavra e digite como ela se escreve, com acentos e hífen.',
      'letras-embaralhadas':
        'Coloque as letras embaralhadas na ordem certa para formar a palavra. Letra com acento e hífen são blocos próprios.',
      'falar-soletrar':
        'Fale em voz alta cada letra da palavra, dizendo também o acento ("é com acento agudo", "cê cedilha") e o hífen.',
    },
    speakInstruction: 'Fale a letra destacada, com o acento se houver.',
    spellingUnitsNote: 'letra com acento e hífen contam como uma letra; espaços não contam',
  },
}
