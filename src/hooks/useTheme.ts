import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { Theme } from '../types/song'

type ThemePreference = Theme | 'system'
type ThemeState = {
  preference: ThemePreference
  persistenceWarning: boolean
}

const STORAGE_KEY = 'chordnote-theme'

function readThemePreference(): ThemeState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') {
      return { preference: stored, persistenceWarning: false }
    }

    if (stored !== null) {
      console.error('Ignoring an invalid stored Chordnote theme preference.')
      return { preference: 'system', persistenceWarning: true }
    }

    return { preference: 'system', persistenceWarning: false }
  } catch (error) {
    console.error('Unable to read the saved Chordnote theme preference.', error)
    return { preference: 'system', persistenceWarning: true }
  }
}

function readSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useTheme() {
  const [state, setState] = useState(readThemePreference)
  const [systemTheme, setSystemTheme] = useState(readSystemTheme)
  const theme = state.preference === 'system' ? systemTheme : state.preference

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (state.preference !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [state.preference])

  const chooseTheme = useCallback((preference: Theme) => {
    setState({ preference, persistenceWarning: false })

    try {
      window.localStorage.setItem(STORAGE_KEY, preference)
    } catch (error) {
      console.error('Unable to save the Chordnote theme preference.', error)
      setState({ preference, persistenceWarning: true })
    }
  }, [])

  const toggleTheme = useCallback(() => {
    chooseTheme(theme === 'dark' ? 'light' : 'dark')
  }, [chooseTheme, theme])

  return { theme, toggleTheme, persistenceWarning: state.persistenceWarning }
}
