import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { QUESTION_SECONDS_BY_MODE, useGameStore } from '../store/gameStore'
import { useSessionStore } from '../store/sessionStore'
import { useSpeech } from '../hooks/useSpeech'
import { getLanguage } from '../language/current'
import { useCountdown } from '../hooks/useCountdown'
import { ScoreBoard } from './ScoreBoard'
import { Timer } from './Timer'
import { HintButton } from './HintButton'
import { QuestionFeedback } from './QuestionFeedback'
import { SpeakerIcon } from './icons'

const QUESTION_SECONDS = QUESTION_SECONDS_BY_MODE['ouvir-digitar']

// Sem isso, o teclado do celular acentua e completa a palavra pelo aluno.
const STRICT_TYPING_ATTRIBUTES = {
  autoCorrect: 'off',
  autoCapitalize: 'off',
  autoComplete: 'off',
  spellCheck: false,
} as const

export function ListenAndTypeGame() {
  const currentWord = useGameStore((s) => s.currentWord)
  const status = useGameStore((s) => s.status)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const handleTimeout = useGameStore((s) => s.handleTimeout)
  const pickNextWord = useGameStore((s) => s.pickNextWord)
  const turnLength = useGameStore((s) => s.turnLength)
  const questionsAnsweredInTurn = useGameStore((s) => s.questionsAnsweredInTurn)
  const finishTurn = useSessionStore((s) => s.finishTurn)

  const language = getLanguage()
  const { isSupported, speak } = useSpeech(language.speechLang)
  const [inputValue, setInputValue] = useState('')
  const { remaining, reset } = useCountdown({ seconds: QUESTION_SECONDS, onExpire: handleTimeout })
  const inputRef = useRef<HTMLInputElement>(null)
  // Onde o cursor fica depois de uma Tecla de acento (o React o levaria para o fim).
  const cursorAfterAccentRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const cursor = cursorAfterAccentRef.current
    if (cursor === null) return
    cursorAfterAccentRef.current = null
    inputRef.current?.setSelectionRange(cursor, cursor)
  }, [inputValue])

  useEffect(() => {
    if (currentWord && isSupported) {
      speak(currentWord.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord])

  if (!currentWord) return null

  const isTurnComplete = turnLength !== null && questionsAnsweredInTurn >= turnLength

  // Troca o trecho selecionado (ou insere no cursor) pela letra acentuada.
  const insertAccent = (letter: string) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? inputValue.length
    const end = input?.selectionEnd ?? inputValue.length
    cursorAfterAccentRef.current = start + letter.length
    setInputValue(inputValue.slice(0, start) + letter + inputValue.slice(end))
    input?.focus()
  }

  const handleNext = () => {
    if (isTurnComplete) {
      finishTurn()
      return
    }
    setInputValue('')
    reset(QUESTION_SECONDS)
    pickNextWord()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10">
      <ScoreBoard />
      <p className="text-sm text-muted-foreground">
        Pergunta {turnLength !== null ? Math.min(questionsAnsweredInTurn + 1, turnLength) : questionsAnsweredInTurn + 1}
        {turnLength !== null && ` de ${turnLength}`}
      </p>
      <Timer remaining={remaining} total={QUESTION_SECONDS} />

      {isSupported ? (
        <button
          type="button"
          onClick={() => speak(currentWord.text)}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-lg"
        >
          <SpeakerIcon /> Repetir
        </button>
      ) : (
        <p className="text-sm text-muted-foreground">Narração não disponível neste navegador.</p>
      )}

      <form
        className="flex w-full gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submitAnswer(inputValue)
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={status !== 'jogando'}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2"
          placeholder={language.texts.typeWordPlaceholder}
          {...(language.strictTypingInput && STRICT_TYPING_ATTRIBUTES)}
          autoFocus
        />
        <button
          type="submit"
          disabled={status !== 'jogando'}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          Verificar
        </button>
      </form>

      {language.accentButtons.length > 0 && (
        <div role="group" aria-label="Letras com acento" className="flex flex-wrap justify-center gap-2">
          {language.accentButtons.map((letter) => (
            <button
              key={letter}
              type="button"
              title={`Inserir ${letter}`}
              disabled={status !== 'jogando'}
              // Não tira o foco do campo, para o cursor continuar onde o aluno estava.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAccent(letter)}
              className="h-10 w-10 rounded-md border text-lg font-semibold hover:bg-accent disabled:opacity-50"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      <HintButton key={currentWord.text} word={currentWord.text} />

      {status !== 'jogando' && (
        <QuestionFeedback
          status={status}
          correctAnswer={currentWord.text}
          onNext={handleNext}
          nextLabel={isTurnComplete ? 'Ver resultado da rodada' : 'Próxima palavra'}
        />
      )}
    </div>
  )
}
