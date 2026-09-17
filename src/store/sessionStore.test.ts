import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  addTurnResultToStudent,
  createStudent,
  sortByScoreDescending,
  useSessionStore,
} from './sessionStore'
import type { Student } from './sessionStore'
import { useGameStore } from './gameStore'

describe('createStudent', () => {
  test('trims the name', () => {
    expect(createStudent('  Ana  ').name).toBe('Ana')
  })

  test('starts with zero total score, correct count and wrong count', () => {
    const student = createStudent('Ana')
    expect(student.totalScore).toBe(0)
    expect(student.correctCount).toBe(0)
    expect(student.wrongCount).toBe(0)
  })

  test('assigns a non-empty unique id to each student', () => {
    const a = createStudent('Ana')
    const b = createStudent('Beto')

    expect(a.id).toBeTruthy()
    expect(b.id).toBeTruthy()
    expect(a.id).not.toBe(b.id)
  })
})

describe('addTurnResultToStudent', () => {
  const students: Student[] = [
    { id: '1', name: 'Ana', totalScore: 10, correctCount: 2, wrongCount: 1 },
    { id: '2', name: 'Beto', totalScore: 5, correctCount: 1, wrongCount: 0 },
  ]

  test('adds the score, correct count and wrong count to the matching student only', () => {
    const result = addTurnResultToStudent(students, '1', { score: 20, correctCount: 3, wrongCount: 2 })

    const ana = result.find((s) => s.id === '1')
    expect(ana?.totalScore).toBe(30)
    expect(ana?.correctCount).toBe(5)
    expect(ana?.wrongCount).toBe(3)
    const beto = result.find((s) => s.id === '2')
    expect(beto?.totalScore).toBe(5)
    expect(beto?.correctCount).toBe(1)
    expect(beto?.wrongCount).toBe(0)
  })

  test('does not mutate the original array', () => {
    addTurnResultToStudent(students, '1', { score: 20, correctCount: 3, wrongCount: 2 })

    expect(students.find((s) => s.id === '1')?.totalScore).toBe(10)
  })
})

describe('sortByScoreDescending', () => {
  test('orders students from highest to lowest score', () => {
    const students: Student[] = [
      { id: '1', name: 'Ana', totalScore: 10, correctCount: 0, wrongCount: 0 },
      { id: '2', name: 'Beto', totalScore: 30, correctCount: 0, wrongCount: 0 },
      { id: '3', name: 'Caio', totalScore: 20, correctCount: 0, wrongCount: 0 },
    ]

    const sorted = sortByScoreDescending(students)

    expect(sorted.map((s) => s.name)).toEqual(['Beto', 'Caio', 'Ana'])
  })

  test('keeps the original relative order for tied scores', () => {
    const students: Student[] = [
      { id: '1', name: 'Ana', totalScore: 10, correctCount: 0, wrongCount: 0 },
      { id: '2', name: 'Beto', totalScore: 10, correctCount: 0, wrongCount: 0 },
    ]

    const sorted = sortByScoreDescending(students)

    expect(sorted.map((s) => s.name)).toEqual(['Ana', 'Beto'])
  })
})

describe('useSessionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({
      view: 'idle',
      students: [],
      questionsPerTurn: 5,
      mode: null,
      difficulty: null,
      category: null,
      activeStudentId: null,
    })
    useGameStore.getState().resetGame()
  })

  test('startSession switches the view to roster', () => {
    useSessionStore.getState().addStudent('Ana')

    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    expect(useSessionStore.getState().view).toBe('roster')
  })

  test('openRanking and closeRanking toggle between ranking and roster views', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    useSessionStore.getState().openRanking()
    expect(useSessionStore.getState().view).toBe('ranking')

    useSessionStore.getState().closeRanking()
    expect(useSessionStore.getState().view).toBe('roster')
  })

  test('endSession switches the view back to idle', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    useSessionStore.getState().endSession()

    expect(useSessionStore.getState().view).toBe('idle')
  })

  test('addStudent appends a new student with zero score', () => {
    useSessionStore.getState().addStudent('Ana')

    const { students } = useSessionStore.getState()
    expect(students).toHaveLength(1)
    expect(students[0].name).toBe('Ana')
    expect(students[0].totalScore).toBe(0)
  })

  test('removeStudent removes only the matching student', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().addStudent('Beto')
    const idToRemove = useSessionStore.getState().students[0].id

    useSessionStore.getState().removeStudent(idToRemove)

    const { students } = useSessionStore.getState()
    expect(students).toHaveLength(1)
    expect(students[0].name).toBe('Beto')
  })

  test('startSession requires at least one student', () => {
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    expect(useSessionStore.getState().mode).toBeNull()
  })

  test('startSession stores the chosen mode and difficulty', () => {
    useSessionStore.getState().addStudent('Ana')

    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    const state = useSessionStore.getState()
    expect(state.mode).toBe('ouvir-digitar')
    expect(state.difficulty).toBe('facil')
  })

  test('startTurn starts a game turn for the chosen student with the configured turn length', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    useSessionStore.setState({ questionsPerTurn: 3 })
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)

    const gameState = useGameStore.getState()
    expect(gameState.mode).toBe('ouvir-digitar')
    expect(gameState.difficulty).toBe('facil')
    expect(gameState.turnLength).toBe(3)
  })

  test('finishTurn adds the turn score, correct count and wrong count to the active student and resets the game', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    const studentId = useSessionStore.getState().students[0].id
    useSessionStore.getState().startTurn(studentId)
    useGameStore.setState({ score: 25, correctCount: 2, wrongCount: 1 })

    useSessionStore.getState().finishTurn()

    const student = useSessionStore.getState().students.find((s) => s.id === studentId)
    expect(student?.totalScore).toBe(25)
    expect(student?.correctCount).toBe(2)
    expect(student?.wrongCount).toBe(1)
    expect(useGameStore.getState().mode).toBeNull()
  })

  test('finishTurn accumulates results across multiple turns for the same student', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)
    useGameStore.setState({ score: 10, correctCount: 1, wrongCount: 0 })
    useSessionStore.getState().finishTurn()

    useSessionStore.getState().startTurn(studentId)
    useGameStore.setState({ score: 20, correctCount: 1, wrongCount: 2 })
    useSessionStore.getState().finishTurn()

    const student = useSessionStore.getState().students.find((s) => s.id === studentId)
    expect(student?.totalScore).toBe(30)
    expect(student?.correctCount).toBe(2)
    expect(student?.wrongCount).toBe(2)
  })

  test('cancelTurn resets the game without crediting any points', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    const studentId = useSessionStore.getState().students[0].id
    useSessionStore.getState().startTurn(studentId)
    useGameStore.setState({ score: 25 })

    useSessionStore.getState().cancelTurn()

    const student = useSessionStore.getState().students.find((s) => s.id === studentId)
    expect(student?.totalScore).toBe(0)
    expect(useGameStore.getState().mode).toBeNull()
  })

  test('endSession clears the student roster', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')

    useSessionStore.getState().endSession()

    expect(useSessionStore.getState().students).toEqual([])
    expect(useSessionStore.getState().mode).toBeNull()
  })

  test('startSession stores the chosen categories for falar-soletrar', () => {
    useSessionStore.getState().addStudent('Ana')

    useSessionStore.getState().startSession('falar-soletrar', 'dificil', ['animals'])

    expect(useSessionStore.getState().category).toEqual(['animals'])
  })

  test('startTurn passes the session categories through to the game store', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('falar-soletrar', 'dificil', ['animals'])
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)

    const gameState = useGameStore.getState()
    expect(gameState.mode).toBe('falar-soletrar')
    expect(gameState.category).toEqual(['animals'])
  })

  test('startTurn sends the teacher back to the home screen instead of starting falar-soletrar without a category (e.g. a session persisted before categories existed)', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.setState({
      mode: 'falar-soletrar',
      difficulty: 'facil',
      category: null,
      view: 'roster',
    })
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)

    expect(useSessionStore.getState().view).toBe('idle')
    expect(useGameStore.getState().mode).toBeNull()
    expect(useGameStore.getState().currentWord).toBeNull()
  })

  test('startTurn sends the teacher back to the home screen when the session category list is empty', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.setState({
      mode: 'falar-soletrar',
      difficulty: 'facil',
      category: [],
      view: 'roster',
    })
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)

    expect(useSessionStore.getState().view).toBe('idle')
  })
})

describe('sessão persistida', () => {
  test('lê a chave antiga questionsPerRound como questionsPerTurn', async () => {
    localStorage.setItem(
      'soletrando:session',
      JSON.stringify({ students: [], questionsPerRound: 7, mode: null, difficulty: null, category: null }),
    )
    vi.resetModules()
    const { useSessionStore: freshStore } = await import('./sessionStore')
    expect(freshStore.getState().questionsPerTurn).toBe(7)
    localStorage.clear()
  })
})
