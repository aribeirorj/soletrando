import { create } from 'zustand'
import { getWordsByDifficulty } from '../data/words'
import { getSpeakAndSpellWords } from '../data/speakAndSpellCategories'
import type { Difficulty, GameMode, GameStatus, Word } from '../types'

const SPEAK_AND_SPELL_DIFFICULTY: Difficulty = 'dificil'

function getWordPool(mode: GameMode, difficulty: Difficulty, category: string[] | null): Word[] {
  return mode === 'falar-soletrar' ? getSpeakAndSpellWords(category) : getWordsByDifficulty(difficulty)
}

export function pickNextRandomWord(pool: Word[], previous: Word | null): Word {
  if (pool.length <= 1) {
    return pool[0]
  }

  const candidates = previous
    ? pool.filter((w) => w.text !== previous.text)
    : pool

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function isAnswerCorrect(answer: string, target: string): boolean {
  return answer.trim().toLowerCase() === target.trim().toLowerCase()
}

const BASE_SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  facil: 10,
  medio: 20,
  dificil: 30,
}

export function computeQuestionScore(difficulty: Difficulty, usedHint: boolean): number {
  const base = BASE_SCORE_BY_DIFFICULTY[difficulty]
  return usedHint ? Math.round(base / 2) : base
}

export const SPEAK_AND_SPELL_POINTS_PER_LETTER = 10

export const QUESTION_SECONDS_BY_MODE: Record<GameMode, number> = {
  'ouvir-digitar': 20,
  'letras-embaralhadas': 25,
  'falar-soletrar': 30,
}

export const SPEAK_AND_SPELL_SECONDS_PER_LETTER = 5

// Falar e Soletrar: 5 s por letra, sem ficar abaixo do tempo mínimo do modo.
export function getSpellingSeconds(wordText: string): number {
  const letterCount = wordText.replace(/ /g, '').length
  return Math.max(QUESTION_SECONDS_BY_MODE['falar-soletrar'], letterCount * SPEAK_AND_SPELL_SECONDS_PER_LETTER)
}

export function computeNextStreak(currentStreak: number, wasCorrect: boolean): number {
  return wasCorrect ? currentStreak + 1 : 0
}

const HIGH_SCORE_KEY = 'soletrando:highScore'
let memoryHighScore = 0

function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY)
    return raw !== null ? Number(raw) || 0 : memoryHighScore
  } catch {
    return memoryHighScore
  }
}

function saveHighScore(value: number): void {
  memoryHighScore = value
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value))
  } catch {
    // fallback silencioso: valor já retido em memoryHighScore
  }
}

const PLAYER_NAME_KEY = 'soletrando:playerName'
let memoryPlayerName = ''

function loadPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) ?? memoryPlayerName
  } catch {
    return memoryPlayerName
  }
}

function savePlayerName(value: string): void {
  memoryPlayerName = value
  try {
    localStorage.setItem(PLAYER_NAME_KEY, value)
  } catch {
    // fallback silencioso: valor já retido em memoryPlayerName
  }
}

function applyScoreDelta(
  currentScore: number,
  currentHighScore: number,
  delta: number,
): { score: number; highScore: number } {
  const score = currentScore + delta
  const highScore = score > currentHighScore ? score : currentHighScore
  if (highScore > currentHighScore) {
    saveHighScore(highScore)
  }
  return { score, highScore }
}

interface GameState {
  mode: GameMode | null
  difficulty: Difficulty | null
  category: string[] | null
  currentWord: Word | null
  status: GameStatus
  score: number
  streak: number
  highScore: number
  hintUsedThisQuestion: boolean
  playerName: string
  turnLength: number | null
  questionsAnsweredInTurn: number
  correctCount: number
  wrongCount: number

  startGame: (
    mode: GameMode,
    difficulty: Difficulty,
    turnLength?: number,
    category?: string[] | null,
  ) => void
  submitAnswer: (answer: string) => boolean
  awardSpellingLetters: (count: number) => void
  completeSpellingWord: (wasCorrect: boolean) => void
  useHint: () => void
  handleTimeout: () => void
  pickNextWord: () => void
  resetGame: () => void
  setPlayerName: (name: string) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: null,
  difficulty: null,
  category: null,
  currentWord: null,
  status: 'jogando',
  score: 0,
  streak: 0,
  highScore: loadHighScore(),
  hintUsedThisQuestion: false,
  playerName: loadPlayerName(),
  turnLength: null,
  questionsAnsweredInTurn: 0,
  correctCount: 0,
  wrongCount: 0,

  startGame: (mode, difficulty, turnLength, category = null) => {
    const effectiveDifficulty = mode === 'falar-soletrar' ? SPEAK_AND_SPELL_DIFFICULTY : difficulty
    const word = pickNextRandomWord(getWordPool(mode, effectiveDifficulty, category), null)
    set({
      mode,
      difficulty: effectiveDifficulty,
      category,
      currentWord: word,
      status: 'jogando',
      score: 0,
      streak: 0,
      hintUsedThisQuestion: false,
      turnLength: turnLength ?? null,
      questionsAnsweredInTurn: 0,
      correctCount: 0,
      wrongCount: 0,
    })
  },

  submitAnswer: (answer) => {
    const {
      status,
      currentWord,
      difficulty,
      hintUsedThisQuestion,
      score,
      streak,
      highScore,
      questionsAnsweredInTurn,
      correctCount,
      wrongCount,
    } = get()
    if (status !== 'jogando' || !currentWord || !difficulty) {
      return false
    }

    const correct = isAnswerCorrect(answer, currentWord.text)

    if (correct) {
      const { score: newScore, highScore: newHighScore } = applyScoreDelta(
        score,
        highScore,
        computeQuestionScore(difficulty, hintUsedThisQuestion),
      )
      set({
        status: 'acertou',
        score: newScore,
        streak: computeNextStreak(streak, true),
        highScore: newHighScore,
        questionsAnsweredInTurn: questionsAnsweredInTurn + 1,
        correctCount: correctCount + 1,
      })
    } else {
      set({
        status: 'errou',
        streak: computeNextStreak(streak, false),
        questionsAnsweredInTurn: questionsAnsweredInTurn + 1,
        wrongCount: wrongCount + 1,
      })
    }

    return correct
  },

  // Falar e Soletrar: cada letra certa pontua na hora, mesmo que outra letra da palavra erre.
  awardSpellingLetters: (count) => {
    const { score, highScore } = get()
    set(applyScoreDelta(score, highScore, count * SPEAK_AND_SPELL_POINTS_PER_LETTER))
  },

  // Fecha a palavra (os pontos já vieram por letra): acerto só se nenhuma letra errou.
  completeSpellingWord: (wasCorrect) => {
    const { status, streak, questionsAnsweredInTurn, currentWord, correctCount, wrongCount } = get()
    if (status !== 'jogando' || !currentWord) return
    set({
      status: wasCorrect ? 'acertou' : 'errou',
      streak: computeNextStreak(streak, wasCorrect),
      questionsAnsweredInTurn: questionsAnsweredInTurn + 1,
      correctCount: wasCorrect ? correctCount + 1 : correctCount,
      wrongCount: wasCorrect ? wrongCount : wrongCount + 1,
    })
  },

  useHint: () => {
    if (get().status === 'jogando') {
      set({ hintUsedThisQuestion: true })
    }
  },

  handleTimeout: () => {
    const { status, questionsAnsweredInTurn, wrongCount } = get()
    if (status === 'jogando') {
      set({
        status: 'tempo-esgotado',
        streak: 0,
        questionsAnsweredInTurn: questionsAnsweredInTurn + 1,
        wrongCount: wrongCount + 1,
      })
    }
  },

  pickNextWord: () => {
    const { mode, difficulty, category, currentWord, turnLength, questionsAnsweredInTurn } = get()
    if (!mode || !difficulty) return
    if (turnLength !== null && questionsAnsweredInTurn >= turnLength) return
    const word = pickNextRandomWord(getWordPool(mode, difficulty, category), currentWord)
    set({ currentWord: word, status: 'jogando', hintUsedThisQuestion: false })
  },

  resetGame: () => {
    set({
      mode: null,
      difficulty: null,
      category: null,
      currentWord: null,
      status: 'jogando',
      score: 0,
      streak: 0,
      hintUsedThisQuestion: false,
      turnLength: null,
      questionsAnsweredInTurn: 0,
      correctCount: 0,
      wrongCount: 0,
    })
  },

  setPlayerName: (name) => {
    savePlayerName(name)
    set({ playerName: name })
  },
}))
