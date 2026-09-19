import { getLanguage } from '../language/current'
import { OptionButton } from './OptionButton'
import type { Difficulty, GameMode } from '../types'
import { BarChartIcon, GamepadIcon, MicrophoneIcon, ShuffleIcon, SpeakerIcon, SproutIcon, StarIcon } from './icons'

export const MODE_SELECTED_CLASS = 'bg-brand-red text-white border-brand-redDark shadow-md'

const MODE_OPTIONS: { mode: GameMode; icon: React.ReactNode }[] = [
  { mode: 'ouvir-digitar', icon: <SpeakerIcon /> },
  { mode: 'letras-embaralhadas', icon: <ShuffleIcon /> },
  { mode: 'falar-soletrar', icon: <MicrophoneIcon /> },
]

const DIFFICULTY_OPTIONS: {
  difficulty: Difficulty
  icon: React.ReactNode
  selectedClassName: string
}[] = [
  {
    difficulty: 'facil',
    icon: <SproutIcon />,
    selectedClassName: 'bg-green-500 text-white border-green-600 shadow-md',
  },
  {
    difficulty: 'medio',
    icon: <StarIcon />,
    selectedClassName: 'bg-brand-yellow text-brand-textMain border-brand-yellowDark shadow-md',
  },
  {
    difficulty: 'dificil',
    icon: <BarChartIcon />,
    selectedClassName: 'bg-brand-red text-white border-brand-redDark shadow-md',
  },
]

interface GameOptionsFieldsProps {
  selectedMode: GameMode | null
  onSelectMode: (mode: GameMode) => void
  selectedDifficulty: Difficulty | null
  onSelectDifficulty: (difficulty: Difficulty) => void
  selectedCategories: string[]
  onToggleCategory: (id: string) => void
  speechSupported: boolean
  // Botão "?" de Regras ao lado do título "Modo de jogo" (Jogo Individual).
  rulesButton?: React.ReactNode
}

export function GameOptionsFields({
  selectedMode,
  onSelectMode,
  selectedDifficulty,
  onSelectDifficulty,
  selectedCategories,
  onToggleCategory,
  speechSupported,
  rulesButton,
}: GameOptionsFieldsProps) {
  const language = getLanguage()
  const labels = language.labels
  const isSpeakAndSpell = selectedMode === 'falar-soletrar'
  const isModeDisabled = (mode: GameMode) => mode === 'ouvir-digitar' && !speechSupported

  return (
    <>
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-textMain">
            <GamepadIcon className="h-5 w-5 text-brand-blue" />
            {labels.gameMode}
          </span>
          {rulesButton}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {MODE_OPTIONS.map(({ mode, icon }) => (
            <OptionButton
              key={mode}
              selected={selectedMode === mode}
              disabled={isModeDisabled(mode)}
              onClick={() => onSelectMode(mode)}
              icon={icon}
              label={labels.modes[mode]}
              selectedClassName={MODE_SELECTED_CLASS}
            />
          ))}
        </div>
        {!speechSupported && (
          <p className="text-xs text-brand-grayText">
            Seu navegador não suporta narração de voz. O modo "{labels.modes['ouvir-digitar']}" está desabilitado.
          </p>
        )}
      </div>

      {isSpeakAndSpell ? (
        <div className="mt-6 flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-textMain">
            <BarChartIcon className="h-5 w-5 text-brand-blue" />
            {labels.categories}
          </span>
          <p className="text-xs text-brand-grayText">{labels.selectCategories}</p>
          <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3">
            {language.categories.map(({ id, label }) => (
              <OptionButton
                key={id}
                selected={selectedCategories.includes(id)}
                onClick={() => onToggleCategory(id)}
                icon={<MicrophoneIcon />}
                label={label}
                selectedClassName={MODE_SELECTED_CLASS}
                align="left"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-textMain">
            <BarChartIcon className="h-5 w-5 text-brand-blue" />
            {labels.difficulty}
          </span>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map(({ difficulty, icon, selectedClassName }) => (
              <OptionButton
                key={difficulty}
                selected={selectedDifficulty === difficulty}
                onClick={() => onSelectDifficulty(difficulty)}
                icon={icon}
                label={labels.difficulties[difficulty]}
                selectedClassName={selectedClassName}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
