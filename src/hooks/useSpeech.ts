import { useCallback, useState } from 'react'

export interface UseSpeechResult {
  isSupported: boolean
  isSpeaking: boolean
  speak: (text: string) => void
  cancel: () => void
}

export function useSpeech(lang = 'en-US'): UseSpeechResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, lang],
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { isSupported, isSpeaking, speak, cancel }
}
