import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 lg:p-3 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative block w-5 h-5">
        <Sun
          className="absolute inset-0 w-5 h-5 transition-all duration-200"
          style={{
            opacity: theme === 'dark' ? 0 : 1,
            transform: theme === 'dark' ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
          }}
          strokeWidth={2}
        />
        <Moon
          className="absolute inset-0 w-5 h-5 transition-all duration-200"
          style={{
            opacity: theme === 'dark' ? 1 : 0,
            transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
          }}
          strokeWidth={2}
        />
      </span>
    </button>
  )
}
