import { ThemeToggle } from './ThemeToggle'
import type { Theme } from '../../types/song'

type HeaderProps = {
  theme: Theme
  onToggleTheme: () => void
  persistenceWarning: boolean
}

export function Header({
  theme,
  onToggleTheme,
  persistenceWarning,
}: HeaderProps) {
  return (
    <header className="site-header screen-only mx-auto w-full max-w-[74rem] px-4 sm:px-6 lg:px-8">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 36 36" fill="none">
            <path d="M8 7v22M17 7v22M26 7v22M4 13h26M4 22h26" />
            <circle cx="8" cy="13" r="2.2" />
            <circle cx="17" cy="22" r="2.2" />
            <circle cx="26" cy="13" r="2.2" />
          </svg>
        </span>
        <span className="brand-name">chordnote</span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-tagline">a little room for your next song</span>
      </div>

      <div className="site-header__actions">
        {persistenceWarning && (
          <p className="theme-warning" role="status">
            Theme preference couldn't be saved on this device.
          </p>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
