import { create } from 'zustand'
import { useGameStore } from './gameStore'
import type { Difficulty, GameMode } from '../types'

export interface Student {
  id: string
  name: string
  totalScore: number
  correctCount: number
  wrongCount: number
}

export function createStudent(name: string): Student {
  return { id: crypto.randomUUID(), name: name.trim(), totalScore: 0, correctCount: 0, wrongCount: 0 }
}

export interface TurnResult {
  score: number
  correctCount: number
  wrongCount: number
}

export function addTurnResultToStudent(
  students: Student[],
  studentId: string,
  result: TurnResult,
): Student[] {
  return students.map((s) =>
    s.id === studentId
      ? {
          ...s,
          totalScore: s.totalScore + result.score,
          correctCount: s.correctCount + result.correctCount,
          wrongCount: s.wrongCount + result.wrongCount,
        }
      : s,
  )
}

export function sortByScoreDescending(students: Student[]): Student[] {
  return [...students].sort((a, b) => b.totalScore - a.totalScore)
}

const SESSION_KEY = 'soletrando:session'
let memorySession: PersistedSession | null = null

interface PersistedSession {
  students: Student[]
  questionsPerRound: number
  mode: GameMode | null
  difficulty: Difficulty | null
  category: string | null
}

const DEFAULT_SESSION: PersistedSession = {
  students: [],
  questionsPerRound: 5,
  mode: null,
  difficulty: null,
  category: null,
}

function normalizeStudents(students: Student[]): Student[] {
  return students.map((s) => ({
    ...s,
    correctCount: s.correctCount ?? 0,
    wrongCount: s.wrongCount ?? 0,
  }))
}

function loadSession(): PersistedSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const session = raw !== null ? JSON.parse(raw) : (memorySession ?? DEFAULT_SESSION)
    return { ...session, students: normalizeStudents(session.students) }
  } catch {
    return memorySession ?? DEFAULT_SESSION
  }
}

function saveSession(session: PersistedSession): void {
  memorySession = session
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // fallback silencioso: valor já retido em memorySession
  }
}

type SessionView = 'idle' | 'roster' | 'ranking'

interface SessionState {
  view: SessionView
  students: Student[]
  questionsPerRound: number
  mode: GameMode | null
  difficulty: Difficulty | null
  category: string | null
  activeStudentId: string | null

  addStudent: (name: string) => void
  removeStudent: (id: string) => void
  setQuestionsPerRound: (n: number) => void
  startSession: (mode: GameMode, difficulty: Difficulty, category?: string | null) => void
  startTurn: (studentId: string) => void
  finishTurn: () => void
  cancelTurn: () => void
  openRanking: () => void
  closeRanking: () => void
  endSession: () => void
}

const initialSession = loadSession()

export const useSessionStore = create<SessionState>((set, get) => ({
  view: initialSession.students.length > 0 ? 'roster' : 'idle',
  students: initialSession.students,
  questionsPerRound: initialSession.questionsPerRound,
  mode: initialSession.mode,
  difficulty: initialSession.difficulty,
  category: initialSession.category,
  activeStudentId: null,

  addStudent: (name) => {
    const students = [...get().students, createStudent(name)]
    set({ students })
    saveSession({
      students,
      questionsPerRound: get().questionsPerRound,
      mode: get().mode,
      difficulty: get().difficulty,
      category: get().category,
    })
  },

  removeStudent: (id) => {
    const students = get().students.filter((s) => s.id !== id)
    set({ students })
    saveSession({
      students,
      questionsPerRound: get().questionsPerRound,
      mode: get().mode,
      difficulty: get().difficulty,
      category: get().category,
    })
  },

  setQuestionsPerRound: (n) => {
    set({ questionsPerRound: n })
    saveSession({
      students: get().students,
      questionsPerRound: n,
      mode: get().mode,
      difficulty: get().difficulty,
      category: get().category,
    })
  },

  startSession: (mode, difficulty, category = null) => {
    if (get().students.length === 0) return
    set({ mode, difficulty, category, view: 'roster' })
    saveSession({
      students: get().students,
      questionsPerRound: get().questionsPerRound,
      mode,
      difficulty,
      category,
    })
  },

  startTurn: (studentId) => {
    const { mode, difficulty, category, questionsPerRound } = get()
    if (!mode || !difficulty) return
    if (mode === 'falar-soletrar' && !category) {
      // Sessão persistida antes de categorias existirem (ou dado corrompido): sem uma
      // categoria válida o modo falar-soletrar não tem palavras para jogar. Volta pra
      // Home (view 'idle'), onde o professor pode reconfigurar a sessão de turma.
      set({ view: 'idle' })
      return
    }
    set({ activeStudentId: studentId })
    useGameStore.getState().startGame(mode, difficulty, questionsPerRound, category)
  },

  finishTurn: () => {
    const { activeStudentId, students } = get()
    if (activeStudentId) {
      const { score, correctCount, wrongCount } = useGameStore.getState()
      const updated = addTurnResultToStudent(students, activeStudentId, { score, correctCount, wrongCount })
      set({ students: updated, activeStudentId: null, view: 'roster' })
      saveSession({
        students: updated,
        questionsPerRound: get().questionsPerRound,
        mode: get().mode,
        difficulty: get().difficulty,
        category: get().category,
      })
    } else {
      set({ view: 'roster' })
    }
    useGameStore.getState().resetGame()
  },

  cancelTurn: () => {
    set({ activeStudentId: null, view: 'roster' })
    useGameStore.getState().resetGame()
  },

  openRanking: () => set({ view: 'ranking' }),

  closeRanking: () => set({ view: 'roster' }),

  endSession: () => {
    set({
      view: 'idle',
      students: [],
      mode: null,
      difficulty: null,
      category: null,
      activeStudentId: null,
    })
    saveSession(DEFAULT_SESSION)
  },
}))
