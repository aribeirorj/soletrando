export type Difficulty = 'facil' | 'medio' | 'dificil'
export type GameMode = 'ouvir-digitar' | 'letras-embaralhadas' | 'falar-soletrar'
export type GameStatus = 'jogando' | 'acertou' | 'errou' | 'tempo-esgotado'

export interface Word {
  text: string
  difficulty: Difficulty
}
