'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Thème :
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="px-3 py-1 rounded border-2 border-white/30 bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Sélectionner le thème"
      >
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
        <option value="system">Système</option>
      </select>

      <span className="ml-2" aria-live="polite" aria-atomic="true">
        {resolvedTheme === 'dark' ? '🌙' : '☀️'}
      </span>
    </div>
  )
}
