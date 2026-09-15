import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  computeNextStreak,
  computeRoundScore,
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

describe('computeRoundScore', () => {
  test('gives full base score per difficulty without a hint', () => {
    expect(computeRoundScore('facil', false)).toBe(10)
    expect(computeRoundScore('medio', false)).toBe(20)
    expect(computeRoundScore('dificil', false)).toBe(30)
  })

  test('halves the score when a hint was used', () => {
    expect(computeRoundScore('facil', true)).toBe(5)
    expect(computeRoundScore('medio', true)).toBe(10)
    expect(computeRoundScore('dificil', true)).toBe(15)
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
      hintUsedThisRound: false,
      playerName: '',
      roundLength: null,
      questionsAnsweredInRound: 0,
      correctCount: 0,
      wrongCount: 0,
    })
  })

  test('startGame selects a word from the chosen difficulty and resets round state', () => {
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

  test('pickNextWord starts a new round with a different word', () => {
    useGameStore.getState().startGame('letras-embaralhadas', 'facil')
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(state.status).toBe('jogando')
    expect(state.hintUsedThisRound).toBe(false)
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

  test('startGame without a round length defaults to unlimited rounds', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil')

    const state = useGameStore.getState()
    expect(state.roundLength).toBeNull()
    expect(state.questionsAnsweredInRound).toBe(0)
  })

  test('startGame with a round length stores it and resets the question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    const state = useGameStore.getState()
    expect(state.roundLength).toBe(3)
    expect(state.questionsAnsweredInRound).toBe(0)
  })

  test('submitAnswer increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)
    const word = useGameStore.getState().currentWord!

    useGameStore.getState().submitAnswer(word.text)

    expect(useGameStore.getState().questionsAnsweredInRound).toBe(1)
  })

  test('submitAnswer with a wrong answer also increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    useGameStore.getState().submitAnswer('not-a-real-word')

    expect(useGameStore.getState().questionsAnsweredInRound).toBe(1)
  })

  test('handleTimeout increments the answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)

    useGameStore.getState().handleTimeout()

    expect(useGameStore.getState().questionsAnsweredInRound).toBe(1)
  })

  test('pickNextWord does nothing once the round length has been reached', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 1)
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(state.currentWord?.text).toBe(first.text)
    expect(state.status).toBe('acertou')
  })

  test('resetGame clears the round length and answered question count', () => {
    useGameStore.getState().startGame('ouvir-digitar', 'facil', 3)
    useGameStore.getState().submitAnswer('anything')

    useGameStore.getState().resetGame()

    const state = useGameStore.getState()
    expect(state.roundLength).toBeNull()
    expect(state.questionsAnsweredInRound).toBe(0)
  })

  test('startGame in falar-soletrar mode picks a word from the chosen category with dificil difficulty', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')

    const state = useGameStore.getState()
    expect(state.category).toBe('colors')
    expect(state.difficulty).toBe('dificil')
    expect(state.currentWord?.difficulty).toBe('dificil')
    expect(['black', 'blue', 'brown', 'grey', 'green', 'orange', 'pink', 'purple', 'red', 'violet', 'white', 'yellow']).toContain(
      state.currentWord?.text,
    )
  })

  test('pickNextWord in falar-soletrar mode stays within the chosen category', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'seasons')
    const first = useGameStore.getState().currentWord!
    useGameStore.getState().submitAnswer(first.text)

    useGameStore.getState().pickNextWord()

    const state = useGameStore.getState()
    expect(['spring', 'summer', 'fall', 'autumn', 'winter']).toContain(state.currentWord?.text)
  })

  test('awardPoints adds the given points to the score', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')

    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)

    expect(useGameStore.getState().score).toBe(SPEAK_AND_SPELL_POINTS_PER_LETTER * 2)
  })

  test('awardPoints updates the high score when the new score is higher', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')

    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)

    expect(useGameStore.getState().highScore).toBe(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(localStorage.getItem('soletrando:highScore')).toBe(String(SPEAK_AND_SPELL_POINTS_PER_LETTER))
  })

  test('awardPoints does nothing once the round has already ended', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')
    useGameStore.getState().completeSpellingWord(true)

    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)

    expect(useGameStore.getState().score).toBe(0)
  })

  test('completeSpellingWord(true) marks the round as correct and increments the streak without touching the score or letter counts', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')
    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    useGameStore.getState().recordLetterResult(true)

    useGameStore.getState().completeSpellingWord(true)

    const state = useGameStore.getState()
    expect(state.status).toBe('acertou')
    expect(state.streak).toBe(1)
    expect(state.score).toBe(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(state.questionsAnsweredInRound).toBe(1)
    expect(state.correctCount).toBe(1)
    expect(state.wrongCount).toBe(0)
  })

  test('completeSpellingWord(false) marks the round as wrong and resets the streak without touching the score or letter counts', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')
    useGameStore.setState({ streak: 3 })
    useGameStore.getState().awardPoints(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    useGameStore.getState().recordLetterResult(true)
    useGameStore.getState().recordLetterResult(false)

    useGameStore.getState().completeSpellingWord(false)

    const state = useGameStore.getState()
    expect(state.status).toBe('errou')
    expect(state.streak).toBe(0)
    expect(state.score).toBe(SPEAK_AND_SPELL_POINTS_PER_LETTER)
    expect(state.questionsAnsweredInRound).toBe(1)
    expect(state.correctCount).toBe(1)
    expect(state.wrongCount).toBe(1)
  })

  test('recordLetterResult(true) increments the correct count', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')

    useGameStore.getState().recordLetterResult(true)
    useGameStore.getState().recordLetterResult(true)

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(2)
    expect(state.wrongCount).toBe(0)
  })

  test('recordLetterResult(false) increments the wrong count', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')

    useGameStore.getState().recordLetterResult(false)

    const state = useGameStore.getState()
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(1)
  })

  test('recordLetterResult does nothing once the round has already ended', () => {
    useGameStore.getState().startGame('falar-soletrar', 'facil', undefined, 'colors')
    useGameStore.getState().completeSpellingWord(true)

    useGameStore.getState().recordLetterResult(true)

    expect(useGameStore.getState().correctCount).toBe(0)
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
