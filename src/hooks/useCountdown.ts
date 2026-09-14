import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseCountdownOptions {
  seconds: number
  onExpire?: () => void
  autoStart?: boolean
}

export interface UseCountdownResult {
  remaining: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: (newSeconds?: number) => void
}

export function useCountdown({
  seconds,
  onExpire,
  autoStart = true,
}: UseCountdownOptions): UseCountdownResult {
  const [remaining, setRemaining] = useState(seconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setRemaining((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (isRunning && remaining === 0) {
      setIsRunning(false)
      onExpireRef.current?.()
    }
  }, [isRunning, remaining])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])

  const reset = useCallback(
    (newSeconds?: number) => {
      setRemaining(newSeconds ?? seconds)
      setIsRunning(autoStart)
    },
    [seconds, autoStart],
  )

  return { remaining, isRunning, start, pause, reset }
}
