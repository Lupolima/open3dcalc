import { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Search, Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  image?: string
  subtitle?: string
  group?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  label: string
  placeholder?: string
  search?: boolean
  groups?: boolean
  portal?: boolean
  className?: string
}

export function Select({
  value, onChange, options, label, placeholder,
  search = true, groups = false, portal = false, className = '',
}: SelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusIdx, setFocusIdx] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(o =>
      o.label.toLowerCase().includes(q) ||
      (o.subtitle || '').toLowerCase().includes(q) ||
      (o.group || '').toLowerCase().includes(q)
    )
  }, [options, query])

  const grouped = useMemo(() => {
    if (!groups) return [{ group: '', items: filtered }]
    const map = new Map<string, SelectOption[]>()
    filtered.forEach(o => {
      const g = o.group || 'Outros'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(o)
    })
    return Array.from(map.entries()).map(([g, items]) => ({ group: g, items }))
  }, [filtered, groups])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setFocusIdx(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); triggerRef.current?.focus(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter' && focusIdx >= 0 && focusIdx < filtered.length) {
        onChange(filtered[focusIdx].value); close(); return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, focusIdx, onChange, close])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      if (portalRef.current?.contains(e.target as Node)) return
      if (listRef.current?.contains(e.target as Node)) return
      close()
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open, close])

  useEffect(() => {
    if (open && focusIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${focusIdx}"]`)
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusIdx, open])

  const triggerContent = (
    <button
      ref={triggerRef}
      id={`${id}-trigger`}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={`${id}-listbox`}
      aria-label={label}
      onClick={() => setOpen(o => !o)}
      className={`w-full flex items-center gap-2.5 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl text-sm text-white h-11 px-3 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/60 ${className}`}
    >
      {selected?.image && (
        <img src={selected.image} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />
      )}
      <span className={`flex-1 text-left truncate ${selected ? '' : 'text-gray-600'}`}>
        {selected ? selected.label : (placeholder || label)}
      </span>
      {selected?.subtitle && (
        <span className="text-[10px] text-gray-500 shrink-0 hidden sm:inline">{selected.subtitle}</span>
      )}
      <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )

  const dropdownContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          initial={{ opacity: 0, scaleY: 0.95, transformOrigin: 'top' }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0.95 }}
          transition={{ duration: 0.12 }}
          className="z-50 w-full mt-1.5 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          style={portal ? { position: 'absolute', left: 0, top: '100%' } : {}}
        >
          {search && (
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setFocusIdx(0) }}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto py-1">
            {grouped.length === 1 ? (
              grouped[0].items.map((opt, i) => (
                <OptionItem key={opt.value} opt={opt} idx={i} focusIdx={focusIdx} value={value}
                  onSelect={() => { onChange(opt.value); close() }} />
              ))
            ) : (
              grouped.map(g => (
                <div key={g.group}>
                  {g.group && (
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-900/50">
                      {g.group}
                    </div>
                  )}
                  {g.items.map((opt, i) => (
                    <OptionItem key={opt.value} opt={opt} idx={i} focusIdx={focusIdx} value={value}
                      onSelect={() => { onChange(opt.value); close() }} />
                  ))}
                </div>
              ))
            )}
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Nenhum resultado</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={`${id}-trigger`} className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {triggerContent}
      {portal ? createPortal(dropdownContent, document.body) : dropdownContent}
    </div>
  )
}

function OptionItem({ opt, idx, focusIdx, value, onSelect }: {
  opt: SelectOption; idx: number; focusIdx: number; value: string; onSelect: () => void
}) {
  const isFocused = focusIdx === idx
  const isSelected = value === opt.value

  return (
    <button
      role="option"
      aria-selected={isSelected}
      data-index={idx}
      onMouseEnter={() => {}}
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
        isFocused ? 'bg-white/10' : 'hover:bg-white/5'
      } ${isSelected ? 'text-white font-semibold' : 'text-gray-300'}`}
    >
      {opt.image && (
        <img src={opt.image} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="truncate">{opt.label}</div>
        {opt.subtitle && <div className="text-[10px] text-gray-500 truncate">{opt.subtitle}</div>}
      </div>
      {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
    </button>
  )
}
