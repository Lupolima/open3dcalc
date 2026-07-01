import { Zap, RotateCcw } from 'lucide-react'
import { useCalculatorStore } from '@/shared/stores/calculatorStore'

export function QuickStartBanner() {
  const setQuickStart = useCalculatorStore((s) => s.setQuickStart)
  const resetCalculator = useCalculatorStore((s) => s.resetCalculator)

  return (
    <div className="surface rounded-xl p-4 sm:p-5 border border-[var(--color-accent)]/20 bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--color-accent)]" />
            Quer ver como funciona?
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Preencha a calculadora com valores realistas para um exemplo de peça 3D
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetCalculator}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none flex items-center gap-1.5"
            aria-label="Limpar campos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <button
            onClick={setQuickStart}
            className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-md shadow-[var(--color-accent)]/20 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none flex items-center gap-1.5"
            aria-label="Preencher com exemplo"
          >
            <Zap className="w-3.5 h-3.5" />
            Preencher com Exemplo
          </button>
        </div>
      </div>
    </div>
  )
}
