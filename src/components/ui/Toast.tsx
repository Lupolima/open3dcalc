import { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success' | 'info'
}

interface ToastProps {
  items: ToastItem[]
  onDismiss: (id: number) => void
}

const typeStyles: Record<ToastItem['type'], string> = {
  error: 'bg-red-600/90 border-red-500/30 text-white',
  success: 'bg-emerald-600/90 border-emerald-500/30 text-white',
  info: 'bg-indigo-600/90 border-indigo-500/30 text-white',
}

export function ToastContainer({ items, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="region" aria-label="Notificações" aria-live="polite">
      {items.map(item => (
        <ToastItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 4000)
    return () => clearTimeout(timer)
  }, [item.id, onDismiss])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border backdrop-blur-md animate-slide-left ${typeStyles[item.type]}`}
      role="alert"
    >
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none rounded"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
