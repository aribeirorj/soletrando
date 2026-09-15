import { useSessionStore } from '../store/sessionStore'
import { TrophyIcon } from './icons'

export function SessionRosterScreen() {
  const students = useSessionStore((s) => s.students)
  const startTurn = useSessionStore((s) => s.startTurn)
  const openRanking = useSessionStore((s) => s.openRanking)
  const endSession = useSessionStore((s) => s.endSession)

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10">
      <h2 className="text-xl font-bold">Sessão com a turma</h2>

      <ul className="flex w-full flex-col gap-2">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex items-center justify-between gap-2 rounded-md border bg-card px-4 py-3"
          >
            <div>
              <p className="font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">
                {student.totalScore} pontos ·{' '}
                <span className="font-semibold text-green-600">{student.correctCount} acertos</span> ·{' '}
                <span className="font-semibold text-brand-red">{student.wrongCount} erros</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => startTurn(student.id)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Jogar
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={openRanking}
        className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 font-semibold hover:bg-accent"
      >
        <TrophyIcon className="text-brand-yellowDark" />
        Ver ranking
      </button>

      <button type="button" onClick={endSession} className="text-sm text-muted-foreground underline">
        Encerrar sessão
      </button>
    </div>
  )
}
