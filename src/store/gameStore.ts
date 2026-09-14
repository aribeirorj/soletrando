import { create } from 'zustand'
import { getWordsByDifficulty } from '../data/words'
import type { Difficulty, GameMode, GameStatus, Word } from '../types'

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

export function computeRoundScore(difficulty: Difficulty, usedHint: boolean): number {
  const base = BASE_SCORE_BY_DIFFICULTY[difficulty]
  return usedHint ? Math.round(base / 2) : base
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

interface GameState {
  mode: GameMode | null
  difficulty: Difficulty | null
  currentWord: Word | null
  status: GameStatus
  score: number
  streak: number
  highScore: number
  hintUsedThisRound: boolean
  playerName: string
  roundLength: number | null
  questionsAnsweredInRound: number

  startGame: (mode: GameMode, difficulty: Difficulty, roundLength?: number) => void
  submitAnswer: (answer: string) => boolean
  useHint: () => void
  handleTimeout: () => void
  pickNextWord: () => void
  resetGame: () => void
  setPlayerName: (name: string) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: null,
  difficulty: null,
  currentWord: null,
  status: 'jogando',
  score: 0,
  streak: 0,
  highScore: loadHighScore(),
  hintUsedThisRound: false,
  playerName: loadPlayerName(),
  roundLength: null,
  questionsAnsweredInRound: 0,

  startGame: (mode, difficulty, roundLength) => {
    const word = pickNextRandomWord(getWordsByDifficulty(difficulty), null)
    set({
      mode,
      difficulty,
      currentWord: word,
      status: 'jogando',
      score: 0,
      streak: 0,
      hintUsedThisRound: false,
      roundLength: roundLength ?? null,
      questionsAnsweredInRound: 0,
    })
  },

  submitAnswer: (answer) => {
    const { status, currentWord, difficulty, hintUsedThisRound, score, streak, highScore, questionsAnsweredInRound } = get()
    if (status !== 'jogando' || !currentWord || !difficulty) {
      return false
    }

    const correct = isAnswerCorrect(answer, currentWord.text)

    if (correct) {
      const newScore = score + computeRoundScore(difficulty, hintUsedThisRound)
      const newHighScore = newScore > highScore ? newScore : highScore
      if (newHighScore > highScore) {
        saveHighScore(newHighScore)
      }
      set({
        status: 'acertou',
        score: newScore,
        streak: computeNextStreak(streak, true),
        highScore: newHighScore,
        questionsAnsweredInRound: questionsAnsweredInRound + 1,
      })
    } else {
      set({
        status: 'errou',
        streak: computeNextStreak(streak, false),
        questionsAnsweredInRound: questionsAnsweredInRound + 1,
      })
    }

    return correct
  },

  useHint: () => {
    if (get().status === 'jogando') {
      set({ hintUsedThisRound: true })
    }
  },

  handleTimeout: () => {
    const { status, questionsAnsweredInRound } = get()
    if (status === 'jogando') {
      set({
        status: 'tempo-esgotado',
        streak: 0,
        questionsAnsweredInRound: questionsAnsweredInRound + 1,
      })
    }
  },

  pickNextWord: () => {
    const { difficulty, currentWord, roundLength, questionsAnsweredInRound } = get()
    if (!difficulty) return
    if (roundLength !== null && questionsAnsweredInRound >= roundLength) return
    const word = pickNextRandomWord(getWordsByDifficulty(difficulty), currentWord)
    set({ currentWord: word, status: 'jogando', hintUsedThisRound: false })
  },

  resetGame: () => {
    set({
      mode: null,
      difficulty: null,
      currentWord: null,
      status: 'jogando',
      score: 0,
      streak: 0,
      hintUsedThisRound: false,
      roundLength: null,
      questionsAnsweredInRound: 0,
    })
  },

  setPlayerName: (name) => {
    savePlayerName(name)
    set({ playerName: name })
  },
}))
