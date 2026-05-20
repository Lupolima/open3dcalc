import { Info, AlertCircle } from 'lucide-react'
import { useId } from 'react'

interface InputGroupProps {
  label: string
  value: number | string
  onChange: (value: string) => void
  type?: 'text' | 'number'
  unit?: string
  placeholder?: string
  tooltip?: string
  prefix?: string
  step?: string
  className?: string
  error?: string | null
}

export function InputGroup({
  label, value, onChange, type = 'text', unit, placeholder,
  tooltip, prefix, step, className = '', error,
}: InputGroupProps) {
  const id = useId()

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start gap-2 min-h-[2.5rem]">
        <label htmlFor={id} className={`text-[11px] font-semibold uppercase tracking-wider ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-gray-600 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2.5 bg-gray-900 text-[11px] text-gray-200 rounded-xl border border-white/10 shadow-2xl z-10 leading-relaxed">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {prefix && (
          <span className="text-gray-500 text-[11px] font-mono shrink-0">{prefix}</span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          className={`flex-1 min-w-0 bg-white/[0.04] border rounded-lg text-sm text-white h-9 px-2.5 transition-all placeholder:text-gray-400/70 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/50'
              : 'border-white/10 hover:border-white/20 focus:border-indigo-500/60 focus:ring-indigo-500'
          }`}
        />
        {unit && (
          <span className="text-[11px] font-mono text-gray-500 w-8 shrink-0">{unit}</span>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-red-400 mt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

interface SelectGroupProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: { label: string; value: string; image?: string }[]
}

export function SelectGroup({ label, value, onChange, options }: SelectGroupProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[12px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl text-[0.95rem] text-white min-h-[44px] px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/60 outline-none transition-all appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
