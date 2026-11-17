import { useEffect, useState } from 'react'
import { applyTheme, readThemeChoice, type ThemeChoice } from './theme'

export function ThemeSwitch() {
  const [choice, setChoice] = useState<ThemeChoice>('auto')
  useEffect(() => {
    const current = readThemeChoice()
    setChoice(current)
    applyTheme(current)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (readThemeChoice() === 'auto') applyTheme('auto') }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return (
    <label className="text-xs text-muted">
      <span className="sr-only">Thème de l’atelier</span>
      <select
        aria-label="Thème de l’atelier"
        className="h-8 rounded-full border border-line bg-paper px-2 text-sm text-ink"
        value={choice}
        onChange={(event) => {
          const next = event.target.value as ThemeChoice
          setChoice(next)
          applyTheme(next)
        }}
      >
        <option value="auto">Auto</option>
        <option value="light">Clair doux</option>
        <option value="dark">Sombre doux</option>
      </select>
    </label>
  )
}
