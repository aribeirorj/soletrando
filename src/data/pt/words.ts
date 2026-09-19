import type { Difficulty, Word } from '../../types'

// Soletrando (6º ao 9º ano). A Dificuldade vem da ortografia, não do tamanho da palavra.
// Sem homófonos: no Ouvir e Digitar o aluno só ouve a palavra.

// Dígrafos (ch, lh, nh, rr, qu, gu) e acentos comuns.
const FACIL: string[] = [
  'chuva', 'galinha', 'cachorro', 'telhado', 'abelha', 'ninho', 'folha', 'queijo',
  'guerra', 'carro', 'máquina', 'lâmpada', 'árvore', 'café', 'sofá', 'pão',
  'limão', 'manhã', 'irmã', 'chocolate',
]

// s, ss, ç e z; x e ch; g e j.
const MEDIO: string[] = [
  'cabeça', 'almoço', 'açúcar', 'praça', 'enxada', 'xícara', 'peixe', 'caixa',
  'abacaxi', 'lixo', 'girafa', 'gelo', 'relógio', 'laranja', 'canjica', 'jeito',
  'princesa', 'beleza', 'cozinha', 'pássaro',
]

// sc, xc, hiatos acentuados, h inicial, hífen e grafias que costumam sair erradas.
const DIFICIL: string[] = [
  'nascer', 'piscina', 'adolescente', 'consciência', 'exceção', 'excelente',
  'ascensão', 'excursão', 'obsessão', 'paralisar', 'pesquisar', 'hesitar',
  'saúde', 'faísca', 'egoísta', 'ruído', 'privilégio', 'cabeleireiro',
  'beneficente', 'arco-íris',
]

function toWords(list: string[], difficulty: Difficulty): Word[] {
  return list.map((text) => ({ text, difficulty }))
}

export const PT_WORDS: Word[] = [
  ...toWords(FACIL, 'facil'),
  ...toWords(MEDIO, 'medio'),
  ...toWords(DIFICIL, 'dificil'),
]

export function getPortugueseWordsByDifficulty(difficulty: Difficulty): Word[] {
  return PT_WORDS.filter((w) => w.difficulty === difficulty)
}
