# Correção automática no Falar e Soletrar

**Data:** 2026-09-18 · **Branch:** `feat/letra-ouvida` · **Status:** design revisado e aprovado em conversa, aguardando revisão deste documento

## Contexto

Hoje, no Falar e Soletrar, o aluno soletra em voz alta e o **professor** clica em Correto/Incorreto para cada letra. A branch já mostra a **Letra ouvida** (Vosk offline, balão "Você falou") e tem o botão **🔊 Ouvir a pronúncia**, mas o reconhecimento não interfere no jogo.

O objetivo agora é permitir que o **aluno jogue sozinho**: conforme ele fala, o app corrige, avança e soma os pontos no placar. Os botões Correto/Incorreto só servem quando não há microfone utilizável.

**Premissas**
- Os alunos têm dificuldade, então **a palavra continua à vista** (a tela é a mesma de hoje).
- A correção automática **já existiu e foi removida** porque errava muito.
- Na medição com voz sintética, o reconhecedor acertou **79%** das letras (41/52).
- Por isso o desenho precisa tolerar erros do reconhecedor e ter uma alternativa sem microfone.

## Decisões

| Tema | Decisão |
|---|---|
| Quem corrige | **Microfone funcionando:** o app corrige sozinho e os botões Correto/Incorreto **não aparecem**. **Sem microfone / bloqueado / erro:** aparecem os botões Correto/Incorreto, como hoje. Não existe opção na tela inicial. |
| Letra diferente da esperada | **Até 3 tentativas.** Acertou dentro das 3: a letra conta como certa. Errou 3 vezes: a letra fica vermelha, o app mostra e fala a letra certa, e avança. |
| Microfone ruim | Detectado **durante o jogo**: se o aluno esgotar as 3 tentativas em **2 letras seguidas**, o app **sugere** usar os botões. Não troca sozinho. |
| Troca manual | O link "Usar botões Certo/Errado" fica sempre disponível com o microfone ativo, e "Voltar a falar" permite voltar ao microfone. |
| Fim da palavra | **Avança sozinho, sempre.** Acertou: mostra "Acertou!" por ~2 s. Errou ou o tempo acabou: mostra a palavra certa por ~5 s (era 3 s; aumentado para dar tempo de ler a explicação dos pontos). Vale para voz e para botões. O botão "Próxima palavra" continua na tela para quem quiser pular a espera. |
| Fim do Turno | Depois da pausa da última palavra, vai direto para o resultado do Turno (`finishTurn`). |
| Pontuação | Igual à de hoje: 10 pontos por letra, e a palavra só pontua se nenhuma letra ficar vermelha. Os pontos entram no placar quando a palavra termina (`completeSpellingWord`, sem mudança). |
| Tempo | **5 s por letra, com mínimo de 30 s**, em todo o Falar e Soletrar. |
| Ouvir a pronúncia | Continua disponível como apoio. |
| Teclado | **Fora do desenho.** Sem microfone, a alternativa são os botões. |

## Experiência

**Com microfone**

```
        V  I  O  L  E  T
          Letra 2 de 6
     [ 🔊 Ouvir a pronúncia ]
      ┌ Você falou: E ┐
      Tente de novo (2 de 3)
   🎤 Ouvindo…     Usar botões Certo/Errado
```

1. **Acertou a letra:** o balão fica verde ("✔ V"), a letra fica verde na palavra e o índice avança **na hora**. O verde continua visível até a próxima tentativa.
2. **Letra diferente:** aparece "Ouvi E, tente de novo (2 de 3)".
3. **3ª tentativa errada:** a letra fica vermelha, aparece "A letra certa era I", o app fala "I" e avança.
4. **Várias letras numa fala só** ("V I O"): cada letra é corrigida em sequência.
5. **Sugestão:** depois de 2 letras seguidas falhadas, aparece "O microfone não está me ajudando? [Usar botões Certo/Errado]".

**Sem microfone (ou depois de trocar para os botões)**

A tela é a de hoje: palavra, "Letra X de Y", 🔊 Ouvir a pronúncia e os botões Correto/Incorreto. O aviso do microfone ("Microfone bloqueado"…) fica no lugar do balão. Com o microfone disponível, aparece o link "Voltar a falar".

**Fim da palavra (nos dois casos):** mostra o `QuestionFeedback` de hoje e avança sozinho depois de ~2 s (acertou) ou ~3 s (errou ou tempo esgotado). Na última palavra do Turno, vai para o resultado do Turno.

## Arquitetura

### `src/store/spellingProgress.ts` (novo, puro)

Reducer com o progresso da palavra, compartilhado pelos dois jeitos de corrigir.

```ts
type SpellingFeedback =
  | { kind: 'correct'; letter: string }
  | { kind: 'retry'; heard: string; attempt: number }   // attempt: próxima tentativa (2 ou 3)
  | { kind: 'failed'; heard: string; expected: string }

interface SpellingProgressState {
  letterIndex: number              // índice em `spellable` (letras sem espaços)
  attempts: number                 // tentativas erradas na letra atual
  wrongIndices: number[]           // índices em `spellable` que ficaram vermelhos
  hasMistake: boolean
  consecutiveFailedLetters: number
  feedback: SpellingFeedback | null
  finished: boolean                // calculado na própria ação, com as letras da palavra daquele momento
}

type SpellingProgressAction =
  | { type: 'mark'; correct: boolean }        // botões Correto/Incorreto (comportamento atual)
  | { type: 'attempt'; letter: string }       // voz, regra das 3 tentativas
  | { type: 'reset' }                         // nova palavra

const MAX_ATTEMPTS = 3
function spellingProgressReducer(state, action): SpellingProgressState   // `attempt` e `mark` levam `spellable`
```

- `mark` substitui o `useState` atual do `SpeakAndSpellGame` (`letterIndex`, `hasMistake`, `wrongDisplayIndices`, `lastAttemptWasWrong`) sem mudar o comportamento.
- Quando `finished` fica `true`, o componente chama `completeSpellingWord(!hasMistake)`. Guardar `finished` no estado evita que uma palavra nova seja dada como terminada com o progresso da anterior. `gameStore` e pontuação ficam iguais.

### Voz → correção

- `useHeardLetters` ganha:
  - `enabled`: liga e desliga o reconhecimento. É o efeito que chama `startLetterRecognition` / `stop`.
  - `onFinal(letters)`: chamado a cada resultado final enquanto o jogo está ativo.
- Cada letra do `onFinal` vira um `attempt`, em sequência. O parcial continua só como prévia no balão.
- A correção usa só o resultado **final** (mais confiável que o parcial).
- A fala "A letra certa era I" usa `useSpeech`; o `isMuted` já existente evita que o app se ouça.

### Modo de correção (estado local do `SpeakAndSpellGame`)

- `'voz' | 'botoes'`:
  - começa em `voz`;
  - vira `botoes` sozinho quando o status do reconhecimento é `unsupported`, `mic-denied`, `no-mic` ou `error`;
  - o aluno ou o professor troca pelos links "Usar botões Certo/Errado" e "Voltar a falar".
- Em `botoes`, `enabled=false` desliga o microfone.
- Em `botoes`, o componente mostra os botões Correto/Incorreto (`mark`). Em `voz`, os botões não aparecem.

### Avanço automático

- Quando `status !== 'jogando'`, um efeito agenda `handleNext` (o de hoje) depois de 2 s (`acertou`) ou 3 s (`errou` / `tempo-esgotado`).
- O cleanup cancela o timer se o status voltar a `jogando` (clique em "Próxima palavra") ou se o componente desmontar.
- `handleNext` já chama `finishTurn()` na última palavra do Turno.

### Tempo

- `getSpellingSeconds(word)` no `gameStore`: `max(30, 5 × letras sem espaços)`.
- O `SpeakAndSpellGame` usa essa função no `useCountdown` (início e `reset` a cada palavra) e no `Timer`.
- `RulesModal` passa a dizer "5 segundos por letra (mínimo de 30)".

### O que não muda

- Reconhecimento (Vosk, grammar, modelo).
- Pontuação e os outros modos.
- `gameStore` (exceto `getSpellingSeconds`), `sessionStore` e tela inicial.
- `QuestionFeedback`.

## Documentação

- **`RulesModal`:** texto do Falar e Soletrar:
  - com microfone, o app corrige com até 3 tentativas;
  - sem microfone, alguém marca Correto/Incorreto;
  - tempo por letra;
  - avanço automático.
- **`CONTEXT.md`:**
  - linha do Falar e Soletrar;
  - termos novos: **Tentativa**, **Modo de correção** (voz / botões), **Avanço automático**;
  - o professor deixa de ser o único a decidir.

## Testes

- **`spellingProgress.test.ts`:**
  - acerta e avança;
  - 2 erros e acerto na 3ª: a letra conta como certa;
  - 3 erros: vermelha, avança, `hasMistake`;
  - última letra fecha a palavra;
  - várias letras numa fala;
  - `consecutiveFailedLetters` sobe e zera;
  - `mark` igual ao comportamento atual.
- **`SpeakAndSpellGame.test.tsx` (reconhecimento simulado):**
  - com microfone, os botões Correto/Incorreto não aparecem;
  - "c" avança;
  - 3 erros mostram "A letra certa era C";
  - "c a t" leva a `acertou` com 30 pontos;
  - `mic-denied` mostra os botões, e os testes atuais de Correto/Incorreto passam nesse cenário;
  - sugestão depois de 2 letras falhadas;
  - "Usar botões Certo/Errado" chama `stop`;
  - avanço automático (fake timers): 2 s depois de acertar, `pickNextWord`; 3 s depois de errar; na última palavra do Turno, `finishTurn`.
- **Tempo e regras:** `getSpellingSeconds` e texto do `RulesModal`.
- **Navegador (Chromium com microfone simulado falando A, B, C…):** com a palavra "abc" injetada na store, conferir as letras verdes, `acertou`, a pontuação no placar e o avanço sozinho para a próxima palavra.

## Riscos

- **Precisão.** ~21% de erro por tentativa na voz sintética. As 3 tentativas reduzem o dano, mas letras que o app confunde sempre para uma voz vão falhar sempre. Para isso servem a sugestão e os botões. A validação real depende do teste com alunos.
- **Fala emendada.** O final só chega depois de ~0,5 s de silêncio. Letras sem pausa são corrigidas em bloco, o que a regra de "várias letras numa fala" cobre.
- **Refatorar o modo com botões.** Os testes atuais de Correto/Incorreto seguram o comportamento; eles passam a rodar no cenário sem microfone.
- **Avanço automático com o professor presente.** Sem microfone, a palavra também avança sozinha depois de ~3 s. O botão "Próxima palavra" continua para pular a espera, mas não há como segurar a tela.

## Fora do escopo

- Esconder a palavra ou falar a palavra para o aluno.
- Teste de microfone antes do jogo.
- Digitar as letras.
- Letras que voltam para cinza no fim da palavra (bug antigo, PR separado).
