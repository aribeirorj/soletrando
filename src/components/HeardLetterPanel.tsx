import type { LetterRecognitionStatus } from '../speech/letterRecognition'
import { CheckCircleIcon, MicrophoneIcon } from './icons'

const STATUS_TEXT: Record<LetterRecognitionStatus, string> = {
  idle: '',
  loading: 'Preparando reconhecimento de voz… (a primeira vez pode demorar)',
  listening: 'Ouvindo…',
  'mic-denied': 'Microfone bloqueado',
  'no-mic': 'Nenhum microfone encontrado',
  unsupported: 'Reconhecimento de voz indisponível aqui (requer https ou localhost)',
  error: 'Não foi possível ativar o reconhecimento de voz',
}

const HISTORY_LIMIT = 20

export interface HeardBalloon {
  letter: string | null
  tone: 'neutral' | 'match' | 'miss'
  message: string | null
}

const TONE_CLASSES: Record<HeardBalloon['tone'], string> = {
  neutral: 'border-border bg-card text-card-foreground',
  match: 'border-green-500 bg-green-50 text-green-700',
  miss: 'border-brand-red bg-red-50 text-brand-red',
}

interface HeardLetterPanelProps {
  status: LetterRecognitionStatus
  balloon: HeardBalloon | null
  heardHistory: string[]
}

export function HeardLetterPanel({ status, balloon, heardHistory }: HeardLetterPanelProps) {
  const isAvailable = status === 'idle' || status === 'loading' || status === 'listening'
  const history = heardHistory.slice(-HISTORY_LIMIT)

  return (
    <div className="flex flex-col items-center gap-2">
      {balloon && isAvailable && (
        <div
          role="status"
          data-testid="heard-letter"
          className={`flex min-h-24 w-48 flex-col items-center justify-center rounded-lg border-2 px-4 py-2 ${TONE_CLASSES[balloon.tone]}`}
        >
          <span className="text-xs font-medium">Você falou:</span>
          <span className="flex items-center gap-2 text-4xl font-bold">
            {balloon.letter ? balloon.letter.toUpperCase() : '—'}
            {balloon.tone === 'match' && (
              <>
                <CheckCircleIcon width={28} height={28} />
                <span className="sr-only">confere</span>
              </>
            )}
          </span>
          {balloon.message && <span className="text-center text-xs font-semibold">{balloon.message}</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-x-3 text-xs text-muted-foreground">
        {status !== 'idle' && (
          <span className="flex items-center gap-1">
            <MicrophoneIcon width={14} height={14} />
            {STATUS_TEXT[status]}
          </span>
        )}
        {history.length > 0 && <span>Ouvi: {history.map((letter) => letter.toUpperCase()).join(' · ')}</span>}
      </div>
    </div>
  )
}
