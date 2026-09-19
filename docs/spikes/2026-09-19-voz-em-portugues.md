# Correção por voz no Soletrando: o Vosk pequeno em português não serve

**Data:** 2026-09-19 · **Resultado:** não passou. O Soletrando fica com Correto/Incorreto (`recognizer: null` em `src/language/portuguese.ts`).

## Pergunta

O modelo `vosk-model-small-pt-0.3` (~31 MB, Apache-2.0), que roda offline no navegador como o do Spelling Bee, reconhece as **Letras** faladas em português, inclusive com Sinal gráfico ("é com acento agudo", "cê cedilha") e o hífen?

Critério combinado antes do teste:
- acertar pelo menos o mesmo que o Spelling Bee com voz sintética (79% no spec da correção automática);
- não confundir de forma sistemática as letras terminadas em "ê" (B, C, D, G, P, T, V, Z);
- reconhecer o Sinal gráfico dito na mesma fala da letra.

## Método

- Vozes sintéticas pt-BR do Piper (faber, cadu, jeff, edresson), cada Letra dita como um aluno diria, em 16 kHz com 0,6 s de silêncio nas pontas: 37 Letras × 4 vozes = 148 tentativas.
- O mesmo reconhecedor do jogo (Kaldi/Vosk, pela biblioteca Python), com gramática restrita às palavras do vocabulário do modelo, e o mesmo tipo de leitura do texto que o `parseHeardLetters` faz no inglês.
- **Controle:** o mesmo método com o modelo e a gramática do Spelling Bee e 4 vozes en-US deu **83%** (86/104), perto dos 79% do spec. O método reproduz a referência.

## Resultado

| | Spelling Bee (controle) | Soletrando |
|---|---|---|
| Letras simples | 83% | 17% (27% sem `[unk]` na gramática) |
| Com Sinal gráfico ou hífen | — | 42% |
| Total | 83% | 25% (32% sem `[unk]`) |

- **Vocabulário:** o modelo não conhece "efe", "gê"/"jê", "ene", "dáblio", "cedilha", "circunflexo" nem "crase". Foi preciso aproximar: G por "jé", F por "é fé", N por "eni", cedilha por "se di ilha", circunflexo por "circum flexo". Um modelo pequeno não aceita palavras novas sem reconstruir o grafo com as ferramentas do Kaldi.
- **Letras curtas:** "a", "é", "i", "ó", "u" e a maioria das letras em "ê" voltam vazias. G, E, U, R, Ç, Ê, Ô e Õ tiveram 0%.
- **Confusões:** T com D e Q; Z com T, V e G; D com B e T.
- **Frases longas funcionam:** "a com acento agudo" e "i com acento agudo" acertaram 3 ou 4 de 4. O problema está na letra, não no sinal.

## Caminhos para depois

- Um modelo Vosk grande em português tem mais de 1 GB, inviável no navegador.
- Adaptar o vocabulário exige o modelo completo e compilar o grafo com o Kaldi.
- A Web Speech API manda o áudio para um serviço externo, o que o projeto evita.
- Um Whisper pequeno no navegador reconhece português, mas precisaria de uma medição como esta, com nomes de letras.

Qualquer tentativa deve repetir este método (com o controle em inglês) antes de entrar no jogo.
