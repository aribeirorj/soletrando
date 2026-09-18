import { useEffect, useReducer, useRef, useState } from 'react'
import { INITIAL_HEARD_LETTERS, heardLettersReducer } from '../speech/heardLetters'
import {
  isRecognitionUnavailable,
  startLetterRecognition,
  type LetterRecognitionStatus,
} from '../speech/letterRecognition'

// Depois que o app termina de falar, o som ainda chega ao microfone por um instante.
const MUTE_TAIL_MS = 400

export interface UseHeardLettersOptions {
  question: unknown
  letterIndex: number
  active: boolean
  muted: boolean
  // false desliga o microfone (ex.: jogando pelos botões Correto/Incorreto).
  enabled: boolean
  // Cada resultado final com letras, enquanto `active`.
  onFinal?: (letters: string[]) => void
}

export interface UseHeardLettersResult {
  status: LetterRecognitionStatus
  previewLetter: string | null
  heardHistory: string[]
}

export function useHeardLetters({
  question,
  letterIndex,
  active,
  muted,
  enabled,
  onFinal,
}: UseHeardLettersOptions): UseHeardLettersResult {
  const [status, setStatus] = useState<LetterRecognitionStatus>('idle')
  const [state, dispatch] = useReducer(heardLettersReducer, INITIAL_HEARD_LETTERS)
  const activeRef = useRef(active)
  const mutedRef = useRef(muted)
  const onFinalRef = useRef(onFinal)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    onFinalRef.current = onFinal
  })

  useEffect(() => {
    if (muted) {
      mutedRef.current = true
      return
    }
    const timeout = setTimeout(() => {
      mutedRef.current = false
    }, MUTE_TAIL_MS)
    return () => clearTimeout(timeout)
  }, [muted])

  useEffect(() => {
    if (!enabled) return
    try {
      return startLetterRecognition({
        onStatusChange: setStatus,
        onLettersHeard: (letters, isFinal) => {
          const isActive = activeRef.current
          dispatch({ type: isFinal ? 'final' : 'partial', letters, active: isActive })
          if (isFinal && isActive && letters.length > 0) onFinalRef.current?.(letters)
        },
        isMuted: () => mutedRef.current,
      })
    } catch {
      setStatus('error')
    }
  }, [enabled])

  useEffect(() => {
    dispatch({ type: 'question-changed' })
  }, [question])

  useEffect(() => {
    dispatch({ type: 'letter-changed' })
  }, [letterIndex])

  return {
    // Desligado, o microfone fica "idle"; uma falha continua visível para o jogo usar os botões.
    status: enabled || isRecognitionUnavailable(status) ? status : 'idle',
    previewLetter: state.previewLetter,
    heardHistory: state.history,
  }
}
