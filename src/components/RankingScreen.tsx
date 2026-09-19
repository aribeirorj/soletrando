import { useSessionStore } from '../store/sessionStore'
import { sortByScoreDescending } from '../store/sessionStore'
import { getLanguage } from '../language/current'
import { TrophyIcon } from './icons'

export function RankingScreen() {
  const students = useSessionStore((s) => s.students)
  const closeRanking = useSessionStore((s) => s.closeRanking)
  const ranked = sortByScoreDescending(students)
  const labels = getLanguage().labels

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10">
      <h2 className="text-xl font-bold">{labels.classRanking}</h2>

      <ol className="flex w-full flex-col gap-2">
        {ranked.map((student, index) => (
          <li
            key={student.id}
            className="flex items-center justify-between gap-2 rounded-md border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-right font-bold text-brand-textMain">{labels.rankPosition(index + 1)}</span>
              {index < 3 && <TrophyIcon className="text-brand-yellowDark" />}
              <span className="font-semibold">{student.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{labels.pointsCount(student.totalScore)}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={closeRanking}
        className="w-full rounded-md border px-4 py-2 font-semibold hover:bg-accent"
      >
        {labels.back}
      </button>
    </div>
  )
}
