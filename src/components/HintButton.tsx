import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getLanguage } from '../language/current'
import { LightbulbIcon } from './icons'

interface HintButtonProps {
  word: string
}

export function HintButton({ word }: HintButtonProps) {
  const hintUsedThisQuestion = useGameStore((s) => s.hintUsedThisQuestion)
  const markHintUsed = useGameStore((s) => s.useHint)
  const [isRevealed, setIsRevealed] = useState(false)
  const language = getLanguage()
  const hint = language.getHint(word)

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
        disabled={!hint || hintUsedThisQuestion}
        className="flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
      >
        <LightbulbIcon width="16" height="16" /> {language.labels.hint}
      </button>
      {isRevealed && hint && <p className="text-sm text-muted-foreground">
          {language.labels.hintPrefix} {hint}
        </p>}
    </div>
  )
}
