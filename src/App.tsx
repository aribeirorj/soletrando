import { Header } from './components/Header'
import { PageBackground } from './components/PageBackground'
import { HomeScreen } from './components/HomeScreen'
import { ListenAndTypeGame } from './components/ListenAndTypeGame'
import { UnscrambleGame } from './components/UnscrambleGame'
import { SpeakAndSpellGame } from './components/SpeakAndSpellGame'
import { SessionSetupScreen } from './components/SessionSetupScreen'
import { SessionRosterScreen } from './components/SessionRosterScreen'
import { RankingScreen } from './components/RankingScreen'
import { useGameStore } from './store/gameStore'
import { useSessionStore } from './store/sessionStore'

function App() {
  const mode = useGameStore((s) => s.mode)
  const resetGame = useGameStore((s) => s.resetGame)
  const sessionView = useSessionStore((s) => s.view)
  const cancelTurn = useSessionStore((s) => s.cancelTurn)

  const handleBackToMenu = () => {
    if (sessionView !== 'idle') {
      cancelTurn()
    } else {
      resetGame()
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <PageBackground />
      <Header />

      {mode !== null && (
        <div className="mx-auto flex max-w-md justify-end px-4 pt-4">
          <button
            type="button"
            onClick={handleBackToMenu}
            className="text-sm text-muted-foreground underline"
          >
            Voltar ao menu
          </button>
        </div>
      )}

      {mode === 'ouvir-digitar' && <ListenAndTypeGame />}
      {mode === 'letras-embaralhadas' && <UnscrambleGame />}
      {mode === 'falar-soletrar' && <SpeakAndSpellGame />}

      {mode === null && sessionView === 'idle' && <HomeScreen />}
      {mode === null && sessionView === 'setup' && <SessionSetupScreen />}
      {mode === null && sessionView === 'roster' && <SessionRosterScreen />}
      {mode === null && sessionView === 'ranking' && <RankingScreen />}
    </div>
  )
}

export default App
