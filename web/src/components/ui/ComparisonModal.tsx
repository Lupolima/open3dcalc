import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import type { HistoryEntry } from '@/types'

interface ComparisonModalProps {
  entryA: HistoryEntry
  entryB: HistoryEntry
  onClose: () => void
}

interface CompareField {
  key: keyof CalculationResultProxy
  labelKey: string
  higherIsBetter: boolean
}

// Helper type to access fields from either result or entry directly
type CalculationResultProxy = {
  totalCost: number
  sellPrice: number
  profit: number
  materialCost: number
  energyCost: number
  machineCost: number
  laborCost: number
  postProcessingCost: number
  marketplaceFee: number
  taxAmount: number
}

const comparisonFields: CompareField[] = [
  // Costs — lower is better
  { key: 'totalCost', labelKey: 'calc.totalCost', higherIsBetter: false },
  { key: 'materialCost', labelKey: 'breakdown.material', higherIsBetter: false },
  { key: 'energyCost', labelKey: 'breakdown.energy', higherIsBetter: false },
  { key: 'machineCost', labelKey: 'breakdown.depreciation', higherIsBetter: false },
  { key: 'laborCost', labelKey: 'breakdown.labor', higherIsBetter: false },
  { key: 'postProcessingCost', labelKey: 'breakdown.finishing', higherIsBetter: false },
  // Fees — lower is better
  { key: 'marketplaceFee', labelKey: 'breakdown.marketplaceFee', higherIsBetter: false },
  { key: 'taxAmount', labelKey: 'breakdown.tax', higherIsBetter: false },
  // Revenue — higher is better
  { key: 'sellPrice', labelKey: 'dashboard.salePrice', higherIsBetter: true },
  { key: 'profit', labelKey: 'dashboard.profit', higherIsBetter: true },
]

function getEntryValue(entry: HistoryEntry, key: keyof CalculationResultProxy): number {
  // These fields exist both on entry and result — prefer result for consistency
  const result = entry.result
  return result[key] as number
}

function getComparisonClass(valueA: number, valueB: number, higherIsBetter: boolean): {
  aClass: string
  bClass: string
  aIcon: React.ReactNode | null
  bIcon: React.ReactNode | null
} {
  const diff = valueA - valueB
  if (Math.abs(diff) < 0.001) {
    return { aClass: '', bClass: '', aIcon: null, bIcon: null }
  }

  // diff > 0 means A > B
  const aIsBetter = higherIsBetter ? diff > 0 : diff < 0

  return {
    aClass: aIsBetter ? 'text-emerald-400' : 'text-red-400',
    bClass: aIsBetter ? 'text-red-400' : 'text-emerald-400',
    aIcon: aIsBetter
      ? <TrendingUp className="w-3.5 h-3.5 inline-block ml-1" />
      : <TrendingDown className="w-3.5 h-3.5 inline-block ml-1" />,
    bIcon: aIsBetter
      ? <TrendingDown className="w-3.5 h-3.5 inline-block ml-1" />
      : <TrendingUp className="w-3.5 h-3.5 inline-block ml-1" />,
  }
}

export function ComparisonModal({ entryA, entryB, onClose }: ComparisonModalProps) {
  const { t } = useTranslation()
  const { format: formatMoney } = useCurrency()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap + ESC close
  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('history.compareTitle')}
    >
      <div
        ref={dialogRef}
        className="glass rounded-2xl p-6 w-[95%] max-w-2xl max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold gradient-text">{t('history.compareTitle')}</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-white flex items-center justify-center p-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors hover:bg-white/5"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry names row */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-[1fr_1fr_1fr] gap-3 mb-4 text-sm">
          <div className="hidden min-[400px]:block text-gray-500 font-medium">{t('history.compareField')}</div>
          <div className="text-indigo-300 font-semibold text-center truncate px-1" title={entryA.name}>
            {entryA.name}
          </div>
          <div className="text-amber-300 font-semibold text-center truncate px-1" title={entryB.name}>
            {entryB.name}
          </div>
        </div>

        {/* Comparison rows */}
        <div className="space-y-1">
          {comparisonFields.map(field => {
            const valueA = getEntryValue(entryA, field.key)
            const valueB = getEntryValue(entryB, field.key)
            const { aClass, bClass, aIcon, bIcon } = getComparisonClass(valueA, valueB, field.higherIsBetter)
            const isEqual = Math.abs(valueA - valueB) < 0.001

            return (
              <div
                key={field.key}
                className="grid grid-cols-1 min-[400px]:grid-cols-[1fr_1fr_1fr] gap-2 min-[400px]:gap-3 py-2.5 px-2 rounded-xl border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors text-sm"
              >
                <div className="text-gray-400 flex items-center font-medium min-[400px]:font-normal">
                  {t(field.labelKey)}
                </div>
                <div className={`flex items-center justify-between min-[400px]:justify-center gap-1 ${aClass || 'text-gray-200'}`}>
                  <span className="text-[10px] min-[400px]:hidden text-indigo-300">{entryA.name}:</span>
                  {formatMoney(valueA)}
                  {aIcon}
                </div>
                <div className={`flex items-center justify-between min-[400px]:justify-center gap-1 ${bClass || 'text-gray-200'}`}>
                  <span className="text-[10px] min-[400px]:hidden text-amber-300">{entryB.name}:</span>
                  {formatMoney(valueB)}
                  {bIcon}
                </div>
                {isEqual && (
                  <div className="col-span-3 flex justify-center mt-0.5">
                    <Minus className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex items-center justify-center gap-6 text-xs text-gray-500 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            {t('history.compareBetter')}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            {t('history.compareWorse')}
          </span>
        </div>
      </div>
    </div>
  )
}
