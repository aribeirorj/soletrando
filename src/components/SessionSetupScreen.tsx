import { useState } from 'react'
import { useSessionStore } from '../store/sessionStore'
import { useSpeech } from '../hooks/useSpeech'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { OptionButton } from './OptionButton'
import type { Difficulty, GameMode } from '../types'
import {
  BarChartIcon,
  GamepadIcon,
  MicrophoneIcon,
  ShuffleIcon,
  SpeakerIcon,
  SproutIcon,
  StarIcon,
} from './icons'

const MODE_OPTIONS: { mode: GameMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'ouvir-digitar', label: 'Ouvir e Digitar', icon: <SpeakerIcon /> },
  { mode: 'letras-embaralhadas', label: 'Letras Embaralhadas', icon: <ShuffleIcon /> },
  { mode: 'falar-soletrar', label: 'Falar e Soletrar', icon: <MicrophoneIcon /> },
]

const DIFFICULTY_OPTIONS: {
  difficulty: Difficulty
  label: string
  icon: React.ReactNode
  selectedClassName: string
}[] = [
  {
    difficulty: 'facil',
    label: 'Fácil',
    icon: <SproutIcon />,
    selectedClassName: 'bg-green-500 text-white border-green-600 shadow-md',
  },
  {
    difficulty: 'medio',
    label: 'Médio',
    icon: <StarIcon />,
    selectedClassName: 'bg-brand-yellow text-brand-textMain border-brand-yellowDark shadow-md',
  },
  {
    difficulty: 'dificil',
    label: 'Difícil',
    icon: <BarChartIcon />,
    selectedClassName: 'bg-brand-red text-white border-brand-redDark shadow-md',
  },
]

const MODE_SELECTED_CLASS = 'bg-brand-red text-white border-brand-redDark shadow-md'

export function SessionSetupScreen() {
  const students = useSessionStore((s) => s.students)
  const questionsPerRound = useSessionStore((s) => s.questionsPerRound)
  const addStudent = useSessionStore((s) => s.addStudent)
  const removeStudent = useSessionStore((s) => s.removeStudent)
  const setQuestionsPerRound = useSessionStore((s) => s.setQuestionsPerRound)
  const startSession = useSessionStore((s) => s.startSession)
  const cancelSetup = useSessionStore((s) => s.cancelSetup)

  const { isSupported: speechSupported } = useSpeech()
  const { isSupported: recognitionSupported } = useSpeechRecognition()

  const [nameInput, setNameInput] = useState('')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)

  const canStart = students.length > 0 && selectedMode !== null && selectedDifficulty !== null

  const isModeDisabled = (mode: GameMode) =>
    (mode === 'ouvir-digitar' && !speechSupported) ||
    (mode === 'falar-soletrar' && !recognitionSupported)

  const handleAddStudent = () => {
    if (nameInput.trim() === '') return
    addStudent(nameInput)
    setNameInput('')
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10">
      <h2 className="text-xl font-bold">Sessão com a turma</h2>

      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-semibold">Alunos</span>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleAddStudent()
          }}
        >
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nome do aluno"
            className="flex-1 rounded-md border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md border px-4 py-2 font-semibold hover:bg-accent"
          >
            Adicionar
          </button>
        </form>
        {students.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-sm"
              >
                {student.name}
                <button
                  type="button"
                  onClick={() => removeStudent(student.id)}
                  aria-label={`Remover ${student.name}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="questions-per-round" className="text-sm font-semibold">
          Perguntas por rodada
        </label>
        <input
          id="questions-per-round"
          type="number"
          min={1}
          value={questionsPerRound}
          onChange={(e) => setQuestionsPerRound(Math.max(1, Number(e.target.value) || 1))}
          className="rounded-md border px-3 py-2"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <GamepadIcon className="h-5 w-5 text-brand-blue" />
          Modo de jogo
        </span>
        <div className="flex flex-col gap-2 sm:flex-row">
          {MODE_OPTIONS.map(({ mode, label, icon }) => (
            <OptionButton
              key={mode}
              selected={selectedMode === mode}
              disabled={isModeDisabled(mode)}
              onClick={() => setSelectedMode(mode)}
              icon={icon}
              label={label}
              selectedClassName={MODE_SELECTED_CLASS}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <BarChartIcon className="h-5 w-5 text-brand-blue" />
          Dificuldade
        </span>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map(({ difficulty, label, icon, selectedClassName }) => (
            <OptionButton
              key={difficulty}
              selected={selectedDifficulty === difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              icon={icon}
              label={label}
              selectedClassName={selectedClassName}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => canStart && startSession(selectedMode, selectedDifficulty)}
        className="w-full rounded-md bg-brand-blueDark px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        Iniciar sessão
      </button>

      <button type="button" onClick={cancelSetup} className="text-sm text-muted-foreground underline">
        Cancelar
      </button>
    </div>
  )
}
