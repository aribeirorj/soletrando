import type { ReactNode } from 'react'
import type { GameStatus } from '../types'
import { getLanguage } from '../language/current'
import type { LanguageLabels } from '../language/types'
import { CheckCircleIcon } from './icons'

interface QuestionFeedbackProps {
  status: GameStatus
  correctAnswer: string
  onNext: () => void
  nextLabel?: string
  // Substitui a frase padrão (ex.: Falar e Soletrar explica letras erradas e pontos).
  message?: ReactNode
  children?: ReactNode
}

function defaultMessage(status: Exclude<GameStatus, 'jogando'>, word: string, labels: LanguageLabels): string {
  if (status === 'acertou') return labels.correctAnswer
  return status === 'errou' ? labels.wrongAnswer(word) : labels.timeUp(word)
}

export function QuestionFeedback({
  status,
  correctAnswer,
  onNext,
  nextLabel,
  message,
  children,
}: QuestionFeedbackProps) {
  if (status === 'jogando') return null
  const labels = getLanguage().labels

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground">
      <p className="flex items-center gap-2 font-semibold">
        {status === 'acertou' && <CheckCircleIcon />}
        {message ?? defaultMessage(status, correctAnswer, labels)}
      </p>
      {children}
      <button
        type="button"
        onClick={onNext}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        {nextLabel ?? labels.nextWord}
      </button>
    </div>
  )
}
