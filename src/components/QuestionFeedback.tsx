import type { ReactNode } from 'react'
import type { GameStatus } from '../types'
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

const MESSAGES: Record<Exclude<GameStatus, 'jogando'>, (word: string) => string> = {
  acertou: () => 'Acertou!',
  errou: (word) => `Errou. A palavra correta era: ${word}`,
  'tempo-esgotado': (word) => `Tempo esgotado! A palavra era: ${word}`,
}

export function QuestionFeedback({
  status,
  correctAnswer,
  onNext,
  nextLabel = 'Próxima palavra',
  message,
  children,
}: QuestionFeedbackProps) {
  if (status === 'jogando') return null

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground">
      <p className="flex items-center gap-2 font-semibold">
        {status === 'acertou' && <CheckCircleIcon />}
        {message ?? MESSAGES[status](correctAnswer)}
      </p>
      {children}
      <button
        type="button"
        onClick={onNext}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        {nextLabel}
      </button>
    </div>
  )
}
