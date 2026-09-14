import { beforeEach, describe, expect, test } from 'vitest'
import {
  addPointsToStudent,
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

  test('starts with zero total score', () => {
    expect(createStudent('Ana').totalScore).toBe(0)
  })

  test('assigns a non-empty unique id to each student', () => {
    const a = createStudent('Ana')
    const b = createStudent('Beto')

    expect(a.id).toBeTruthy()
    expect(b.id).toBeTruthy()
    expect(a.id).not.toBe(b.id)
  })
})

describe('addPointsToStudent', () => {
  const students: Student[] = [
    { id: '1', name: 'Ana', totalScore: 10 },
    { id: '2', name: 'Beto', totalScore: 5 },
  ]

  test('adds points to the matching student only', () => {
    const result = addPointsToStudent(students, '1', 20)

    expect(result.find((s) => s.id === '1')?.totalScore).toBe(30)
    expect(result.find((s) => s.id === '2')?.totalScore).toBe(5)
  })

  test('does not mutate the original array', () => {
    addPointsToStudent(students, '1', 20)

    expect(students.find((s) => s.id === '1')?.totalScore).toBe(10)
  })
})

describe('sortByScoreDescending', () => {
  test('orders students from highest to lowest score', () => {
    const students: Student[] = [
      { id: '1', name: 'Ana', totalScore: 10 },
      { id: '2', name: 'Beto', totalScore: 30 },
      { id: '3', name: 'Caio', totalScore: 20 },
    ]

    const sorted = sortByScoreDescending(students)

    expect(sorted.map((s) => s.name)).toEqual(['Beto', 'Caio', 'Ana'])
  })

  test('keeps the original relative order for tied scores', () => {
    const students: Student[] = [
      { id: '1', name: 'Ana', totalScore: 10 },
      { id: '2', name: 'Beto', totalScore: 10 },
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
      questionsPerRound: 5,
      mode: null,
      difficulty: null,
      activeStudentId: null,
    })
    useGameStore.getState().resetGame()
  })

  test('openSetup switches the view to setup', () => {
    useSessionStore.getState().openSetup()

    expect(useSessionStore.getState().view).toBe('setup')
  })

  test('cancelSetup switches the view back to idle', () => {
    useSessionStore.getState().openSetup()

    useSessionStore.getState().cancelSetup()

    expect(useSessionStore.getState().view).toBe('idle')
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

  test('startTurn starts a game round for the chosen student with the configured round length', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    useSessionStore.setState({ questionsPerRound: 3 })
    const studentId = useSessionStore.getState().students[0].id

    useSessionStore.getState().startTurn(studentId)

    const gameState = useGameStore.getState()
    expect(gameState.mode).toBe('ouvir-digitar')
    expect(gameState.difficulty).toBe('facil')
    expect(gameState.roundLength).toBe(3)
  })

  test('finishTurn adds the round score to the active student and resets the game', () => {
    useSessionStore.getState().addStudent('Ana')
    useSessionStore.getState().startSession('ouvir-digitar', 'facil')
    const studentId = useSessionStore.getState().students[0].id
    useSessionStore.getState().startTurn(studentId)
    useGameStore.setState({ score: 25 })

    useSessionStore.getState().finishTurn()

    const student = useSessionStore.getState().students.find((s) => s.id === studentId)
    expect(student?.totalScore).toBe(25)
    expect(useGameStore.getState().mode).toBeNull()
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
})
