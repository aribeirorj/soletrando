import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useSpeech } from '../hooks/useSpeech'
import { useCountdown } from '../hooks/useCountdown'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { HintButton } from './HintButton'
import { RoundFeedback } from './RoundFeedback'
import { SpeakerIcon } from './icons'

const ROUND_SECONDS = 20

export function ListenAndTypeGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const roundLength = useGameStore((s) => s.roundLength)
  const questionsAnsweredInRound = useGameStore((s) => s.questionsAnsweredInRound)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const { isSupported, speak } = useSpeech()
  const [inputValue, setInputValue] = useState('')
  const { remaining, reset } = useCountdown({ seconds: ROUND_SECONDS, onExpire: handleTimeout })

  useEffect(() => {
    if (currentWord && isSupported) {
      speak(currentWord.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord])

  if (!currentWord) return null

  const isRoundComplete = roundLength !== null && questionsAnsweredInRound >= roundLength

  const handleNext = () => {
    if (isRoundComplete) {
      finishTurn()
      return
    }
    setInputValue('')
    reset(ROUND_SECONDS)
    pickNextWord()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      <p className="text-sm text-muted-foreground">
        Pergunta {roundLength !== null ? Math.min(questionsAnsweredInRound + 1, roundLength) : questionsAnsweredInRound + 1}
        {roundLength !== null && ` de ${roundLength}`}
      </p>
      <Timer remaining={remaining} total={ROUND_SECONDS} />

      {isSupported ? (
        <button
          type="button"
          onClick={() => speak(currentWord.text)}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-lg"
        >
          <SpeakerIcon /> Repetir
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">Narração não disponível neste navegador.</p>
      )}

      <form
        className="flex w-full gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submitAnswer(inputValue)
        }}
      >
        <input
          type="text"
          value={inputValue}
          disabled={status !== 'jogando'}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Digite a palavra em inglês"
          autoFocus
        />
        <button
          type="submit"
          disabled={status !== 'jogando'}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          Verificar
        </button>
      </form>

      <HintButton key={currentWord.text} word={currentWord.text} />

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
