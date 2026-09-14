import type { GameStatus } from '../types'
import { CheckCircleIcon } from './icons'

interface RoundFeedbackProps {
  status: GameStatus
  correctAnswer: string
  onNext: () => void
  nextLabel?: string
}

const MESSAGES: Record<Exclude<GameStatus, 'jogando'>, (word: string) => string> = {
  acertou: () => 'Acertou!',
  errou: (word) => `Errou. A palavra correta era: ${word}`,
  'tempo-esgotado': (word) => `Tempo esgotado! A palavra era: ${word}`,
}

export function RoundFeedback({
  status,
  correctAnswer,
  onNext,
  nextLabel = 'Próxima palavra',
}: RoundFeedbackProps) {
  if (status === 'jogando') return null

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground">
      <p className="flex items-center gap-2 font-semibold">
        {status === 'acertou' && <CheckCircleIcon />}
        {MESSAGES[status](correctAnswer)}
      </p>
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
