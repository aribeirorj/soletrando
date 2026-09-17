# CONTEXT — Soletrando

Jogo web para praticar a **ortografia de palavras em inglês**, pensado para uso em sala de aula. A interface é em português; as palavras jogadas são em inglês.

Este documento define a linguagem do domínio. Use estes termos (e os identificadores de código correspondentes) ao discutir, nomear e documentar o projeto.

## Glossário

### Formas de jogar

| Termo | Código | Definição |
|---|---|---|
| **Jogo Individual** | `playMode = 'individual'` | Um único **Jogador** joga sem limite de perguntas. A pontuação alimenta o **Recorde**. |
| **Sessão (com a Turma)** | `sessionStore`, `startSession` | O professor cadastra **Alunos**, escolhe as **Opções de Jogo** e cada aluno joga seu **Turno**. Persistida em `localStorage` (`soletrando:session`). |
| **Jogador** | `playerName` | Nome de quem joga no modo individual. Persistido em `soletrando:playerName`. |
| **Aluno** | `Student` | Participante de uma Sessão. Acumula `totalScore`, `correctCount` e `wrongCount` ao longo dos turnos. |
| **Turno** | `startTurn` / `finishTurn` / `cancelTurn` | A vez de um Aluno jogar: uma sequência de `questionsPerTurn` perguntas. Ao terminar, o resultado é somado ao Aluno. Cancelar (voltar ao menu) descarta o resultado. |
| **Ranking** | `RankingScreen`, `sortByScoreDescending` | Alunos da Sessão ordenados por pontuação total. Os 3 primeiros ganham troféu. |
| **Regras** | `RulesButton` (`RulesModal.tsx`) | Ícone "?" na lista de alunos que abre um modal com as regras e a pontuação do Modo de Jogo da Sessão. Não existe no Jogo Individual. |

### Opções de Jogo

| Termo | Código | Definição |
|---|---|---|
| **Modo de Jogo** | `GameMode` | Mecânica da pergunta: `ouvir-digitar`, `letras-embaralhadas` ou `falar-soletrar`. |
| **Dificuldade** | `Difficulty` | `facil`, `medio`, `dificil`. Define o conjunto de palavras e os pontos-base. Não se aplica a Falar e Soletrar (fixado internamente em `dificil`). |
| **Categoria** | `WordCategory` | Grupo temático de palavras (Cores, Meses do Ano…), usado **apenas** em Falar e Soletrar. É possível escolher várias. |
| **Banco de Palavras** | `getWordPool` | Palavras elegíveis: por Dificuldade (`data/words.ts`) ou por Categorias (`data/speakAndSpellCategories.ts`). |

### Modos de Jogo

| Modo | Componente | Como funciona | Tempo |
|---|---|---|---|
| **Ouvir e Digitar** | `ListenAndTypeGame` | A palavra é narrada (Web Speech API, `en-US`) e o jogador digita. Fica desabilitado se o navegador não tiver narração. | 20 s |
| **Letras Embaralhadas** | `UnscrambleGame` | O jogador reordena as letras embaralhadas. A resposta é enviada automaticamente quando todas as letras são colocadas. | 25 s |
| **Falar e Soletrar** | `SpeakAndSpellGame` | O aluno soletra em voz alta e o **professor** marca cada letra como Correta ou Incorreta. Espaços não contam como letra. | 30 s |

### Pergunta e resultado

| Termo | Código | Definição |
|---|---|---|
| **Pergunta** | `currentWord` | Uma palavra a ser respondida. |
| **Status** | `GameStatus` | `jogando`, `acertou`, `errou`, `tempo-esgotado`. |
| **Resposta correta** | `isAnswerCorrect` | Comparação sem diferenciar maiúsculas/minúsculas e ignorando espaços nas pontas. Em Falar e Soletrar, a palavra só conta como acerto se **nenhuma** letra for marcada como incorreta. |
| **Tempo esgotado** | `handleTimeout` | Conta como erro e zera a Sequência. |
| **Dica** | `HintButton`, `data/wordHints.ts` | Descrição em português da palavra (nunca contém a própria palavra). Uma por pergunta; reduz os pontos pela metade. Não existe em Falar e Soletrar. |

### Pontuação

| Termo | Código | Regra |
|---|---|---|
| **Pontos** | `score` | Soma dos pontos no jogo/turno atual. |
| **Pontos por pergunta** | `computeQuestionScore` | Fácil 10 · Médio 20 · Difícil 30; metade (arredondada) se a Dica foi usada. |
| **Pontos por palavra soletrada** | `computeSpellingWordScore` | 10 pontos por letra (sem espaços), só se a palavra inteira estiver correta. |
| **Sequência** | `streak` | Acertos consecutivos; zera com erro ou tempo esgotado. Apenas informativa. |
| **Recorde** | `highScore` | Maior pontuação já alcançada neste navegador (`soletrando:highScore`). Global, não é por jogador nem por modo. |

## Ambiguidades conhecidas

- **"Rodada"** é evitado no código. Use **Pergunta** para uma palavra (`hintUsedThisQuestion`, `QUESTION_SECONDS`, `QuestionFeedback`, `computeQuestionScore`) e **Turno** para o conjunto de perguntas de um aluno (`turnLength`, `questionsAnsweredInTurn`, `questionsPerTurn`). Na interface, os textos "Perguntas por rodada" e "Ver resultado da rodada" continuam com "rodada" e se referem ao Turno.
- **"Categoria"** existe só em Falar e Soletrar; os outros modos usam Dificuldade. Não confundir com os níveis de dificuldade.

## Fluxo de telas

```
Home ──(Individual)──────────────► Jogo ──(Voltar ao menu)──► Home
  │
  └─(Turma: Iniciar Sessão)──► Lista da Sessão ──(Jogar)──► Jogo (Turno) ──(fim)──► Lista da Sessão
                                   │   ▲                                   └─(Voltar ao menu: cancela)─┘
                                   ▼   │
                                  Ranking
                     (Encerrar sessão ──► Home, apaga alunos)
```

A tela exibida vem de `gameStore.mode` (jogo ativo) e de `sessionStore.view` (`idle` | `roster` | `ranking`); veja `src/App.tsx`.

## Arquitetura resumida

- **Stack:** React 19 + Vite + TypeScript, Tailwind, Zustand, Vitest.
- **`store/gameStore.ts`:** estado e regras de uma partida (palavra atual, status, pontuação, recorde).
- **`store/sessionStore.ts`:** Sessão da Turma (alunos, turnos, ranking); comanda o `gameStore` no início e no fim de cada Turno.
- **`data/`:** bancos de palavras, categorias e dicas; tudo local, sem API externa.
- **Persistência:** apenas `localStorage`, com fallback em memória quando ele não está disponível.
