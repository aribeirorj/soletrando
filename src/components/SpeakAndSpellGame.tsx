import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useCountdown } from '../hooks/useCountdown'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { QuestionFeedback } from './QuestionFeedback'
import { CheckCircleIcon, XCircleIcon } from './icons'

const QUESTION_SECONDS = 30

function spellableIndices(letters: string[]): number[] {
  return letters.reduce<number[]>((indices, letter, index) => {
    if (letter !== ' ') indices.push(index)
    return indices
  }, [])
}

export function SpeakAndSpellGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const completeSpellingWord = useGameStore((s) => s.completeSpellingWord)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const turnLength = useGameStore((s) => s.turnLength)
  const questionsAnsweredInTurn = useGameStore((s) => s.questionsAnsweredInTurn)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const { remaining, reset } = useCountdown({ seconds: QUESTION_SECONDS, onExpire: handleTimeout })

  const [letterIndex, setLetterIndex] = useState(0)
  const [lastAttemptWasWrong, setLastAttemptWasWrong] = useState(false)
  const [hasMistake, setHasMistake] = useState(false)
  const [wrongDisplayIndices, setWrongDisplayIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    setLetterIndex(0)
    setLastAttemptWasWrong(false)
    setHasMistake(false)
    setWrongDisplayIndices(new Set())
  }, [currentWord])

  if (!currentWord) return null

  const isTurnComplete = turnLength !== null && questionsAnsweredInTurn >= turnLength
  const letters = currentWord.text.split('')
  const spellable = spellableIndices(letters)
  const currentDisplayIndex = spellable[letterIndex]

  const handleCorrect = () => {
    setLastAttemptWasWrong(false)
    const nextIndex = letterIndex + 1
    setLetterIndex(nextIndex)
    if (nextIndex === spellable.length) {
      completeSpellingWord(!hasMistake)
    }
  }

  const handleIncorrect = () => {
    setLastAttemptWasWrong(true)
    setHasMistake(true)
    setWrongDisplayIndices((prev) => new Set(prev).add(currentDisplayIndex))
    const nextIndex = letterIndex + 1
    setLetterIndex(nextIndex)
    if (nextIndex === spellable.length) {
      completeSpellingWord(false)
    }
  }

  const handleNext = () => {
    if (isTurnComplete) {
      finishTurn()
      return
    }
    reset(QUESTION_SECONDS)
    pickNextWord()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      <p className="text-sm text-muted-foreground">
        Pergunta {turnLength !== null ? Math.min(questionsAnsweredInTurn + 1, turnLength) : questionsAnsweredInTurn + 1}
        {turnLength !== null && ` de ${turnLength}`}
      </p>
      <Timer remaining={remaining} total={QUESTION_SECONDS} />

      <div className="flex gap-2 text-3xl font-bold uppercase tracking-widest">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={
              index === currentDisplayIndex
                ? 'rounded-md bg-accent px-1 text-accent-foreground'
                : index < currentDisplayIndex
                  ? wrongDisplayIndices.has(index)
                    ? 'text-brand-red'
                    : 'text-primary'
                  : 'text-muted-foreground'
            }
          >
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Letra {Math.min(letterIndex + 1, spellable.length)} de {spellable.length}
      </p>
      <p className="text-xs text-muted-foreground">
        Peça para o aluno falar a letra em voz alta e confirme abaixo.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCorrect}
          disabled={status !== 'jogando'}
          className="flex items-center gap-2 rounded-md border border-green-600 bg-green-500 px-4 py-2 text-lg font-semibold text-white disabled:opacity-50"
        >
          <CheckCircleIcon /> Correto
        </button>
        <button
          type="button"
          onClick={handleIncorrect}
          disabled={status !== 'jogando'}
          className="flex items-center gap-2 rounded-md border border-brand-redDark bg-brand-red px-4 py-2 text-lg font-semibold text-white disabled:opacity-50"
        >
          <XCircleIcon /> Incorreto
        </button>
      </div>

      {lastAttemptWasWrong && status === 'jogando' && (
        <p className="text-sm text-brand-red">Essa letra ficou incorreta.</p>
      )}

      {status !== 'jogando' && (
        <QuestionFeedback
          status={status}
          correctAnswer={currentWord.text}
          onNext={handleNext}
          nextLabel={isTurnComplete ? 'Ver resultado da rodada' : 'Próxima palavra'}
        />
      )}
    </div>
  )
}
