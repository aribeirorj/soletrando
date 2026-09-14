import { useCallback, useState } from 'react'

interface SpeechRecognitionResultLike {
  transcript: string
}

interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } }
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

const LISTEN_TIMEOUT_MS = 8000

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean
  isListening: boolean
  error: string | null
  listenOnce: () => Promise<string>
}

const UNRECOGNIZED_MESSAGE = 'Não entendi, tente novamente.'

export function useSpeechRecognition(lang = 'en-US'): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSupported = typeof window !== 'undefined' && getSpeechRecognitionConstructor() !== undefined

  const listenOnce = useCallback((): Promise<string> => {
    const RecognitionCtor = getSpeechRecognitionConstructor()
    if (!RecognitionCtor) {
      setError(UNRECOGNIZED_MESSAGE)
      return Promise.resolve('')
    }

    setError(null)
    setIsListening(true)

    return new Promise((resolve) => {
      const recognition = new RecognitionCtor()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      let transcript = ''
      let settled = false

      const finish = () => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        setIsListening(false)
        setError(transcript ? null : UNRECOGNIZED_MESSAGE)
        resolve(transcript)
      }

      const timeoutId = setTimeout(() => {
        try {
          recognition.stop()
        } catch {
          // ignora: já pode ter parado sozinho
        }
        finish()
      }, LISTEN_TIMEOUT_MS)

      recognition.onresult = (event) => {
        transcript = event.results[0]?.[0]?.transcript ?? ''
      }
      recognition.onerror = finish
      recognition.onend = finish

      recognition.start()
    })
  }, [lang])

  return { isSupported, isListening, error, listenOnce }
}
