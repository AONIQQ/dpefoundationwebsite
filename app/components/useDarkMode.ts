'use client'

import { useCallback, useEffect, useState } from 'react'

type SetDarkMode = (value: boolean | ((prev: boolean) => boolean)) => void

const THEME_EVENT = 'dpe:themechange'

/**
 * Shared dark-mode hook.
 *
 * The actual `dark` class is applied to <html> before paint by the inline
 * script in app/layout.tsx (which reads localStorage / prefers-color-scheme),
 * so there is no flash of the wrong theme on load or navigation. This hook
 * syncs React state to that class and persists the user's choice.
 *
 * It also broadcasts changes via a window event so that multiple consumers
 * (e.g. SiteHeader's toggle and a page's toast theme) stay in sync within the
 * same document, and listens for `storage` so other tabs follow along.
 */
export function useDarkMode(): [boolean, SetDarkMode] {
  const [darkMode, setDarkModeState] = useState(false)

  useEffect(() => {
    // Reflect whatever the pre-paint script already applied.
    setDarkModeState(document.documentElement.classList.contains('dark'))

    const sync = () => setDarkModeState(document.documentElement.classList.contains('dark'))
    window.addEventListener(THEME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(THEME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setDarkMode = useCallback<SetDarkMode>((value) => {
    setDarkModeState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      const root = document.documentElement
      if (next) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        /* localStorage unavailable (private mode / SSR) — ignore */
      }
      // Notify other hook instances in this document.
      window.dispatchEvent(new Event(THEME_EVENT))
      return next
    })
  }, [])

  return [darkMode, setDarkMode]
}
