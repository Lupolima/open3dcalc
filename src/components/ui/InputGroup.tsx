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
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className={`text-[11px] font-medium ${error ? 'text-red-400' : 'text-gray-400'}`}>{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-[11px] text-gray-200 rounded-lg border border-white/10 shadow-xl z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          className={`w-full bg-white/5 border rounded-xl text-sm text-white h-11 px-3 focus:ring-2 outline-none transition-all placeholder:text-gray-400 ${
            prefix ? 'pl-9' : ''
          } ${unit ? 'pr-12' : ''} ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
          }`}
        />
        {unit && (
          <span className="absolute right-3 text-gray-400 text-sm pointer-events-none">{unit}</span>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-red-400 mt-0.5">
          <AlertCircle className="w-3 h-3" />
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
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-medium text-gray-400">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white h-11 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
