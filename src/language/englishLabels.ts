import type { LanguageLabels } from './types'

function ordinal(position: number): string {
  const lastTwo = position % 100
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[position % 10] ?? 'th')
  return `${position}${suffix}`
}

const points = (count: number) => `${count} ${count === 1 ? 'point' : 'points'}`

// Spelling Bee: rótulos em inglês (as informações importantes continuam em português).
export const ENGLISH_LABELS: LanguageLabels = {
  howToPlayQuestion: 'How do you want to play?',
  playSolo: 'Play Solo',
  playWithClass: 'Play with the Class',
  playerName: 'Player name',
  playerNamePlaceholder: 'Type your name',
  students: 'Students',
  studentNamePlaceholder: 'Student name',
  add: 'Add',
  removeStudent: (name) => `Remove ${name}`,
  questionsPerTurn: 'Questions per turn',
  startGame: 'Start Game',
  startSession: 'Start Session',
  gameMode: 'Game mode',
  modes: {
    'ouvir-digitar': 'Listen and Type',
    'letras-embaralhadas': 'Unscramble',
    'falar-soletrar': 'Speak and Spell',
  },
  difficulty: 'Difficulty',
  difficulties: { facil: 'Easy', medio: 'Medium', dificil: 'Hard' },
  categories: 'Categories',
  selectCategories: 'Select one or more categories.',
  seeRules: 'See rules',
  highScoreBadge: (value, playerName) => (playerName?.trim() ? `${playerName}'s high score: ${value}` : `High score: ${value}`),
  player: 'Player',
  points: 'Points',
  streak: 'Streak',
  highScore: 'High score',
  question: (current, total) => (total === null ? `Question ${current}` : `Question ${current} of ${total}`),
  backToMenu: 'Back to menu',
  nextWord: 'Next word',
  seeTurnResult: 'See turn results',
  correctAnswer: 'Correct!',
  wrongAnswer: (word) => `Wrong. The correct word was: ${word}`,
  timeUp: (word) => `Time's up! The word was: ${word}`,
  hint: 'Hint',
  hintPrefix: 'Hint:',
  repeat: 'Repeat',
  check: 'Check',
  clear: 'Clear',
  letterCounter: (current, total) => `Letter ${current} of ${total}`,
  hearPronunciation: 'Hear the pronunciation',
  markCorrect: 'Correct',
  markIncorrect: 'Incorrect',
  useButtons: 'Use Right/Wrong buttons',
  backToSpeaking: 'Back to speaking',
  wordCorrect: (earned) => `Correct! +${points(earned)}`,
  youSaid: 'You said:',
  listening: 'Listening…',
  heard: (letters) => `Heard: ${letters}`,
  matches: 'matches',
  classSession: 'Class session',
  correctCount: (count) => `${count} correct`,
  wrongCount: (count) => `${count} wrong`,
  play: 'Play',
  seeRanking: 'See ranking',
  endSession: 'End session',
  classRanking: 'Class ranking',
  pointsCount: points,
  rankPosition: ordinal,
  back: 'Back',
}
