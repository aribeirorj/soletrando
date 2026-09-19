// Uma Letra é um caractere-base com seus Sinais gráficos (é, ç, ã): o aluno a vê, digita e
// soletra como uma coisa só. NFC junta o acento que vier separado (e + ◌́) na letra composta.
// Regex em vez de Intl.Segmenter, que falta em navegadores antigos da escola.
export function displayUnits(text: string): string[] {
  return text.normalize('NFC').match(/\P{M}\p{M}*/gu) ?? []
}

// O que o aluno soletra: minúsculas, sem espaços. O hífen conta como Letra.
export function spelledUnits(text: string): string[] {
  return displayUnits(text.toLowerCase()).filter((unit) => unit !== ' ')
}
