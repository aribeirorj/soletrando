import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useSpeech } from '../hooks/useSpeech'
import type { Difficulty, GameMode } from '../types'
import logoJogo from '../assets/logo-jogo.png'
import { HeroIllustration } from './HeroIllustration'
import { RecordBadge } from './RecordBadge'
import { OptionButton } from './OptionButton'
import { GameOptionsFields, MODE_SELECTED_CLASS } from './GameOptionsFields'
import { PlayIcon, UserIcon, UsersIcon } from './icons'

export function HomeScreen() {
  const highScore = useGameStore((s) => s.highScore)
  const playerName = useGameStore((s) => s.playerName)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const startGame = useGameStore((s) => s.startGame)
  const { isSupported: speechSupported } = useSpeech()

  const students = useSessionStore((s) => s.students)
  const questionsPerRound = useSessionStore((s) => s.questionsPerRound)
  const addStudent = useSessionStore((s) => s.addStudent)
  const removeStudent = useSessionStore((s) => s.removeStudent)
  const setQuestionsPerRound = useSessionStore((s) => s.setQuestionsPerRound)
  const startSession = useSessionStore((s) => s.startSession)

  const [playMode, setPlayMode] = useState<'individual' | 'turma' | null>(null)
  const [studentNameInput, setStudentNameInput] = useState('')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const isSpeakAndSpell = selectedMode === 'falar-soletrar'
  const hasGameOptions =
    selectedMode !== null && (isSpeakAndSpell ? selectedCategories.length > 0 : selectedDifficulty !== null)

  const handleToggleCategory = (id: string) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const canStartIndividual = playerName.trim() !== '' && hasGameOptions
  const canStartTurma = students.length > 0 && hasGameOptions

  const handleAddStudent = () => {
    if (studentNameInput.trim() === '') return
    addStudent(studentNameInput)
    setStudentNameInput('')
  }

  const handleStartIndividual = () => {
    if (!canStartIndividual || !selectedMode) return
    startGame(
      selectedMode,
      isSpeakAndSpell ? 'dificil' : selectedDifficulty!,
      undefined,
      isSpeakAndSpell ? selectedCategories : null,
    )
  }

  const handleStartSession = () => {
    if (!canStartTurma || !selectedMode) return
    startSession(
      selectedMode,
      isSpeakAndSpell ? 'dificil' : selectedDifficulty!,
      isSpeakAndSpell ? selectedCategories : null,
    )
  }

  return (
    <div className="mx-auto grid max-w-[1650px] grid-cols-1 items-center gap-8 px-4 py-10 lg:grid-cols-[44%_56%] lg:gap-6 xl:grid-cols-[1fr_680px_auto]">
      <HeroIllustration />

      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-brand-blue/10 bg-white p-6 shadow-[0_20px_50px_rgba(11,58,130,0.12)] sm:p-9">
        <div className="flex flex-col items-center gap-3">
          <img src={logoJogo} alt="Jogo de Soletrar" className="w-full max-w-[380px]" />
          <RecordBadge value={highScore} playerName={playerName} />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-sm font-semibold text-brand-textMain">Como você quer jogar?</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <OptionButton
              selected={playMode === 'individual'}
              onClick={() => setPlayMode('individual')}
              icon={<UserIcon />}
              label="Jogar Individual"
              selectedClassName={MODE_SELECTED_CLASS}
            />
            <OptionButton
              selected={playMode === 'turma'}
              onClick={() => setPlayMode('turma')}
              icon={<UsersIcon />}
              label="Jogar com a Turma"
              selectedClassName={MODE_SELECTED_CLASS}
            />
          </div>
        </div>

        {playMode === 'individual' && (
          <>
            <div className="mt-6 flex flex-col gap-2">
              <label
                htmlFor="player-name"
                className="flex items-center gap-2 text-sm font-semibold text-brand-textMain"
              >
                <UserIcon className="h-5 w-5 text-brand-blue" />
                Nome do jogador
              </label>
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                className="h-14 rounded-2xl border border-brand-blue/30 bg-white px-4 text-base focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <GameOptionsFields
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              speechSupported={speechSupported}
            />

            <button
              type="button"
              disabled={!canStartIndividual}
              onClick={handleStartIndividual}
              className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blueDark text-lg font-bold text-white shadow-[0_10px_30px_rgba(11,58,130,0.35)] transition hover:bg-brand-blue disabled:opacity-50"
            >
              <PlayIcon />
              Iniciar Jogo
            </button>
          </>
        )}

        {playMode === 'turma' && (
          <>
            <div className="mt-6 flex flex-col gap-2">
              <label
                htmlFor="student-name"
                className="flex items-center gap-2 text-sm font-semibold text-brand-textMain"
              >
                <UsersIcon className="h-5 w-5 text-brand-blue" />
                Alunos
              </label>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddStudent()
                }}
              >
                <input
                  id="student-name"
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="Nome do aluno"
                  className="h-14 flex-1 rounded-2xl border border-brand-blue/30 bg-white px-4 text-base focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                <button
                  type="submit"
                  className="rounded-2xl border border-brand-blue/30 px-4 font-semibold text-brand-blueDark hover:bg-brand-grayLight"
                >
                  Adicionar
                </button>
              </form>
              {students.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {students.map((student) => (
                    <li
                      key={student.id}
                      className="flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blueLight px-3 py-1 text-sm text-brand-blueDark"
                    >
                      {student.name}
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        aria-label={`Remover ${student.name}`}
                        className="text-brand-blueDark/70 hover:text-brand-blueDark"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <label htmlFor="questions-per-round" className="text-sm font-semibold text-brand-textMain">
                Perguntas por rodada
              </label>
              <input
                id="questions-per-round"
                type="number"
                min={1}
                value={questionsPerRound}
                onChange={(e) => setQuestionsPerRound(Math.max(1, Number(e.target.value) || 1))}
                className="h-14 rounded-2xl border border-brand-blue/30 bg-white px-4 text-base focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <GameOptionsFields
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              speechSupported={speechSupported}
            />

            <button
              type="button"
              disabled={!canStartTurma}
              onClick={handleStartSession}
              className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blueDark text-lg font-bold text-white shadow-[0_10px_30px_rgba(11,58,130,0.35)] transition hover:bg-brand-blue disabled:opacity-50"
            >
              <PlayIcon />
              Iniciar Sessão
            </button>
          </>
        )}
      </div>
    </div>
  )
}
