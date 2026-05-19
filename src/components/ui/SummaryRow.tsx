import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function SummaryRow({
  label, icon, value, colorClass = 'text-gray-300',
}: {
  label: string
  icon: string
  value: string
  colorClass?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 group last:border-0">
      <div className={`flex items-center gap-2 text-xs font-medium ${colorClass}`}>
        <span className="text-sm leading-none">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm text-white">{value}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copiar"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  )
}

export function SummarySectionHeader({ title }: { title: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-4 mb-1.5 first:mt-0">
      {title}
    </div>
  )
}
