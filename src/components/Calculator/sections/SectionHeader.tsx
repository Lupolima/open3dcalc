import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
}

export function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)' }}>
        <Icon className="w-[18px] h-[18px] text-indigo-400" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-slate-100 leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
