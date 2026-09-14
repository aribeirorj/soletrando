import { create } from 'zustand'
import { useGameStore } from './gameStore'
import type { Difficulty, GameMode } from '../types'

export interface Student {
  id: string
  name: string
  totalScore: number
}

export function createStudent(name: string): Student {
  return { id: crypto.randomUUID(), name: name.trim(), totalScore: 0 }
}

export function addPointsToStudent(students: Student[], studentId: string, points: number): Student[] {
  return students.map((s) => (s.id === studentId ? { ...s, totalScore: s.totalScore + points } : s))
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
}

const DEFAULT_SESSION: PersistedSession = {
  students: [],
  questionsPerRound: 5,
  mode: null,
  difficulty: null,
}

function loadSession(): PersistedSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw !== null ? JSON.parse(raw) : (memorySession ?? DEFAULT_SESSION)
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

type SessionView = 'idle' | 'setup' | 'roster' | 'ranking'

interface SessionState {
  view: SessionView
  students: Student[]
  questionsPerRound: number
  mode: GameMode | null
  difficulty: Difficulty | null
  activeStudentId: string | null

  openSetup: () => void
  cancelSetup: () => void
  addStudent: (name: string) => void
  removeStudent: (id: string) => void
  setQuestionsPerRound: (n: number) => void
  startSession: (mode: GameMode, difficulty: Difficulty) => void
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
  activeStudentId: null,

  openSetup: () => set({ view: 'setup' }),

  cancelSetup: () => set({ view: 'idle' }),

  addStudent: (name) => {
    const students = [...get().students, createStudent(name)]
    set({ students })
    saveSession({
      students,
      questionsPerRound: get().questionsPerRound,
      mode: get().mode,
      difficulty: get().difficulty,
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
    })
  },

  setQuestionsPerRound: (n) => {
    set({ questionsPerRound: n })
    saveSession({
      students: get().students,
      questionsPerRound: n,
      mode: get().mode,
      difficulty: get().difficulty,
    })
  },

  startSession: (mode, difficulty) => {
    if (get().students.length === 0) return
    set({ mode, difficulty, view: 'roster' })
    saveSession({
      students: get().students,
      questionsPerRound: get().questionsPerRound,
      mode,
      difficulty,
    })
  },

  startTurn: (studentId) => {
    const { mode, difficulty, questionsPerRound } = get()
    if (!mode || !difficulty) return
    set({ activeStudentId: studentId })
    useGameStore.getState().startGame(mode, difficulty, questionsPerRound)
  },

  finishTurn: () => {
    const { activeStudentId, students } = get()
    if (activeStudentId) {
      const score = useGameStore.getState().score
      const updated = addPointsToStudent(students, activeStudentId, score)
      set({ students: updated, activeStudentId: null, view: 'roster' })
      saveSession({
        students: updated,
        questionsPerRound: get().questionsPerRound,
        mode: get().mode,
        difficulty: get().difficulty,
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
      activeStudentId: null,
    })
    saveSession(DEFAULT_SESSION)
  },
}))
