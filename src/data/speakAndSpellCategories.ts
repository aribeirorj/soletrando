import type { Word } from '../types'

export interface WordCategory {
  id: string
  label: string
  words: string[]
}

export const SPEAK_AND_SPELL_CATEGORIES: WordCategory[] = [
  {
    id: 'colors',
    label: 'Cores',
    words: [
      'black', 'blue', 'brown', 'grey', 'green', 'orange', 'pink', 'purple',
      'red', 'violet', 'white', 'yellow',
    ],
  },
  {
    id: 'seasons',
    label: 'Estações do Ano',
    words: ['spring', 'summer', 'fall', 'autumn', 'winter'],
  },
  {
    id: 'days-of-week',
    label: 'Dias da Semana',
    words: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  },
  {
    id: 'months',
    label: 'Meses do Ano',
    words: [
      'january', 'february', 'march', 'april', 'may', 'june', 'july',
      'august', 'september', 'october', 'november', 'december',
    ],
  },
  {
    id: 'school-supplies',
    label: 'Material Escolar',
    words: [
      'notebook', 'backpack', 'ruler', 'eraser', 'folder', 'book', 'pencil',
      'pen', 'glue', 'scissors',
    ],
  },
  {
    id: 'house-parts',
    label: 'Cômodos da Casa',
    words: [
      'bathroom', 'bedroom', 'dining room', 'garage', 'garden', 'kitchen',
      'laundry', 'living room', 'pool', 'room', 'yard',
    ],
  },
  {
    id: 'occupations',
    label: 'Profissões',
    words: [
      'actor', 'architect', 'astronaut', 'baker', 'banker', 'chef', 'coach',
      'cook', 'dancer', 'dentist', 'doctor', 'driver', 'economist',
      'engineer', 'farmer', 'fireman', 'journalist', 'mechanic', 'musician',
      'nurse', 'painter', 'pilot', 'policeman', 'receptionist', 'scientist',
      'secretary', 'singer', 'soldier', 'student', 'teacher', 'veterinarian',
    ],
  },
  {
    id: 'animals',
    label: 'Animais',
    words: [
      'cat', 'dog', 'lion', 'tiger', 'bird', 'bear', 'giraffe', 'kangaroo',
      'elephant', 'monkey', 'snake', 'shark', 'wolf', 'rabbit', 'horse',
    ],
  },
  {
    id: 'nationalities',
    label: 'Nacionalidades',
    words: [
      'american', 'argentinian', 'australian', 'brazilian', 'british',
      'canadian', 'chinese', 'colombian', 'english', 'french', 'german',
      'indian', 'korean', 'mexican', 'portuguese', 'russian', 'spanish',
    ],
  },
  {
    id: 'countries',
    label: 'Países',
    words: [
      'argentina', 'australia', 'brazil', 'canada', 'chile', 'china',
      'colombia', 'england', 'france', 'germany', 'greece', 'iran',
      'ireland', 'italy', 'jamaica', 'japan', 'korea', 'mexico', 'morocco',
      'paraguay', 'portugal', 'russia', 'scotland', 'spain', 'united states',
      'uruguay',
    ],
  },
]

const SPEAK_AND_SPELL_DIFFICULTY = 'dificil' as const

export function getSpeakAndSpellWords(categoryId: string | null): Word[] {
  const category = SPEAK_AND_SPELL_CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return []
  return category.words.map((text) => ({ text, difficulty: SPEAK_AND_SPELL_DIFFICULTY }))
}
