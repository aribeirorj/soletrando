import type { Word } from '../types'

export interface WordCategory {
  id: string
  label: string
  words: string[]
}

export const SPEAK_AND_SPELL_CATEGORIES: WordCategory[] = [
  {
    id: 'colors',
    label: 'Colors',
    words: [
      'black', 'blue', 'brown', 'grey', 'green', 'orange', 'pink', 'purple',
      'red', 'violet', 'white', 'yellow',
    ],
  },
  {
    id: 'seasons',
    label: 'Seasons of the Year',
    words: ['spring', 'summer', 'fall', 'autumn', 'winter'],
  },
  {
    id: 'days-of-week',
    label: 'Days of the Week',
    words: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  },
  {
    id: 'months',
    label: 'Months of the Year',
    words: [
      'january', 'february', 'march', 'april', 'may', 'june', 'july',
      'august', 'september', 'october', 'november', 'december',
    ],
  },
  {
    id: 'school-supplies',
    label: 'School Supplies',
    words: [
      'notebook', 'backpack', 'ruler', 'eraser', 'folder', 'book', 'pencil',
      'pen', 'glue', 'scissors',
    ],
  },
  {
    id: 'house-parts',
    label: 'Parts of the House',
    words: [
      'attic', 'balcony', 'basement', 'bathroom', 'bedroom', 'ceiling', 'deck',
      'dining room', 'door', 'doorbell', 'floor', 'garage', 'garden', 'hallway',
      'kitchen', 'laundry', 'living room', 'pool', 'roof', 'room', 'staircase',
      'wall', 'window', 'yard',
    ],
  },
  {
    id: 'body-parts',
    label: 'Parts of the Body',
    words: [
      'hair', 'eyes', 'mouth', 'head', 'chest', 'hand', 'belly', 'leg', 'foot',
      'feet',
    ],
  },
  {
    id: 'animals',
    label: 'Animals',
    words: [
      'alligator', 'cat', 'dog', 'lion', 'tiger', 'bird', 'bear', 'giraffe',
      'kangaroo', 'elephant', 'monkey', 'snake', 'shark', 'whale', 'wolf',
      'rabbit', 'horse', 'turtle',
    ],
  },
  {
    id: 'nationalities',
    label: 'Nationalities',
    words: [
      'afghan', 'american', 'argentinian', 'australian', 'brazilian', 'british',
      'canadian', 'chinese', 'colombian', 'egyptian', 'english', 'french',
      'german', 'hawaiian', 'indian', 'irish', 'korean', 'mexican',
      'portuguese', 'russian', 'spanish',
    ],
  },
  {
    id: 'transportation',
    label: 'Transportation',
    words: [
      'airplane', 'bicycle', 'boat', 'bus', 'sailboat', 'scooter', 'ship',
      'skateboard', 'subway', 'taxi', 'train', 'truck', 'van',
    ],
  },
  {
    id: 'food',
    label: 'Food',
    words: [
      'hamburger', 'fries', 'potato', 'tomato', 'lettuce', 'rice', 'beans',
      'spaghetti', 'butter', 'bread', 'chocolate', 'sugar', 'egg', 'steak',
      'meat', 'cheese', 'sandwich', 'chicken', 'bacon', 'sausage', 'onion',
      'fish',
    ],
  },
  {
    id: 'drinks',
    label: 'Drinks',
    words: [
      'juice', 'beer', 'coke', 'coffee', 'lemonade', 'soda', 'milk',
      'milkshake', 'wine', 'water', 'whisky',
    ],
  },
  {
    id: 'fruit',
    label: 'Fruit',
    words: [
      'apple', 'avocado', 'banana', 'blackberry', 'cherry', 'coconut',
      'grapefruit', 'grape', 'hazelnuts', 'lemon', 'lime', 'mango', 'melon',
      'orange', 'peach', 'pear', 'pineapple', 'plum', 'pomegranate',
      'raspberry', 'strawberry', 'tangerine', 'watermelon',
    ],
  },
  {
    id: 'music-instruments',
    label: 'Musical Instruments',
    words: [
      'guitar', 'electric guitar', 'trumpet', 'saxophone', 'violin', 'piano',
      'flute', 'drums',
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    words: [
      'aerobics', 'archery', 'athletics', 'badminton', 'baseball', 'basketball',
      'bowling', 'boxing', 'cycling', 'diving', 'fishing', 'football', 'golf',
      'gymnastics', 'hockey', 'jogging', 'karate', 'sailing', 'skating',
      'skiing', 'skydiving', 'soccer', 'surfing', 'swimming', 'tennis',
      'volleyball', 'windsurfing', 'wrestling',
    ],
  },
  {
    id: 'clothes',
    label: 'Clothes',
    words: [
      'blouse', 'shirt', 'pants', 'shoes', 'coat', 'sunglasses', 'watch',
      'ring', 'earrings', 'skirt', 'gloves', 'dress', 'sweater', 'suit',
      'shorts', 'swimsuit',
    ],
  },
  {
    id: 'family-members',
    label: 'Family Members',
    words: [
      'aunt', 'brother', 'children', 'cousin', 'daughter', 'father',
      'goddaughter', 'godfather', 'godmother', 'godson', 'grandchildren',
      'granddaughter', 'grandfather', 'grandmother', 'grandparents', 'grandson',
      'husband', 'mother', 'nephew', 'niece', 'parents', 'sister', 'son',
      'stepdaughter', 'stepfather', 'stepmother', 'stepson', 'uncle', 'wife',
    ],
  },
  {
    id: 'occupations',
    label: 'Occupations',
    words: [
      'accountant', 'actor', 'actress', 'archaeologist', 'architect', 'artist',
      'astronaut', 'athlete', 'attorney', 'author', 'baker', 'banker',
      'beautician', 'biologist', 'bricklayer', 'broker', 'businessman',
      'butcher', 'carpenter', 'cartoonist', 'cashier', 'chef', 'coach',
      'composer', 'cook', 'craftsman', 'cyclist', 'dancer', 'decorator',
      'dentist', 'designer', 'detective', 'doctor', 'dressmaker', 'driver',
      'economist', 'electrician', 'engineer', 'farmer', 'fireman', 'fisherman',
      'florist', 'gardener', 'hairdresser', 'housekeeper', 'housewife',
      'journalist', 'judge', 'lawyer', 'lifeguard', 'magician', 'maid',
      'mailman', 'manager', 'mechanic', 'model', 'musician', 'nurse', 'painter',
      'pharmacist', 'philosopher', 'photographer', 'pianist', 'pilot',
      'plumber', 'poet', 'policeman', 'politician', 'postman', 'programmer',
      'psychologist', 'receptionist', 'reporter', 'researcher', 'sailor',
      'salesman', 'saleswoman', 'scientist', 'secretary', 'singer', 'soldier',
      'student', 'teacher', 'technician', 'veterinarian', 'waiter', 'waitress',
      'writer',
    ],
  },
  {
    id: 'adjectives',
    label: 'Adjectives',
    words: [
      'adventurous', 'aggressive', 'ambitious', 'amusing', 'beautiful',
      'careful', 'charming', 'cheerful', 'confident', 'creative', 'curious',
      'disrespectful', 'disappointed', 'gentle', 'handsome', 'happy', 'honest',
      'intelligent', 'jealous', 'nervous', 'organized', 'outgoing', 'patient',
      'polite', 'responsible', 'sensible', 'sensitive', 'talkative', 'worried',
    ],
  },
  {
    id: 'countries',
    label: 'Countries',
    words: [
      'afghanistan', 'argentina', 'australia', 'belgium', 'brazil', 'canada',
      'chile', 'china', 'colombia', 'denmark', 'egypt', 'england', 'finland',
      'france', 'germany', 'greece', 'hawaii', 'iceland', 'iran', 'ireland',
      'italy', 'jamaica', 'japan', 'korea', 'mexico', 'morocco', 'netherlands',
      'paraguay', 'portugal', 'russia', 'scotland', 'singapore', 'spain',
      'sweden', 'switzerland', 'turkey', 'united kingdom', 'united states',
      'uruguay',
    ],
  },
]

const SPEAK_AND_SPELL_DIFFICULTY = 'dificil' as const

export function getSpeakAndSpellWords(categoryIds: string[] | null): Word[] {
  if (!categoryIds) return []
  const categories = SPEAK_AND_SPELL_CATEGORIES.filter((c) => categoryIds.includes(c.id))
  return categories.flatMap((category) =>
    category.words.map((text) => ({ text, difficulty: SPEAK_AND_SPELL_DIFFICULTY })),
  )
}
