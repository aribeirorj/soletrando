import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  computeNextStreak,
  computeQuestionScore,
  getSpellingSeconds,
  isAnswerCorrect,
  pickNextRandomWord,
  SPEAK_AND_SPELL_POINTS_PER_LETTER,
  useGameStore,
} from './gameStore'
import type { Word } from '../types'

describe('pickNextRandomWord', () => {
  test('never returns the same word as previous when pool has more than one word', () => {
    const pool: Word[] = [
      { text: 'cat', difficulty: 'facil' },
      { text: 'dog', difficulty: 'facil' },
    ]
    const previous = pool[0]

    for (let i = 0; i < 30; i++) {
      const next = pickNextRandomWord(pool, previous)
      expect(next.text).not.toBe(previous.text)
    }
  })

  test('returns the only word available when pool has a single word', () => {
    const pool: Word[] = [{ text: 'cat', difficulty: 'facil' }]

    const next = pickNextRandomWord(pool, pool[0])

    expect(next.text).toBe('cat')
  })
})

describe('isAnswerCorrect', () => {
  test('matches regardless of case', () => {
    expect(isAnswerCorrect('Cat', 'cat')).toBe(true)
  })

  test('matches ignoring surrounding whitespace', () => {
    expect(isAnswerCorrect(' cat ', 'cat')).toBe(true)
  })

  test('rejects a wrong answer', () => {
    expect(isAnswerCorrect('dog', 'cat')).toBe(false)
  })
})

describe('computeQuestionScore', () => {
  test('gives full base score per difficulty without a hint', () => {
    expect(computeQuestionScore('facil', false)).toBe(10)
    expect(computeQuestionScore('medio', false)).toBe(20)
    expect(computeQuestionScore('dificil', false)).toBe(30)
  })

  test('halves the score when a hint was used', () => {
    expect(computeQuestionScore('facil', true)).toBe(5)
    expect(computeQuestionScore('medio', true)).toBe(10)
    expect(computeQuestionScore('dificil', true)).toBe(15)
  })
})

describe('computeNextStreak', () => {
  test('increments the streak on a correct answer', () => {
    expect(computeNextStreak(3, true)).toBe(4)
  })

  test('resets the streak to zero on a wrong answer', () => {
    expect(computeNextStreak(3, false)).toBe(0)
  })
})

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.setState({
      mode: null,
      difficulty: null,
      category: null,
      currentWord: null,
      status: 'jogando',
      score: 0,
      streak: 0,
      highScore: 0,
      hintUsedThisQuestion: false,
      playerName: '',
      turnLength: null,
      questionsAnsweredInTurn: 0,
      correctCount: 0,
      wrongCount: 0,
    })
  })

  test('startGame selects a word from the chosen difficulty and resets question state', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    const state = useGameStore.getState()
    expect(state.mode).toBe('ouvir-digitar')
    expect(state.difficulty).toBe('facil')
    expect(state.currentWord?.difficulty).toBe('facil')
    expect(state.status).toBe('jogando')
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
  })

  test('submitAnswer with the correct word increases score and streak', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    const word = useGameStore.getState().currentWord!

    const correct = useGameStore.getState().submitAnswer(word.text.toUpperCase())

    expect(correct).toBe(true)
    const state = useGameStore.getState()
    expect(state.status).toBe('acertou')
    expect(state.score).toBe(10)
    expect(state.streak).toBe(1)
  })

  test('submitAnswer with a wrong answer resets the streak and keeps the score', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    useGameStore.setState({ streak: 5 })

    const correct = useGameStore.getState().submitAnswer('not-a-real-word')

    expect(correct).toBe(false)
    const state = useGameStore.getState()
    expect(state.status).toBe('errou')
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
  })

  test('using a hint halves the score awarded for a correct answer', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    const word = useGameStore.getState().currentWord!
    useGameStore.getState().useHint()

    useGameStore.getState().submitAnswer(word.text)

    expect(useGameStore.getState().score).toBe(5)
  })

  test('handleTimeout counts as a wrong answer without changing the score', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    useGameStore.setState({ streak: 2, score: 10 })

    useGameStore.getState().handleTimeout()

    const state = useGameStore.getState()
    expect(state.status).toBe('tempo-esgotado')
    expect(state.streak).toBe(0)
    expect(state.score).toBe(10)
  })

  test('pickNextWord moves to a new question with a different word', () => {
    useGameStore.getState().startGame('letras-embaralhadas', 'facil')
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(state.status).toBe('jogando')
    expect(state.hintUsedThisQuestion).toBe(false)
    expect(state.currentWord?.text).not.toBe(first.text)
  })

  test('resetGame returns to the home screen but keeps the high score', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    useGameStore.setState({ highScore: 40 })

    useGameStore.getState().resetGame()

    const state = useGameStore.getState()
    expect(state.mode).toBeNull()
    expect(state.currentWord).toBeNull()
    expect(state.highScore).toBe(40)
  })

  test('a new high score is persisted to localStorage', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    const word = useGameStore.getState().currentWord!

    useGameStore.getState().submitAnswer(word.text)

    expect(localStorage.getItem('soletrando:highScore')).toBe(
      String(useGameStore.getState().highScore),
    )
  })

  test('falls back to in-memory high score when localStorage is unavailable', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    const word = useGameStore.getState().currentWord!
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('unavailable')
    })

    expect(() => useGameStore.getState().submitAnswer(word.text)).not.toThrow()
    expect(useGameStore.getState().score).toBeGreaterThan(0)

    vi.restoreAllMocks()
  })

  test('setPlayerName updates the state and persists it to localStorage', () => {
    useGameStore.getState().setPlayerName('Ana')

    expect(useGameStore.getState().playerName).toBe('Ana')
    expect(localStorage.getItem('soletrando:playerName')).toBe('Ana')
  })

  test('setPlayerName falls back to in-memory storage when localStorage is unavailable', () => {
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('unavailable')
    })

    expect(() => useGameStore.getState().setPlayerName('Ana')).not.toThrow()
    expect(useGameStore.getState().playerName).toBe('Ana')

    vi.restoreAllMocks()
  })

  test('startGame without a turn length defaults to unlimited questions', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    const state = useGameStore.getState()
    expect(state.turnLength).toBeNull()
    expect(state.questionsAnsweredInTurn).toBe(0)
  })

  test('startGame with a turn length stores it and resets the question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    const state = useGameStore.getState()
    expect(state.turnLength).toBe(3)
    expect(state.questionsAnsweredInTurn).toBe(0)
  })

  test('submitAnswer increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)
    const word = useGameStore.getState().currentWord!

    useGameStore.getState().submitAnswer(word.text)

    expect(useGameStore.getState().questionsAnsweredInTurn).toBe(1)
  })

  test('submitAnswer with a wrong answer also increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    useGameStore.getState().submitAnswer('not-a-real-word')

    expect(useGameStore.getState().questionsAnsweredInTurn).toBe(1)
  })

  test('handleTimeout increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    useGameStore.getState().handleTimeout()

    expect(useGameStore.getState().questionsAnsweredInTurn).toBe(1)
  })

  test('pickNextWord does nothing once the turn length has been reached', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 1)
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(state.currentWord?.text).toBe(first.text)
    expect(state.status).toBe('acertou')
  })

  test('resetGame clears the turn length and answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)
    useGameStore.getState().submitAnswer('anything')

    useGameStore.getState().resetGame()

    const state = useGameStore.getState()
    expect(state.turnLength).toBeNull()
    expect(state.questionsAnsweredInTurn).toBe(0)
  })

  test('startGame in falar-soletrar mode picks a word from the chosen category with dificil difficulty', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])

    const state = useGameStore.getState()
    expect(state.category).toEqual(['colors'])
    expect(state.difficulty).toBe('dificil')
    expect(state.currentWord?.difficulty).toBe('dificil')
    expect(['black', 'blue', 'brown', 'grey', 'green', 'orange', 'pink', 'purple', 'red', 'violet', 'white', 'yellow']).toContain(
      state.currentWord?.text,
    )
  })

  test('startGame in falar-soletrar mode combines words from every chosen category', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors', 'seasons'])

    const state = useGameStore.getState()
    expect([
      'black', 'blue', 'brown', 'grey', 'green', 'orange', 'pink', 'purple',
      'red', 'violet', 'white', 'yellow', 'spring', 'summer', 'fall', 'autumn', 'winter',
    ]).toContain(state.currentWord?.text)
  })

  test('pickNextWord in falar-soletrar mode stays within the chosen categories', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['seasons'])
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(['spring', 'summer', 'fall', 'autumn', 'winter']).toContain(state.currentWord?.text)
  })

  test('awardSpellingLetters adds the points of each right letter right away', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])

    useGameStore.getState().awardSpellingLetters(1)
    expect(useGameStore.getState().score).toBe(SPEAK_AND_SPELL_POINTS_PER_LETTER)

    useGameStore.getState().awardSpellingLetters(2)
    expect(useGameStore.getState().score).toBe(3 * SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(useGameStore.getState().status).toBe('jogando')
  })

  test('awardSpellingLetters updates the high score', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])

    useGameStore.getState().awardSpellingLetters(3)

    const expectedScore = 3 * SPEAK_AND_SPELL_POINTS_PER_LETTER
    expect(useGameStore.getState().highScore).toBe(expectedScore)
    expect(localStorage.getItem('soletrando:highScore')).toBe(String(expectedScore))
  })

  test('completeSpellingWord(true) ends the word without adding points, which the letters already gave', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])
    useGameStore.getState().awardSpellingLetters(3)

    useGameStore.getState().completeSpellingWord(true)

    const state = useGameStore.getState()
    expect(state.status).toBe('acertou')
    expect(state.streak).toBe(1)
    expect(state.score).toBe(3 * SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(state.questionsAnsweredInTurn).toBe(1)
    expect(state.correctCount).toBe(1)
    expect(state.wrongCount).toBe(0)
  })

  test('completeSpellingWord(false) keeps the points of the right letters, resets the streak and increments the wrong count', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])
    useGameStore.setState({ streak: 3 })
    useGameStore.getState().awardSpellingLetters(2)

    useGameStore.getState().completeSpellingWord(false)

    const state = useGameStore.getState()
    expect(state.status).toBe('errou')
    expect(state.streak).toBe(0)
    expect(state.score).toBe(2 * SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(state.questionsAnsweredInTurn).toBe(1)
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(1)
  })

  test('completeSpellingWord does nothing once the question has already ended', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, ['colors'])
    useGameStore.getState().completeSpellingWord(true)
    const scoreAfterFirstCompletion = useGameStore.getState().score

    useGameStore.getState().completeSpellingWord(true)

    const state = useGameStore.getState()
    expect(state.score).toBe(scoreAfterFirstCompletion)
    expect(state.questionsAnsweredInTurn).toBe(1)
  })

  test('submitAnswer with a correct answer increments the correct count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    const word = useGameStore.getState().currentWord!

    useGameStore.getState().submitAnswer(word.text)

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(1)
    expect(state.wrongCount).toBe(0)
  })

  test('submitAnswer with a wrong answer increments the wrong count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    useGameStore.getState().submitAnswer('not-a-real-word')

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(1)
  })

  test('handleTimeout increments the wrong count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    useGameStore.getState().handleTimeout()

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(1)
  })

  test('startGame resets the correct and wrong counts', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')
    useGameStore.setState({ correctCount: 4, wrongCount: 2 })

    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(0)
  })
})

describe('getSpellingSeconds', () => {
  test.each([
    ['red', 30],
    ['yellow', 30],
    ['september', 45],
    ['living room', 50],
    ['electric guitar', 70],
  ])('"%s" gets %i seconds (5 per letter, at least 30)', (word, seconds) => {
    expect(getSpellingSeconds(word)).toBe(seconds)
  })
})
