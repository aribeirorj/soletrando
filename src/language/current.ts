import { english } from './english'
import type { LanguagePack } from './types'

// O Idioma da página. As stores o leem quando carregam (Recorde, Sessão), por isso ele é um
// valor de módulo e não um estado React.
let current: LanguagePack = english

export function getLanguage(): LanguagePack {
  return current
}

// Só para testes: troca o Idioma sem recarregar a página.
export function setLanguage(pack: LanguagePack): void {
  current = pack
}

// Chave do localStorage da Versão atual (ex.: `soletrando:highScore`).
export function storageKey(name: string): string {
  return `${current.storagePrefix}:${name}`
}
