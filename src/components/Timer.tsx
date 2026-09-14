interface TimerProps {
  remaining: number
  total: number
}

export function Timer({ remaining, total }: TimerProps) {
  const percentage = total > 0 ? (remaining / total) * 100 : 0
  const isLow = remaining <= 5

  return (
    <div className="w-full">
      <div className="mb-1 text-sm text-muted-foreground">{remaining}s</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${isLow ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
