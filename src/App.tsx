import { Header } from './components/layout/Header'
import { SongEditor } from './components/song/SongEditor'
import { useTheme } from './hooks/useTheme'
import './styles/globals.css'

function App() {
  const { theme, toggleTheme, persistenceWarning } = useTheme()

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        persistenceWarning={persistenceWarning}
      />
      <SongEditor theme={theme} />
      <footer className="site-footer screen-only mx-auto w-full max-w-[74rem] px-4 sm:px-6 lg:px-8">
        <span>Made for the moment before the first note.</span>
        <span>Your song stays in this tab.</span>
      </footer>
    </>
  )
}

export default App
