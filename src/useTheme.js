import { useEffect, useState } from 'react'

function bevorzugtesTheme() {
  const gespeichert = localStorage.getItem('theme')
  if (gespeichert === 'dark' || gespeichert === 'light') return gespeichert
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState(bevorzugtesTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function setTheme(neu) {
    localStorage.setItem('theme', neu)
    setThemeState(neu)
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
