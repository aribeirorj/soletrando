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

// Rótulos da interface (botões, títulos, campos, placar, contadores). No Spelling Bee vão em
// inglês; as informações importantes (Regras, Novidades, Dicas, explicações do resultado,
// instruções ao professor e avisos) ficam em português nos dois.
export interface LanguageLabels {
  // Tela inicial
  howToPlayQuestion: string
  playSolo: string
  playWithClass: string
  playerName: string
  playerNamePlaceholder: string
  students: string
  studentNamePlaceholder: string
  add: string
  removeStudent: (name: string) => string
  questionsPerTurn: string
  startGame: string
  startSession: string
  gameMode: string
  modes: Record<GameMode, string>
  difficulty: string
  difficulties: Record<Difficulty, string>
  categories: string
  selectCategories: string
  seeRules: string
  highScoreBadge: (value: number, playerName?: string) => string
  // Placar e jogo
  player: string
  points: string
  streak: string
  highScore: string
  question: (current: number, total: number | null) => string
  backToMenu: string
  nextWord: string
  seeTurnResult: string
  correctAnswer: string
  wrongAnswer: (word: string) => string
  timeUp: (word: string) => string
  hint: string
  hintPrefix: string
  repeat: string
  check: string
  clear: string
  letterCounter: (current: number, total: number) => string
  hearPronunciation: string
  markCorrect: string
  markIncorrect: string
  useButtons: string
  backToSpeaking: string
  wordCorrect: (points: number) => string
  youSaid: string
  listening: string
  heard: (letters: string) => string
  // Leitor de tela, no balão da Letra ouvida certa.
  matches: string
  // Turma
  classSession: string
  correctCount: (count: number) => string
  wrongCount: (count: number) => string
  play: string
  seeRanking: string
  endSession: string
  classRanking: string
  pointsCount: (points: number) => string
  rankPosition: (position: number) => string
  back: string
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
  labels: LanguageLabels
  texts: LanguageTexts
}
