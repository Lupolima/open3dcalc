import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionSectionProps {
  id: string
  title: string
  icon: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export function AccordionSection({ id, title, icon, children, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div id={id} className="scroll-mt-20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 surface rounded-xl mb-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
        aria-expanded={open}
      >
        <span className="text-[var(--color-accent)]">{icon}</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">{title}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'opacity-100 max-h-[2000px] mb-4' : 'opacity-0 max-h-0 mb-0'}`}>
        {children}
      </div>
    </div>
  )
}
