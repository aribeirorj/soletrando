import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseDictionaryHintResult {
  definition: string | null
  isLoading: boolean
  error: string | null
  fetchHint: (word: string) => Promise<void>
  reset: () => void
}

const UNAVAILABLE_MESSAGE = 'dica não disponível para esta palavra'

export function useDictionaryHint(): UseDictionaryHintResult {
  const [definition, setDefinition] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchHint = useCallback(async (word: string) => {
    setIsLoading(true)
    setError(null)
    setDefinition(null)

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      )

      if (!response.ok) {
        if (isMountedRef.current) {
          setError(UNAVAILABLE_MESSAGE)
          setIsLoading(false)
        }
        return
      }

      const data = await response.json()
      const text: unknown = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition

      if (!isMountedRef.current) return

      if (typeof text === 'string' && text.length > 0) {
        setDefinition(text)
      } else {
        setError(UNAVAILABLE_MESSAGE)
      }
      setIsLoading(false)
    } catch {
      if (isMountedRef.current) {
        setError(UNAVAILABLE_MESSAGE)
        setIsLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    setDefinition(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { definition, isLoading, error, fetchHint, reset }
}
