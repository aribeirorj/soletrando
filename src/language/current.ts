import { english } from './english'
import { portuguese } from './portuguese'
import type { LanguagePack } from './types'

// A página de cada Versão declara o Idioma no <html>: `pt/index.html` tem data-idioma="pt".
// Sem a marca (a página `/` e os testes), é o Spelling Bee.
export function languageFromDocument(doc: Document | undefined): LanguagePack {
  return doc?.documentElement.dataset.idioma === 'pt' ? portuguese : english
}

// O Idioma da página. As stores o leem quando carregam (Recorde, Sessão), por isso ele é um
// valor de módulo e não um estado React. Scripts module rodam depois do HTML, com o atributo lá.
let current: LanguagePack = languageFromDocument(typeof document === 'undefined' ? undefined : document)

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
