# Correção automática no Falar e Soletrar — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Com microfone funcionando, o app corrige cada letra falada (até 3 tentativas), avança sozinho e passa para a próxima palavra. Sem microfone, aparecem os botões Correto/Incorreto.

**Architecture:** Um reducer puro (`spellingProgress`) passa a controlar o progresso da palavra nos dois jeitos de corrigir: `attempt` para a voz e `mark` para os botões. O `useHeardLetters` ganha `enabled` e `onFinal`, que ligam os resultados finais do Vosk ao reducer. O `SpeakAndSpellGame` escolhe o modo (`voz` ou `botoes`), avança sozinho no fim da palavra e usa um tempo proporcional ao tamanho da palavra.

**Tech Stack:** React 19, TypeScript 6, Zustand 5, Vitest 5 + Testing Library (jsdom), Vosk (`vosk-browser`).

**Spec:** `docs/superpowers/specs/2026-09-18-correcao-automatica-design.md`

## Global Constraints

- Até **3 tentativas** por letra (`MAX_ATTEMPTS = 3`).
- Tempo: **5 s por letra, mínimo de 30 s** (`getSpellingSeconds`).
- Avanço automático: **2 s** depois de acertar a palavra, **3 s** depois de errar ou de o tempo acabar.
- Sugerir os botões depois de **2 letras seguidas** falhadas por voz.
- Pontuação, `gameStore.completeSpellingWord`, `sessionStore` e tela inicial não mudam.
- Textos da interface em português; nomes de teste em inglês (padrão do repositório).
- Commits só com autorização do usuário: os passos de commit ficam no final.

---

### Task 1: Reducer `spellingProgress`

**Files:**
- Create: `src/store/spellingProgress.ts`
- Test: `src/store/spellingProgress.test.ts`

**Interfaces:**
- Produces: `MAX_ATTEMPTS`, `SpellingFeedback`, `SpellingProgressState`, `SpellingProgressAction`, `INITIAL_SPELLING_PROGRESS`, `spellingProgressReducer(state, action)`, `isSpellingFinished(state, spellable)`. `spellable` é o array de letras minúsculas sem espaços (`'living room'` → `['l','i','v','i','n','g','r','o','o','m']`).

- [ ] **Step 1: Escrever os testes**

```ts
import { describe, expect, test } from 'vitest'
import {
  INITIAL_SPELLING_PROGRESS,
  isSpellingFinished,
  spellingProgressReducer,
  type SpellingProgressAction,
  type SpellingProgressState,
} from './spellingProgress'

const CAT = ['c', 'a', 't']
const run = (actions: SpellingProgressAction[]): SpellingProgressState =>
  actions.reduce(spellingProgressReducer, INITIAL_SPELLING_PROGRESS)
const say = (...letters: string[]): SpellingProgressAction => ({ type: 'attempt', letters, spellable: CAT })
const mark = (correct: boolean): SpellingProgressAction => ({ type: 'mark', correct, spellable: CAT })

describe('spellingProgressReducer — voice attempts', () => {
  test('a right letter advances to the next one', () => { … letterIndex 1, feedback correct 'c' })
  test('a wrong letter asks to try again without advancing', () => { … letterIndex 0, feedback retry heard 'k' attempt 2 })
  test('getting it right on the third try counts as right', () => { … say k, say k, say c → letterIndex 1, hasMistake false, wrongIndices [] })
  test('three wrong tries mark the letter wrong and advance', () => { … failed heard 'k' expected 'c', wrongIndices [0], hasMistake true })
  test('several letters in one utterance are corrected in sequence', () => { … say c a t → finished, no mistake })
  test('counts letters that failed in a row and resets on a right letter', () => { … 2 after two failures, 0 after a right one })
  test('ignores letters after the word is finished', () => { … })
})
describe('spellingProgressReducer — Correto/Incorreto buttons', () => {
  test('Correto advances without a mistake', …)
  test('Incorreto marks the letter wrong and advances', …)
  test('reset starts the word over', …)
})
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/store/spellingProgress.test.ts` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar**

```ts
export const MAX_ATTEMPTS = 3

export type SpellingFeedback =
  | { kind: 'correct'; letter: string }
  | { kind: 'retry'; heard: string; attempt: number }
  | { kind: 'failed'; heard: string | null; expected: string }

export interface SpellingProgressState {
  letterIndex: number
  attempts: number
  wrongIndices: number[]
  hasMistake: boolean
  consecutiveFailedLetters: number
  feedback: SpellingFeedback | null
}

export type SpellingProgressAction =
  | { type: 'attempt'; letters: string[]; spellable: string[] }
  | { type: 'mark'; correct: boolean; spellable: string[] }
  | { type: 'reset' }

export const INITIAL_SPELLING_PROGRESS: SpellingProgressState = {
  letterIndex: 0, attempts: 0, wrongIndices: [], hasMistake: false, consecutiveFailedLetters: 0, feedback: null,
}

export function isSpellingFinished(state: SpellingProgressState, spellable: string[]): boolean {
  return state.letterIndex >= spellable.length
}

function failLetter(state: SpellingProgressState, heard: string | null, expected: string): SpellingProgressState {
  return {
    ...state,
    letterIndex: state.letterIndex + 1,
    attempts: 0,
    wrongIndices: [...state.wrongIndices, state.letterIndex],
    hasMistake: true,
    feedback: { kind: 'failed', heard, expected },
  }
}

function attemptLetter(state: SpellingProgressState, heard: string, spellable: string[]): SpellingProgressState {
  if (isSpellingFinished(state, spellable)) return state
  const expected = spellable[state.letterIndex]
  if (heard === expected) {
    return { ...state, letterIndex: state.letterIndex + 1, attempts: 0, consecutiveFailedLetters: 0, feedback: { kind: 'correct', letter: heard } }
  }
  const attempts = state.attempts + 1
  if (attempts < MAX_ATTEMPTS) return { ...state, attempts, feedback: { kind: 'retry', heard, attempt: attempts + 1 } }
  return { ...failLetter(state, heard, expected), consecutiveFailedLetters: state.consecutiveFailedLetters + 1 }
}

export function spellingProgressReducer(state: SpellingProgressState, action: SpellingProgressAction): SpellingProgressState {
  switch (action.type) {
    case 'attempt':
      return action.letters.reduce((current, letter) => attemptLetter(current, letter, action.spellable), state)
    case 'mark': {
      if (isSpellingFinished(state, action.spellable)) return state
      const expected = action.spellable[state.letterIndex]
      if (!action.correct) return failLetter(state, null, expected)
      return { ...state, letterIndex: state.letterIndex + 1, attempts: 0, feedback: { kind: 'correct', letter: expected } }
    }
    case 'reset':
      return INITIAL_SPELLING_PROGRESS
  }
}
```

- [ ] **Step 4: Rodar e ver passar.**

### Task 2: Tempo por letra e texto das Regras

**Files:**
- Modify: `src/store/gameStore.ts` (após `computeSpellingWordScore`)
- Modify: `src/components/RulesModal.tsx:16-33`
- Test: `src/store/gameStore.test.ts`, `src/components/RulesModal.test.tsx`

**Interfaces:**
- Consumes: `MAX_ATTEMPTS` (Task 1).
- Produces: `SPEAK_AND_SPELL_SECONDS_PER_LETTER = 5`, `getSpellingSeconds(wordText: string): number`.

- [ ] **Step 1: Testes**

```ts
describe('getSpellingSeconds', () => {
  test.each([
    ['red', 30],
    ['yellow', 30],
    ['september', 45],
    ['living room', 50],
    ['electric guitar', 70],
  ])('"%s" → %i s', (word, seconds) => expect(getSpellingSeconds(word)).toBe(seconds))
})
```

No `RulesModal.test.tsx`, o caso de Falar e Soletrar passa a esperar `'5 segundos por letra'`, `'mínimo de 30 segundos'`, `'3 tentativas'`, `'Correto ou Incorreto'` e `'passa sozinho para a próxima'`.

- [ ] **Step 2: Ver falhar.**
- [ ] **Step 3: Implementar**

```ts
export const SPEAK_AND_SPELL_SECONDS_PER_LETTER = 5

export function getSpellingSeconds(wordText: string): number {
  const letterCount = wordText.replace(/ /g, '').length
  return Math.max(QUESTION_SECONDS_BY_MODE['falar-soletrar'], letterCount * SPEAK_AND_SPELL_SECONDS_PER_LETTER)
}
```

`RulesModal`:
- `HOW_TO_PLAY['falar-soletrar'] = 'Fale em inglês cada letra da palavra. Pelo microfone, o app confere cada letra e avança sozinho.'`
- Regras de Falar e Soletrar:

```ts
[
  HOW_TO_PLAY[mode],
  `Você tem ${SPEAK_AND_SPELL_SECONDS_PER_LETTER} segundos por letra (mínimo de ${QUESTION_SECONDS_BY_MODE[mode]} segundos por palavra).`,
  `Cada letra tem até ${MAX_ATTEMPTS} tentativas. Sem microfone, alguém marca Correto ou Incorreto.`,
  `Cada palavra vale ${SPEAK_AND_SPELL_POINTS_PER_LETTER} pontos por letra (espaços não contam).`,
  'Só ganha os pontos se acertar todas as letras. Uma letra errada e a palavra vale 0.',
  'Se o tempo acabar, conta como erro.',
  'Ao terminar a palavra, o jogo passa sozinho para a próxima.',
]
```

- [ ] **Step 4: Ver passar.**

### Task 3: `useHeardLetters` com `enabled` e `onFinal`

**Files:**
- Modify: `src/speech/letterRecognition.ts` (nova função `isRecognitionUnavailable`)
- Modify: `src/hooks/useHeardLetters.ts`
- Test: `src/speech/letterRecognition.test.ts` (unitário); o hook é coberto pelos testes de componente da Task 4.

**Interfaces:**
- Produces:
  - `isRecognitionUnavailable(status: LetterRecognitionStatus): boolean`: `true` para `unsupported`, `mic-denied`, `no-mic`, `error`.
  - `useHeardLetters({ question, letterIndex, active, muted, enabled, onFinal? })` → `{ status, previewLetter, heardHistory }`.
  - `status` volta como `'idle'` quando `enabled=false`, **exceto** se for um status de indisponibilidade, que é mantido.
  - `onFinal(letters)` é chamado a cada resultado final não vazio enquanto `active`.

- [ ] **Step 1: Teste** `test.each` de `isRecognitionUnavailable` (4 × true; `idle`, `loading`, `listening` × false). Ver falhar.
- [ ] **Step 2: Implementar**

```ts
const UNAVAILABLE_STATUSES: LetterRecognitionStatus[] = ['unsupported', 'mic-denied', 'no-mic', 'error']
export function isRecognitionUnavailable(status: LetterRecognitionStatus): boolean {
  return UNAVAILABLE_STATUSES.includes(status)
}
```

Hook:

```ts
const onFinalRef = useRef(onFinal)
useEffect(() => { onFinalRef.current = onFinal })

useEffect(() => {
  if (!enabled) return
  try {
    return startLetterRecognition({
      onStatusChange: setStatus,
      onLettersHeard: (letters, isFinal) => {
        const isActive = activeRef.current
        dispatch({ type: isFinal ? 'final' : 'partial', letters, active: isActive })
        if (isFinal && isActive && letters.length > 0) onFinalRef.current?.(letters)
      },
      isMuted: () => mutedRef.current,
    })
  } catch {
    setStatus('error')
  }
}, [enabled])

return {
  status: enabled || isRecognitionUnavailable(status) ? status : 'idle',
  previewLetter: state.previewLetter,
  heardHistory: state.history,
}
```

- [ ] **Step 3: Ver passar** (`npx tsc -b` acusa os usos antigos de `heardLetter`, que a Task 4 remove).

### Task 4: Painel e `SpeakAndSpellGame` com voz, botões e avanço automático

**Files:**
- Modify: `src/components/HeardLetterPanel.tsx`
- Modify: `src/components/SpeakAndSpellGame.tsx`
- Test: `src/components/SpeakAndSpellGame.test.tsx`

**Interfaces:**
- Consumes: tudo das Tasks 1 a 3.
- Produces:
  - `HeardBalloon = { letter: string | null; tone: 'neutral' | 'match' | 'miss'; message: string | null }`;
  - `HeardLetterPanel({ status, balloon: HeardBalloon | null, heardHistory })`.

- [ ] **Step 1: Reescrever os testes do componente**, com o reconhecimento simulado via `vi.mock('../speech/letterRecognition', …)`. É preciso manter o `isRecognitionUnavailable` real com `importActual`.
  - **Voz:**
    - sem Correto/Incorreto com o microfone ativo;
    - letra certa avança ("Letra 2 de 3", "confere");
    - letra errada: "Tente de novo (2 de 3)" e continua na letra;
    - acerto na 3ª tentativa conta como certo (c a t depois leva a `acertou`, 30 pontos);
    - 3 erros: "A letra certa era C" e letra vermelha, e a palavra termina `errou` com 0 pontos;
    - "c a t" numa fala leva a `acertou`;
    - prévia do parcial no balão;
    - histórico "Ouvi: C · A";
    - nova palavra zera tudo;
    - sugestão depois de 2 letras falhadas;
    - "Usar botões Certo/Errado" chama `stop` e mostra os botões, e "Voltar a falar" religa.
  - **Sem microfone:**
    - `mic-denied` mostra "Microfone bloqueado" e os botões, e 3 × Correto leva a `acertou` (30);
    - erro ao iniciar cai nos botões;
    - não aparece "Voltar a falar";
    - Incorreto mostra "Essa letra ficou incorreta.".
  - **Avanço automático (fake timers):**
    - 2 s depois de acertar vem uma nova palavra, com `questionsAnsweredInTurn` 1;
    - 3 s depois de errar;
    - última palavra do Turno chama `finishTurn`;
    - o botão "Próxima palavra" continua funcionando.
  - **Pronúncia (síntese simulada):**
    - fala a letra destacada;
    - depois de 3 erros fala a letra certa;
    - `isMuted` enquanto fala e por 400 ms depois;
    - some no fim da palavra;
    - não aparece sem síntese.
  - **Desmontar** chama `stop`.
- [ ] **Step 2: Ver falhar.**
- [ ] **Step 3: Implementar**
  - **`HeardLetterPanel`:** recebe `balloon` pronto. As classes de cada tom:
    - `match`: `border-green-500 bg-green-50 text-green-700` + ✔ + texto sr-only "confere";
    - `neutral`: `border-border bg-card text-card-foreground`;
    - `miss`: `border-brand-red bg-red-50 text-brand-red`.
    - A `message` fica abaixo da letra.
  - **`SpeakAndSpellGame`:**
    - `useReducer(spellingProgressReducer)` no lugar dos quatro `useState`;
    - `spellable` via `useMemo`;
    - `inputMode` (`'voz' | 'botoes'`), com `mode = isRecognitionUnavailable(heard.status) ? 'botoes' : inputMode`;
    - efeito em `[currentWord]`: `dispatch({ type: 'reset' })` + `reset(getSpellingSeconds(...))`;
    - efeito em `[progress]`: se `isSpellingFinished`, `completeSpellingWord(!progress.hasMistake)`;
    - efeito em `[progress.feedback]`: `failed` com `heard !== null` chama `speak(expected.toUpperCase())`;
    - efeito em `[status]`: se `status !== 'jogando'`, `setTimeout(handleNext, status === 'acertou' ? 2000 : 3000)`, com `clearTimeout` no cleanup. `handleNext` lê `turnLength` e `questionsAnsweredInTurn` via `useGameStore.getState()` e chama `finishTurn()` ou `pickNextWord()`;
    - `describeBalloon(previewLetter, feedback)` (função do módulo, não exportada);
    - cor das letras: `index < (currentDisplayIndex ?? letters.length)`, corrigindo o cinza no fim da palavra.
- [ ] **Step 4: Ver passar**, depois rodar a suíte inteira, `npm run lint` e `npm run build`.

### Task 5: Documentação e verificação no navegador

**Files:**
- Modify: `CONTEXT.md` (linha do modo, seção Reconhecimento de voz, Ambiguidades)
- Scratch: script Playwright no scratchpad (não versionado)

- [ ] **Step 1: `CONTEXT.md`**
  - Falar e Soletrar: com microfone, o app corrige (Tentativas) e avança; sem microfone, Correto/Incorreto; tempo de 5 s/letra (mín. 30 s); avanço automático.
  - Termos novos: **Tentativa** (`MAX_ATTEMPTS`), **Modo de correção** (`voz` | `botoes`), **Avanço automático**, **Progresso da soletração** (`spellingProgress`).
  - Remover "o professor marca" como única forma.
- [ ] **Step 2: Navegador**
  - **Áudio de teste:** WAV com 4 s de silêncio, "B", "E" e "D" (voz lessac), e depois 25 s de silêncio.
  - **Preparação:** Chromium com microfone simulado; iniciar o jogo; injetar `currentWord = 'bed'` via `import('/src/store/gameStore.ts')`.
  - **Esperado:**
    - três letras verdes;
    - `acertou`, placar 30;
    - nova palavra em cerca de 2 s;
    - sem erros no console.
- [ ] **Step 3: Commit** (só com autorização do usuário).
