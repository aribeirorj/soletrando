import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getWordHint } from '../data/wordHints'
import { LightbulbIcon } from './icons'

interface HintButtonProps {
  word: string
}

export function HintButton({ word }: HintButtonProps) {
  const hintUsedThisRound = useGameStore((s) => s.hintUsedThisRound)
  const markHintUsed = useGameStore((s) => s.useHint)
  const [isRevealed, setIsRevealed] = useState(false)
  const hint = getWordHint(word)

  const handleClick = () => {
    if (!hint) return
    markHintUsed()
    setIsRevealed(true)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={!hint || hintUsedThisRound}
        className="flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
      >
        <LightbulbIcon width="16" height="16" /> Dica
      </button>
      {isRevealed && hint && <p className="text-sm text-muted-foreground">Dica: {hint}</p>}
    </div>
  )
}
