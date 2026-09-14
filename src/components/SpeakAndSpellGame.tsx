import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useCountdown } from '../hooks/useCountdown'
import { isLetterPronunciationCorrect } from '../store/letterMatch'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { RoundFeedback } from './RoundFeedback'
import { MicrophoneIcon } from './icons'

const ROUND_SECONDS = 30

export function SpeakAndSpellGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const roundLength = useGameStore((s) => s.roundLength)
  const questionsAnsweredInRound = useGameStore((s) => s.questionsAnsweredInRound)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const { isSupported, isListening, error, listenOnce } = useSpeechRecognition()
  const { remaining, reset } = useCountdown({ seconds: ROUND_SECONDS, onExpire: handleTimeout })

  const [letterIndex, setLetterIndex] = useState(0)
  const [lastAttempt, setLastAttempt] = useState<{ transcript: string; correct: boolean } | null>(
    null,
  )

  useEffect(() => {
    setLetterIndex(0)
    setLastAttempt(null)
  }, [currentWord])

  if (!currentWord) return null

  const isRoundComplete = roundLength !== null && questionsAnsweredInRound >= roundLength
  const letters = currentWord.text.split('')

  const handleListen = async () => {
    const transcript = await listenOnce()
    if (!transcript) {
      setLastAttempt(null)
      return
    }

    const correct = isLetterPronunciationCorrect(letters[letterIndex], transcript)
    setLastAttempt({ transcript, correct })

    if (!correct) return

    const nextIndex = letterIndex + 1
    setLetterIndex(nextIndex)
    if (nextIndex === letters.length) {
      submitAnswer(currentWord.text)
    }
  }

  const handleNext = () => {
    if (isRoundComplete) {
      finishTurn()
      return
    }
    reset(ROUND_SECONDS)
    pickNextWord()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      {roundLength !== null && (
        <p className="text-sm text-muted-foreground">
          Pergunta {Math.min(questionsAnsweredInRound + 1, roundLength)} de {roundLength}
        </p>
      )}
      <Timer remaining={remaining} total={ROUND_SECONDS} />

      {isSupported ? (
        <>
          <div className="flex gap-2 text-3xl font-bold uppercase tracking-widest">
            {letters.map((letter, index) => (
              <span
                key={index}
                className={
                  index < letterIndex
                    ? 'text-primary'
                    : index === letterIndex
                      ? 'rounded-md bg-accent px-1 text-accent-foreground'
                      : 'text-muted-foreground'
                }
              >
                {letter}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Letra {letterIndex + 1} de {letters.length}
          </p>

          <button
            type="button"
            onClick={handleListen}
            disabled={status !== 'jogando' || isListening}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-lg disabled:opacity-50"
          >
            <MicrophoneIcon /> {isListening ? 'Ouvindo...' : 'Falar letra'}
          </button>

          {lastAttempt && !lastAttempt.correct && (
            <p className="text-sm text-muted-foreground">
              Ouvi "{lastAttempt.transcript}", tente de novo.
            </p>
          )}
          {error && <p className="text-sm text-muted-foreground">{error}</p>}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Reconhecimento de voz não disponível neste navegador.
        </p>
      )}

      {status !== 'jogando' && (
        <RoundFeedback
          status={status}
          correctAnswer={currentWord.text}
          onNext={handleNext}
          nextLabel={isRoundComplete ? 'Ver resultado da rodada' : 'Próxima palavra'}
        />
      )}
    </div>
  )
}
