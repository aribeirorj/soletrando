// O resultado final do reconhecedor só chega depois de ~0,5–1 s de silêncio, muitas
// vezes depois de o professor já ter avançado de letra. Por isso cada fala ("utterance")
// pertence à letra que estava ativa no primeiro resultado parcial: é isso que decide
// se ela vai para o balão, só para o histórico ou é descartada.
type UtteranceOwner = 'none' | 'current' | 'previous-letter' | 'ignored'

export interface HeardLettersState {
  confirmedLetter: string | null
  previewLetter: string | null
  history: string[]
  utterance: UtteranceOwner
}

export type HeardLettersAction =
  | { type: 'partial' | 'final'; letters: string[]; active: boolean }
  | { type: 'letter-changed' }
  | { type: 'question-changed' }

export const INITIAL_HEARD_LETTERS: HeardLettersState = {
  confirmedLetter: null,
  previewLetter: null,
  history: [],
  utterance: 'none',
}

export function heardLettersReducer(state: HeardLettersState, action: HeardLettersAction): HeardLettersState {
  switch (action.type) {
    case 'partial': {
      const utterance = state.utterance === 'none' ? (action.active ? 'current' : 'ignored') : state.utterance
      const lastLetter = action.letters.at(-1)
      const previewLetter = utterance === 'current' && lastLetter ? lastLetter : state.previewLetter
      return { ...state, utterance, previewLetter }
    }
    case 'final': {
      const owner = state.utterance === 'none' ? (action.active ? 'current' : 'ignored') : state.utterance
      const next = { ...state, previewLetter: null, utterance: 'none' as const }
      if (owner === 'ignored') return next
      const history = [...state.history, ...action.letters]
      if (owner === 'previous-letter') return { ...next, history }
      return { ...next, history, confirmedLetter: action.letters.at(-1) ?? state.confirmedLetter }
    }
    case 'letter-changed':
      return {
        ...state,
        confirmedLetter: null,
        previewLetter: null,
        utterance: state.utterance === 'current' ? 'previous-letter' : state.utterance,
      }
    case 'question-changed':
      return { ...INITIAL_HEARD_LETTERS, utterance: state.utterance === 'none' ? 'none' : 'ignored' }
  }
}
