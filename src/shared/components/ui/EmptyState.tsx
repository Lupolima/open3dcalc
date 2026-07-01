import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-[260px]">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
