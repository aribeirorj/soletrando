import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import {
  QUESTION_SECONDS_BY_MODE,
  SPEAK_AND_SPELL_POINTS_PER_LETTER,
  getSpellingSeconds,
  useGameStore,
} from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import {
  INITIAL_SPELLING_PROGRESS,
  MAX_ATTEMPTS,
  spellingProgressReducer,
  type SpellingFeedback,
  type SpellingProgressState,
} from '../store/spellingProgress'
import { useCountdown } from '../hooks/useCountdown'
import { useHeardLetters } from '../hooks/useHeardLetters'
import { useSpeech } from '../hooks/useSpeech'
import { isRecognitionUnavailable } from '../speech/letterRecognition'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { QuestionFeedback } from './QuestionFeedback'
import { HeardLetterPanel, type HeardBalloon } from './HeardLetterPanel'
import { CheckCircleIcon, SpeakerIcon, XCircleIcon } from './icons'

const NEXT_WORD_DELAY_AFTER_CORRECT_MS = 2000
const NEXT_WORD_DELAY_AFTER_WRONG_MS = 5000
const SUGGEST_BUTTONS_AFTER_FAILED_LETTERS = 2

// voz: o app corrige pelo microfone; botoes: alguém marca Correto/Incorreto.
type InputMode = 'voz' | 'botoes'

function spellableIndices(letters: string[]): number[] {
  return letters.reduce<number[]>((indices, letter, index) => {
    if (letter !== ' ') indices.push(index)
    return indices
  }, [])
}

function describeBalloon(previewLetter: string | null, feedback: SpellingFeedback | null): HeardBalloon {
  if (previewLetter) return { letter: previewLetter, tone: 'neutral', message: null }
  if (feedback?.kind === 'correct') return { letter: feedback.letter, tone: 'match', message: null }
  if (feedback?.kind === 'retry') {
    return { letter: feedback.heard, tone: 'neutral', message: `Tente de novo (${feedback.attempt} de ${MAX_ATTEMPTS})` }
  }
  if (feedback?.kind === 'failed') {
    return { letter: feedback.heard, tone: 'miss', message: `A letra certa era ${feedback.expected.toUpperCase()}` }
  }
  return { letter: null, tone: 'neutral', message: null }
}

function joinLetters(letters: string[]): string {
  if (letters.length <= 1) return letters.join('')
  return `${letters.slice(0, -1).join(', ')} e ${letters.at(-1)}`
}

// Mensagem do fim da palavra: qual letra errou, a palavra certa e quantos pontos as letras
// certas renderam.
function describeWordResult(
  status: 'acertou' | 'errou' | 'tempo-esgotado',
  wordText: string,
  spellable: string[],
  progress: SpellingProgressState,
): { message: ReactNode; detail: string | null } {
  const earned = progress.correctLetters * SPEAK_AND_SPELL_POINTS_PER_LETTER
  const total = spellable.length * SPEAK_AND_SPELL_POINTS_PER_LETTER
  const word = `Palavra: ${wordText.toUpperCase()}`
  const points = earned === 0 ? 'nenhum ponto' : `+${earned} de ${total} pontos`

  if (status === 'acertou') return { message: `Acertou! +${earned} pontos`, detail: null }

  if (status === 'tempo-esgotado') {
    const stoppedAt = spellable[progress.letterIndex]
    return {
      message: stoppedAt ? `O tempo acabou na letra ${stoppedAt.toUpperCase()}.` : 'O tempo acabou.',
      detail: `${word} · ${points}`,
    }
  }

  const wrongLetters = progress.wrongIndices.map((index) => spellable[index].toUpperCase())
  const single = wrongLetters.length === 1
  const why = single ? 'a letra errada não pontua' : 'as letras erradas não pontuam'
  return {
    message: (
      <>
        <XCircleIcon className="shrink-0 text-brand-red" />
        {single ? `Você errou a letra ${wrongLetters[0]}.` : `Você errou as letras ${joinLetters(wrongLetters)}.`}
      </>
    ),
    detail: earned === 0 ? `${word} · ${points}` : `${word} · ${points} (${why})`,
  }
}

export function SpeakAndSpellGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const awardSpellingLetters = useGameStore((s) => s.awardSpellingLetters)
  const completeSpellingWord = useGameStore((s) => s.completeSpellingWord)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const turnLength = useGameStore((s) => s.turnLength)
  const questionsAnsweredInTurn = useGameStore((s) => s.questionsAnsweredInTurn)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const seconds = currentWord ? getSpellingSeconds(currentWord.text) : QUESTION_SECONDS_BY_MODE['falar-soletrar']
  const { remaining, reset } = useCountdown({ seconds, onExpire: handleTimeout })

  const spellable = useMemo(
    () => (currentWord ? currentWord.text.replace(/ /g, '').toLowerCase().split('') : []),
    [currentWord],
  )
  const [progress, dispatch] = useReducer(spellingProgressReducer, INITIAL_SPELLING_PROGRESS)
  const [inputMode, setInputMode] = useState<InputMode>('voz')

  useEffect(() => {
    dispatch({ type: 'reset' })
    if (currentWord) reset(getSpellingSeconds(currentWord.text))
  }, [currentWord, reset])

  const { isSupported: canSpeak, isSpeaking, speak } = useSpeech()
  const heard = useHeardLetters({
    question: currentWord,
    letterIndex: progress.letterIndex,
    active: status === 'jogando',
    muted: isSpeaking,
    enabled: inputMode === 'voz',
    onFinal: (letters) => dispatch({ type: 'attempt', letters, spellable }),
  })
  const micUnavailable = isRecognitionUnavailable(heard.status)
  const mode: InputMode = micUnavailable ? 'botoes' : inputMode

  // Cada letra certa pontua na hora. A referência guarda quantas letras da palavra já foram
  // creditadas; no reset da palavra o contador volta a 0 e a referência acompanha.
  const awardedLettersRef = useRef(0)
  useEffect(() => {
    const gained = progress.correctLetters - awardedLettersRef.current
    if (gained > 0) awardSpellingLetters(gained)
    awardedLettersRef.current = progress.correctLetters
  }, [progress.correctLetters, awardSpellingLetters])

  useEffect(() => {
    if (progress.finished) completeSpellingWord(!progress.hasMistake)
  }, [progress, completeSpellingWord])

  // Depois da 3ª tentativa errada, o app fala a letra certa para o aluno aprender.
  useEffect(() => {
    const feedback = progress.feedback
    if (feedback?.kind === 'failed' && feedback.heard !== null) speak(feedback.expected.toUpperCase())
  }, [progress.feedback, speak])

  const handleNext = useCallback(() => {
    const { turnLength: length, questionsAnsweredInTurn: answered } = useGameStore.getState()
    if (length !== null && answered >= length) {
      finishTurn()
      return
    }
    pickNextWord()
  }, [finishTurn, pickNextWord])

  useEffect(() => {
    if (status === 'jogando') return
    const delay = status === 'acertou' ? NEXT_WORD_DELAY_AFTER_CORRECT_MS : NEXT_WORD_DELAY_AFTER_WRONG_MS
    const timeout = setTimeout(handleNext, delay)
    return () => clearTimeout(timeout)
  }, [status, handleNext])

  if (!currentWord) return null

  const isTurnComplete = turnLength !== null && questionsAnsweredInTurn >= turnLength
  const letters = currentWord.text.split('')
  const displayIndices = spellableIndices(letters)
  const currentDisplayIndex = displayIndices[progress.letterIndex]
  const doneUntil = currentDisplayIndex ?? letters.length
  const wrongDisplayIndices = new Set(progress.wrongIndices.map((index) => displayIndices[index]))
  const expectedLetter = spellable[progress.letterIndex] ?? null
  const isPlaying = status === 'jogando'
  const showSuggestion = progress.consecutiveFailedLetters >= SUGGEST_BUTTONS_AFTER_FAILED_LETTERS
  const markedWrong = progress.feedback?.kind === 'failed' && progress.feedback.heard === null
  const wordResult = isPlaying ? null : describeWordResult(status, currentWord.text, spellable, progress)

  const mark = (correct: boolean) => dispatch({ type: 'mark', correct, spellable })

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      <p className="text-sm text-muted-foreground">
        Pergunta {turnLength !== null ? Math.min(questionsAnsweredInTurn + 1, turnLength) : questionsAnsweredInTurn + 1}
        {turnLength !== null && ` de ${turnLength}`}
      </p>
      <Timer remaining={remaining} total={seconds} />

      <div className="flex gap-2 text-3xl font-bold uppercase tracking-widest">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={
              index === currentDisplayIndex
                ? 'rounded-md bg-accent px-1 text-accent-foreground'
                : index < doneUntil
                  ? wrongDisplayIndices.has(index)
                    ? 'text-brand-red'
                    : 'text-primary'
                  : 'text-muted-foreground'
            }
          >
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Letra {Math.min(progress.letterIndex + 1, spellable.length)} de {spellable.length}
      </p>
      {canSpeak && expectedLetter && isPlaying && (
        <button
          type="button"
          onClick={() => speak(expectedLetter.toUpperCase())}
          className="flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-accent"
        >
          <SpeakerIcon /> Ouvir a pronúncia
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        {mode === 'voz'
          ? 'Fale em inglês a letra destacada.'
          : 'Peça para o aluno falar a letra em voz alta e confirme abaixo.'}
      </p>

      <HeardLetterPanel
        status={heard.status}
        balloon={mode === 'voz' && isPlaying ? describeBalloon(heard.previewLetter, progress.feedback) : null}
        heardHistory={heard.heardHistory}
      />

      {mode === 'voz' && isPlaying && (
        <p className={`text-sm ${showSuggestion ? 'font-semibold text-brand-red' : 'text-muted-foreground'}`}>
          {showSuggestion && 'O microfone não está me ajudando? '}
          <button type="button" onClick={() => setInputMode('botoes')} className="text-primary underline">
            Usar botões Certo/Errado
          </button>
        </p>
      )}

      {mode === 'botoes' && (
        <>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => mark(true)}
              disabled={!isPlaying}
              className="flex items-center gap-2 rounded-md border border-green-600 bg-green-500 px-4 py-2 text-lg font-semibold text-white disabled:opacity-50"
            >
              <CheckCircleIcon /> Correto
            </button>
            <button
              type="button"
              onClick={() => mark(false)}
              disabled={!isPlaying}
              className="flex items-center gap-2 rounded-md border border-brand-redDark bg-brand-red px-4 py-2 text-lg font-semibold text-white disabled:opacity-50"
            >
              <XCircleIcon /> Incorreto
            </button>
          </div>

          {markedWrong && isPlaying && <p className="text-sm text-brand-red">Essa letra ficou incorreta.</p>}

          {!micUnavailable && isPlaying && (
            <button type="button" onClick={() => setInputMode('voz')} className="text-sm text-primary underline">
              Voltar a falar
            </button>
          )}
        </>
      )}

      {wordResult && (
        <QuestionFeedback
          status={status}
          correctAnswer={currentWord.text}
          onNext={handleNext}
          nextLabel={isTurnComplete ? 'Ver resultado da rodada' : 'Próxima palavra'}
          message={wordResult.message}
        >
          {wordResult.detail && <p className="text-center text-sm">{wordResult.detail}</p>}
        </QuestionFeedback>
      )}
    </div>
  )
}
