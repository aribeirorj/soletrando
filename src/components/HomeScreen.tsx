import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useSpeech } from '../hooks/useSpeech'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import type { Difficulty, GameMode } from '../types'
import logoJogo from '../assets/logo-jogo.png'
import { HeroIllustration } from './HeroIllustration'
import { DecorativeAside } from './DecorativeAside'
import { RecordBadge } from './RecordBadge'
import { OptionButton } from './OptionButton'
import {
  BarChartIcon,
  GamepadIcon,
  MicrophoneIcon,
  PlayIcon,
  ShuffleIcon,
  SpeakerIcon,
  SproutIcon,
  StarIcon,
  UserIcon,
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

export function HomeScreen() {
  const highScore = useGameStore((s) => s.highScore)
  const playerName = useGameStore((s) => s.playerName)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const startGame = useGameStore((s) => s.startGame)
  const openSessionSetup = useSessionStore((s) => s.openSetup)
  const { isSupported: speechSupported } = useSpeech()
  const { isSupported: recognitionSupported } = useSpeechRecognition()

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)

  const canStart = playerName.trim() !== '' && selectedMode !== null && selectedDifficulty !== null

  const isModeDisabled = (mode: GameMode) =>
    (mode === 'ouvir-digitar' && !speechSupported) ||
    (mode === 'falar-soletrar' && !recognitionSupported)

  return (
    <div className="mx-auto grid max-w-[1650px] grid-cols-1 items-center gap-8 px-4 py-10 lg:grid-cols-[44%_56%] lg:gap-6 xl:grid-cols-[1fr_680px_auto]">
      <HeroIllustration />

      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-brand-blue/10 bg-white p-6 shadow-[0_20px_50px_rgba(11,58,130,0.12)] sm:p-9">
        <div className="flex flex-col items-center gap-3">
          <img src={logoJogo} alt="Jogo de Soletrar" className="w-full max-w-[380px]" />
          <RecordBadge value={highScore} />
        </div>

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

        <div className="mt-6 flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-textMain">
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
          {!speechSupported && (
            <p className="text-xs text-brand-grayText">
              Seu navegador não suporta narração de voz. O modo "Ouvir e Digitar" está
              desabilitado.
            </p>
          )}
          {!recognitionSupported && (
            <p className="text-xs text-brand-grayText">
              Seu navegador não suporta reconhecimento de voz. O modo "Falar e Soletrar" está
              desabilitado.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-textMain">
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
          onClick={() => canStart && startGame(selectedMode, selectedDifficulty)}
          className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blueDark text-lg font-bold text-white shadow-[0_10px_30px_rgba(11,58,130,0.35)] transition hover:bg-brand-blue disabled:opacity-50"
        >
          <PlayIcon />
          Iniciar Jogo
        </button>

        <button
          type="button"
          onClick={openSessionSetup}
          className="mt-3 w-full text-center text-sm text-brand-grayText underline hover:text-brand-blue"
        >
          Sessão com a turma
        </button>
      </div>

      <DecorativeAside />
    </div>
  )
}
