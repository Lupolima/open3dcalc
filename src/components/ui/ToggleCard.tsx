import type { ReactNode } from 'react'

interface ToggleSwitchProps {
  enabled: boolean
  onToggle: (val: boolean) => void
  title?: string
  showLabels?: boolean
}

export function ToggleSwitch({ enabled, onToggle, title, showLabels = false }: ToggleSwitchProps) {
  if (showLabels) {
    return (
      <button
        onClick={() => onToggle(!enabled)}
        className={`flex h-11 w-28 items-center justify-center rounded-lg text-xs font-bold tracking-wider transition-all duration-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
          enabled
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-white/5 text-gray-500 shadow-inner opacity-70 hover:opacity-100'
        }`}
        title={title || (enabled ? 'Desativar' : 'Ativar')}
      >
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${enabled ? 'bg-white' : 'bg-gray-600'}`} />
          {enabled ? 'ATIVO' : 'INATIVO'}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`group relative flex h-11 w-14 items-center rounded-full p-1 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
        enabled ? 'bg-purple-600' : 'bg-white/10'
      }`}
      title={title || (enabled ? 'Desativar' : 'Ativar')}
      aria-pressed={enabled}
    >
      <div className={`h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 group-active:w-7 ${
        enabled ? 'translate-x-7' : 'translate-x-0'
      }`} />
    </button>
  )
}

interface ToggleCardProps {
  title: string
  icon?: ReactNode
  enabled: boolean
  onToggle: (val: boolean) => void
  children: ReactNode
  theme?: 'purple' | 'sky'
}

export function ToggleCard({ title, icon, enabled, onToggle, children, theme = 'purple' }: ToggleCardProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden transition-all duration-300">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className={`text-base ${theme === 'sky' ? 'text-sky-400' : 'text-purple-400'}`}>{icon}</span>}
          <h3 className="font-semibold text-sm text-white">{title}</h3>
        </div>
        <ToggleSwitch enabled={enabled} onToggle={onToggle} title={enabled ? 'Desativar seção' : 'Ativar seção'} />
      </div>
      <div className={`px-5 py-4 transition-all duration-300 ${enabled ? '' : 'opacity-40 pointer-events-none'}`}>
        {children}
      </div>
    </div>
  )
}
