import { useGameStore } from '../store/gameStore'

export function ScoreBoard() {
  const playerName = useGameStore((s) => s.playerName)
  const score = useGameStore((s) => s.score)
  const streak = useGameStore((s) => s.streak)
  const highScore = useGameStore((s) => s.highScore)

  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
      <span>Jogador: {playerName}</span>
      <span>Pontos: {score}</span>
      <span>Sequência: {streak}</span>
      <span>Recorde: {highScore}</span>
    </div>
  )
}
