import { useGameStore } from '../store/gameStore'
import { getLanguage } from '../language/current'

export function ScoreBoard() {
  const playerName = useGameStore((s) => s.playerName)
  const score = useGameStore((s) => s.score)
  const streak = useGameStore((s) => s.streak)
  const highScore = useGameStore((s) => s.highScore)
  const labels = getLanguage().labels

  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
      <span>
        {labels.player}: {playerName}
      </span>
      <span>
        {labels.points}: {score}
      </span>
      <span>
        {labels.streak}: {streak}
      </span>
      <span>
        {labels.highScore}: {highScore}
      </span>
    </div>
  )
}
