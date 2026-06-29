import type { CalculationSnapshot } from '@/shared/types'

import { useCalculatorStore } from '../calculatorStore'
export { useCalculatorStore }

/** Snapshot of the initial store state (data + actions) at module load */
export const initialState = useCalculatorStore.getState()

// ── Helpers ────────────────────────────────────────────────────────

/** Build a complete CalculationSnapshot from the current store defaults + overrides */
export function buildSnapshot(overrides: Partial<CalculationSnapshot> = {}): CalculationSnapshot {
  const s = useCalculatorStore.getState()
  return {
    id: 'snap_test_' + Date.now(),
    timestamp: Date.now(),
    type: 'fdm',
    summary: '',
    fdmAmsEnabled: false,
    fdmAmsSlots: [],
    fixedCosts: { enabled: false, monthlyCost: 0, monthlyPrintHours: 0 },
    fdmMaterial: s.fdmMaterial,
    fdmPrintParams: s.fdmPrintParams,
    fdmMachine: s.fdmMachine,
    fdmHardware: s.fdmHardware,
    fdmFinishing: s.fdmFinishing,
    fdmLabor: s.fdmLabor,
    fdmExtras: s.fdmExtras,
    fdmSales: s.fdmSales,
    fdmOps: s.fdmOps,
    fdmSoft: s.fdmSoft,
    resinMaterial: s.resinMaterial,
    resinPrintParams: s.resinPrintParams,
    resinPostProcess: s.resinPostProcess,
    resinMachine: s.resinMachine,
    resinHardware: s.resinHardware,
    resinLabor: s.resinLabor,
    resinExtras: s.resinExtras,
    resinSales: s.resinSales,
    resinOps: s.resinOps,
    resinSoft: s.resinSoft,
    selectedPrinterId: s.selectedPrinter.id,
    selectedMarketplaceId: s.selectedMarketplace.id,
    productName: '',
    quantity: 1,
    infillPercent: 20,
    targetMarginMode: false,
    enabledSections: { ...s.enabledSections },
    results: null,
    ...overrides,
  }
}
