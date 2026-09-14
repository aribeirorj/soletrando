import { useGameStore } from '../store/gameStore'
import { useDictionaryHint } from '../hooks/useDictionaryHint'
import { LightbulbIcon } from './icons'

interface HintButtonProps {
  word: string
}

export function HintButton({ word }: HintButtonProps) {
  const hintUsedThisRound = useGameStore((s) => s.hintUsedThisRound)
  const useHint = useGameStore((s) => s.useHint)
  const { definition, isLoading, error, fetchHint } = useDictionaryHint()

  const handleClick = () => {
    useHint()
    void fetchHint(word)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={hintUsedThisRound}
        className="flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
      >
        <LightbulbIcon width="16" height="16" /> Dica
      </button>
      {isLoading && <p className="text-sm text-muted-foreground">Buscando dica...</p>}
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
      {definition && <p className="text-sm text-muted-foreground">Dica: {definition}</p>}
    </div>
  )
}
