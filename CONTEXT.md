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
| **Regras** | `RulesButton` (`RulesModal.tsx`) | Ícone "?" que abre um modal com as regras e a pontuação do Modo de Jogo. Na Turma, fica ao lado do título da lista de alunos; no Jogo Individual, ao lado de "Modo de jogo" na tela inicial, depois de escolher o modo (e a dificuldade, fora do Falar e Soletrar). A última regra muda conforme a forma de jogar (`playMode`): Ranking na Turma, Recorde no Individual. |
| **Novidades** | `WhatsNewNotice` | Aviso na tela inicial, ao escolher Jogar Individual ou Jogar com a Turma, explicando a correção automática, o Ouvir a pronúncia e a pontuação por letra do Falar e Soletrar. Fechar esconde até a próxima visita (não é salvo). |

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
| **Falar e Soletrar** | `SpeakAndSpellGame` | O aluno soletra em voz alta, letra por letra, com a palavra à vista. Com microfone, o app corrige cada letra (até 3 **Tentativas**) e avança sozinho; sem microfone, alguém marca **Correto/Incorreto** (ver **Modo de correção**). Espaços não contam como letra. Ao fim da palavra há **Avanço automático**. | 5 s por letra (mín. 30 s) |

### Pergunta e resultado

| Termo | Código | Definição |
|---|---|---|
| **Pergunta** | `currentWord` | Uma palavra a ser respondida. |
| **Status** | `GameStatus` | `jogando`, `acertou`, `errou`, `tempo-esgotado`. |
| **Resposta correta** | `isAnswerCorrect` | Comparação sem diferenciar maiúsculas/minúsculas e ignorando espaços nas pontas. Em Falar e Soletrar, a palavra só conta como acerto se **nenhuma** letra ficar errada (3 Tentativas erradas pela voz ou Incorreto nos botões). |
| **Tempo esgotado** | `handleTimeout` | Conta como erro e zera a Sequência. |
| **Dica** | `HintButton`, `data/wordHints.ts` | Descrição em português da palavra (nunca contém a própria palavra). Uma por pergunta; reduz os pontos pela metade. Não existe em Falar e Soletrar. |

### Pontuação

| Termo | Código | Regra |
|---|---|---|
| **Pontos** | `score` | Soma dos pontos no jogo/turno atual. |
| **Pontos por pergunta** | `computeQuestionScore` | Fácil 10 · Médio 20 · Difícil 30; metade (arredondada) se a Dica foi usada. |
| **Pontos por letra** | `awardSpellingLetters` | Falar e Soletrar: cada letra certa soma 10 pontos no placar na hora (espaços não contam), pela voz ou pelo botão Correto. Letra errada não pontua, mas as outras letras da palavra continuam valendo. Acerto/erro da palavra continua contado por palavra (`completeSpellingWord`). |
| **Sequência** | `streak` | Acertos consecutivos; zera com erro ou tempo esgotado. Apenas informativa. |
| **Recorde** | `highScore` | Maior pontuação já alcançada neste navegador (`soletrando:highScore`). Global, não é por jogador nem por modo. |

### Reconhecimento de voz

| Termo | Código | Definição |
|---|---|---|
| **Letra ouvida** | `previewLetter` / `SpellingFeedback` (`useHeardLetters`, `HeardLetterPanel`) | O que o microfone reconheceu, mostrado no balão "Você falou": prévia enquanto o aluno fala e, depois, o resultado da Tentativa (verde ✔, "Tente de novo (2 de 3)" ou "A letra certa era I"). |
| **Tentativa** | `MAX_ATTEMPTS`, `spellingProgressReducer` (`attempt`) | Cada letra ouvida pela voz é uma Tentativa. Acertou dentro de 3: a letra conta como certa. Errou 3: a letra fica vermelha, o app fala a letra certa e avança. Várias letras numa fala são corrigidas em sequência. |
| **Modo de correção** | `InputMode` (`voz` \| `botoes`) | `voz`: o app corrige e os botões não aparecem. `botoes`: Correto/Incorreto (`mark`), uma decisão por letra. Vira `botoes` sozinho quando o reconhecimento está indisponível (`isRecognitionUnavailable`). Depois de 2 letras seguidas falhadas pela voz, o app sugere os botões; "Usar botões Certo/Errado" e "Voltar a falar" trocam à mão. |
| **Tolerância ao sotaque** | `matchesExpectedLetter` (`ACCENT_EQUIVALENTS`, `letterNames.ts`) | Trocas que o modelo americano faz com a pronúncia brasileira e que contam como acerto. Hoje: T esperado e G ouvido ("tí" vira "tchí", entendido como "jee"). Só vale num sentido: G esperado e T ouvido continua errado. Novas letras entram na tabela depois de confirmadas com alunos. |
| **Progresso da soletração** | `spellingProgress.ts` | Reducer puro com letra atual, Tentativas, letras erradas e se a palavra terminou (`finished`). Serve aos dois Modos de correção. |
| **Avanço automático** | `SpeakAndSpellGame` | Ao terminar a palavra, mostra o resultado em duas linhas (letras erradas; a palavra e os pontos ganhos de pontos possíveis) e passa sozinho para a próxima: 2 s depois de acertar, 5 s depois de errar ou de o tempo acabar. Na última palavra do Turno, vai para o resultado. "Próxima palavra" pula a espera. |
| **Letras ouvidas** | `heardHistory` | Tudo o que foi reconhecido na Pergunta atual ("Ouvi: C · A"). Zera a cada Pergunta. |
| **Ouvir a pronúncia** | `SpeakAndSpellGame` (`useSpeech`) | Botão 🔊 separado, abaixo de "Letra X de Y", que fala em inglês a letra destacada (a correta). Serve de modelo de pronúncia para o aluno e não altera a pontuação. Enquanto o app fala, e por 400 ms depois, o reconhecimento recebe silêncio (`isMuted`) para não "ouvir" o próprio app. Só aparece durante a Pergunta e se o navegador tiver síntese de voz. |
| **Reconhecimento de letras** | `speech/letterRecognition.ts` | Vosk rodando no navegador, offline, com o vocabulário restrito aos nomes das letras em inglês. Se não houver suporte, permissão do microfone ou modelo, só mostra um aviso e o jogo segue igual. |

## Ambiguidades conhecidas

- **"Rodada"** é evitado no código. Use **Pergunta** para uma palavra (`hintUsedThisQuestion`, `QUESTION_SECONDS`, `QuestionFeedback`, `computeQuestionScore`) e **Turno** para o conjunto de perguntas de um aluno (`turnLength`, `questionsAnsweredInTurn`, `questionsPerTurn`). Na interface, os textos "Perguntas por rodada" e "Ver resultado da rodada" continuam com "rodada" e se referem ao Turno.
- **"Categoria"** existe só em Falar e Soletrar; os outros modos usam Dificuldade. Não confundir com os níveis de dificuldade.
- **"Narração"** (síntese de voz, `useSpeech`: a palavra em Ouvir e Digitar e o botão Ouvir a pronúncia em Falar e Soletrar) é diferente de **"Reconhecimento"** (microfone, `speech/`, em Falar e Soletrar).
- A **Letra ouvida** não é uma **Resposta**: quem pontua é o **Progresso da soletração** (via `completeSpellingWord`), a partir das Tentativas ou dos botões.

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
- **`speech/`:** reconhecimento das letras faladas (Vosk via `vosk-browser`). O modelo fica em `public/models` (~41 MB, gerado por `scripts/prepare-vosk-model.sh`) e, depois do primeiro download, é guardado pelo navegador no IndexedDB. Nenhum serviço externo.
- **Persistência:** apenas `localStorage`, com fallback em memória quando ele não está disponível.
