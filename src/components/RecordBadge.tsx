import { TrophyIcon } from './icons'

export function RecordBadge({ value, playerName }: { value: number; playerName?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand-blueLight px-4 py-1.5 text-sm font-semibold text-brand-blueDark">
      <TrophyIcon className="text-brand-yellowDark" />
      {playerName?.trim() ? `Recorde de ${playerName}: ${value}` : `Recorde: ${value}`}
    </div>
  )
}
