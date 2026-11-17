export type ThemeChoice = 'light' | 'dark' | 'auto'

const KEY = 'atelier-ui-theme'

export function readThemeChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'light' || value === 'dark' || value === 'auto') return value
  } catch {
    /* stockage indisponible */
  }
  return 'auto'
}

export function applyTheme(choice: ThemeChoice): void {
  const dark = choice === 'dark' || (choice === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    /* le thème s’applique quand même pour cette visite */
  }
}
