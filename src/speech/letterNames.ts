const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

// Vocabulário passado ao Vosk: só letras soltas (o modelo as pronuncia pelo nome
// em inglês), "zed" para o Z britânico e [unk] para absorver o que não for letra.
export const LETTER_GRAMMAR = JSON.stringify([...ALPHABET, 'zed', '[unk]'])

// Nomes por extenso que o reconhecedor pode devolver no lugar da letra.
export const LETTER_ALIASES: Record<string, string> = {
  bee: 'b',
  see: 'c',
  sea: 'c',
  dee: 'd',
  ef: 'f',
  gee: 'g',
  aitch: 'h',
  eye: 'i',
  jay: 'j',
  kay: 'k',
  el: 'l',
  em: 'm',
  en: 'n',
  oh: 'o',
  pee: 'p',
  cue: 'q',
  queue: 'q',
  are: 'r',
  ess: 's',
  tee: 't',
  you: 'u',
  vee: 'v',
  ex: 'x',
  why: 'y',
  zed: 'z',
  zee: 'z',
}

export function parseHeardLetters(text: string): string[] {
  const tokens = text.trim().toLowerCase().split(/\s+/)
  const letters: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === 'double' && (tokens[i + 1] === 'you' || tokens[i + 1] === 'u')) {
      letters.push('w')
      i++
    } else if (/^[a-z]$/.test(token)) {
      letters.push(token)
    } else if (Object.hasOwn(LETTER_ALIASES, token)) {
      letters.push(LETTER_ALIASES[token])
    }
  }

  return letters
}

// Sotaque brasileiro: letras que o modelo (inglês americano) ouve trocadas quando o aluno
// fala do jeito brasileiro. Chave: letra esperada; valor: o que o app ouve no lugar dela.
// Só vale num sentido: ouvir T quando se espera G continua sendo erro.
// T: "tí" vira "tchí", que o modelo entende como G ("jee").
const ACCENT_EQUIVALENTS: Record<string, string[]> = {
  t: ['g'],
}

export function matchesExpectedLetter(heard: string, expected: string): boolean {
  return heard === expected || (Object.hasOwn(ACCENT_EQUIVALENTS, expected) && ACCENT_EQUIVALENTS[expected].includes(heard))
}
