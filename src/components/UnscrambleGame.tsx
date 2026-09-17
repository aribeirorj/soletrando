import { useEffect, useMemo, useState } from 'react'
import { QUESTION_SECONDS_BY_MODE, useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useCountdown } from '../hooks/useCountdown'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { HintButton } from './HintButton'
import { QuestionFeedback } from './QuestionFeedback'

const QUESTION_SECONDS = QUESTION_SECONDS_BY_MODE['letras-embaralhadas']

interface LetterBlock {
  id: number
  letter: string
}

function shuffleWord(word: string): LetterBlock[] {
  const original = word.split('')
  let shuffled = [...original]

  for (let attempt = 0; attempt < 10; attempt++) {
    shuffled = [...original]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    if (shuffled.join('') !== word || word.length <= 1) break
  }

  return shuffled.map((letter, index) => ({ id: index, letter }))
}

export function UnscrambleGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const turnLength = useGameStore((s) => s.turnLength)
  const questionsAnsweredInTurn = useGameStore((s) => s.questionsAnsweredInTurn)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const { remaining, reset } = useCountdown({ seconds: QUESTION_SECONDS, onExpire: handleTimeout })

  const shuffled = useMemo(
    () => (currentWord ? shuffleWord(currentWord.text) : []),
    [currentWord],
  )
  const [available, setAvailable] = useState<LetterBlock[]>(shuffled)
  const [placed, setPlaced] = useState<LetterBlock[]>([])

  useEffect(() => {
    setAvailable(shuffled)
    setPlaced([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord])

  useEffect(() => {
    if (currentWord && placed.length > 0 && placed.length === currentWord.text.length) {
      submitAnswer(placed.map((b) => b.letter).join(''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed])

  if (!currentWord) return null

  const isTurnComplete = turnLength !== null && questionsAnsweredInTurn >= turnLength

  const placeLetter = (block: LetterBlock) => {
    if (status !== 'jogando') return
    setAvailable((prev) => prev.filter((b) => b.id !== block.id))
    setPlaced((prev) => [...prev, block])
  }

  const removeLetter = (block: LetterBlock) => {
    if (status !== 'jogando') return
    setPlaced((prev) => prev.filter((b) => b.id !== block.id))
    setAvailable((prev) => [...prev, block])
  }

  const handleClear = () => {
    setAvailable(shuffled)
    setPlaced([])
  }

  const handleNext = () => {
    if (isTurnComplete) {
      finishTurn()
      return
    }
    reset(QUESTION_SECONDS)
    pickNextWord()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      <p className="text-sm text-muted-foreground">
        Pergunta {turnLength !== null ? Math.min(questionsAnsweredInTurn + 1, turnLength) : questionsAnsweredInTurn + 1}
        {turnLength !== null && ` de ${turnLength}`}
      </p>
      <Timer remaining={remaining} total={QUESTION_SECONDS} />

      <div
        data-testid="placed-letters"
        className="flex min-h-12 w-full flex-wrap justify-center gap-2 rounded-md border p-2"
      >
        {placed.map((block) => (
          <button
            key={block.id}
            type="button"
            disabled={status !== 'jogando'}
            onClick={() => removeLetter(block)}
            className="h-10 w-10 rounded-md bg-primary text-lg font-bold uppercase text-primary-foreground"
          >
            {block.letter}
          </button>
        ))}
      </div>

      <div data-testid="available-letters" className="flex flex-wrap justify-center gap-2">
        {available.map((block) => (
          <button
            key={block.id}
            type="button"
            disabled={status !== 'jogando'}
            onClick={() => placeLetter(block)}
            className="h-10 w-10 rounded-md border text-lg font-bold uppercase hover:bg-accent disabled:opacity-50"
          >
            {block.letter}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="text-sm text-muted-foreground underline"
      >
        Limpar
      </button>

      <HintButton key={currentWord.text} word={currentWord.text} />

      {status !== 'jogando' && (
        <QuestionFeedback
          status={status}
          correctAnswer={currentWord.text}
          onNext={handleNext}
          nextLabel={isTurnComplete ? 'Ver resultado da rodada' : 'Próxima palavra'}
        />
      )}
    </div>
  )
}
