import { useEffect, useState } from 'react'
import {
  QUESTION_SECONDS_BY_MODE,
  SPEAK_AND_SPELL_POINTS_PER_LETTER,
  computeQuestionScore,
} from '../store/gameStore'
import type { Difficulty, GameMode } from '../types'
import { HelpCircleIcon } from './icons'

const MODE_LABELS: Record<GameMode, string> = {
  'ouvir-digitar': 'Ouvir e Digitar',
  'letras-embaralhadas': 'Letras Embaralhadas',
  'falar-soletrar': 'Falar e Soletrar',
}

const HOW_TO_PLAY: Record<GameMode, string> = {
  'ouvir-digitar': 'Ouça a palavra em inglês e digite como ela se escreve.',
  'letras-embaralhadas': 'Coloque as letras embaralhadas na ordem certa para formar a palavra.',
  'falar-soletrar': 'Fale cada letra da palavra em voz alta. O professor marca se a letra está certa ou errada.',
}

function getRules(mode: GameMode, difficulty: Difficulty): string[] {
  const seconds = `Você tem ${QUESTION_SECONDS_BY_MODE[mode]} segundos para cada palavra.`

  if (mode === 'falar-soletrar') {
    return [
      HOW_TO_PLAY[mode],
      seconds,
      `Cada palavra vale ${SPEAK_AND_SPELL_POINTS_PER_LETTER} pontos por letra (espaços não contam).`,
      'Só ganha os pontos se acertar todas as letras. Uma letra errada e a palavra vale 0.',
      'Se o tempo acabar, conta como erro.',
    ]
  }

  const points = computeQuestionScore(difficulty, false)
  return [
    HOW_TO_PLAY[mode],
    seconds,
    `Cada acerto vale ${points} pontos.`,
    `Usar a Dica reduz os pontos pela metade (${computeQuestionScore(difficulty, true)} pontos).`,
    'Errar ou deixar o tempo acabar vale 0 pontos.',
  ]
}

type RulesButtonProps = {
  mode: GameMode
  difficulty: Difficulty
}

export function RulesButton({ mode, difficulty }: RulesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ver regras"
        title="Ver regras"
        className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <HelpCircleIcon width={24} height={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
          >
            <h3 id="rules-title" className="text-lg font-bold">
              Regras — {MODE_LABELS[mode]}
            </h3>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
              {getRules(mode, difficulty).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
              <li>Acertos seguidos aumentam a Sequência, mas não dão pontos extras.</li>
              <li>Os pontos de cada turno somam no total do aluno e aparecem no Ranking.</li>
            </ul>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              autoFocus
              className="self-end rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
