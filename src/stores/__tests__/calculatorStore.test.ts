import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CalculationSnapshot, MaterialStateFDM, PrintParameters } from '@/types'

// ── Hoisted mocks (executed by vitest BEFORE imports) ──────────────
const { mockAddEntry } = vi.hoisted(() => ({
  mockAddEntry: vi.fn(),
}))

vi.mock('@/stores/historyStore', () => ({
  useHistoryStore: {
    getState: () => ({ addEntry: mockAddEntry }),
    setState: () => {},
    subscribe: () => () => {},
    destroy: () => {},
  },
}))

vi.mock('@/stores/catalogStore', () => ({
  useCatalogStore: {
    getState: () => ({ printers: [] }),
  },
}))

import { useCalculatorStore } from '../calculatorStore'

/** Snapshot of the initial store state (data + actions) at module load */
const initialState = useCalculatorStore.getState()

// ── Helpers ────────────────────────────────────────────────────────

/** Build a complete CalculationSnapshot from the current store defaults + overrides */
function buildSnapshot(overrides: Partial<CalculationSnapshot> = {}): CalculationSnapshot {
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

describe('useCalculatorStore (integration)', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    localStorage.clear()
    useCalculatorStore.setState(initialState, true)
    mockAddEntry.mockClear()
  })

  // ── 1. toggleSection ─────────────────────────────────────────
  it('toggleSection("energy") → results.energyCost === 0', () => {
    const store = useCalculatorStore.getState()
    expect(store.enabledSections.energy).toBe(true)
    const energyBefore = store.results!.energyCost
    expect(energyBefore).toBeGreaterThan(0)

    store.toggleSection('energy')
    const after = useCalculatorStore.getState()

    expect(after.enabledSections.energy).toBe(false)
    expect(after.results!.energyCost).toBe(0)
  })

  // ── 2. setFdmMaterial ────────────────────────────────────────
  it('setFdmMaterial() → recalcula com material mais caro', () => {
    const store = useCalculatorStore.getState()
    const originalCost = store.results!.materialCost

    const novoMaterial: MaterialStateFDM = {
      ...store.fdmMaterial,
      costPerKg: 999,
    }
    store.setFdmMaterial(novoMaterial)

    const after = useCalculatorStore.getState()
    expect(after.fdmMaterial.costPerKg).toBe(999)
    expect(after.results!.materialCost).toBeGreaterThan(originalCost)
  })

  // ── 3. setQuantity ───────────────────────────────────────────
  it('setQuantity(3) → results.costPerUnit é populado', () => {
    const store = useCalculatorStore.getState()
    expect(store.quantity).toBe(1)

    store.setQuantity(3)
    const after = useCalculatorStore.getState()

    expect(after.quantity).toBe(3)
    // Com labor desabilitado, setupCost = 0, então perUnitCost == totalCost
    expect(after.results!.costPerUnit).toBeGreaterThan(0)
    expect(after.results!.costPerUnit).toBe(after.results!.totalCost)
  })

  // ── 4. loadHistoryItem ────────────────────────────────────────
  it('loadHistoryItem() restaura valores do snapshot', () => {
    const store = useCalculatorStore.getState()

    const snap = buildSnapshot({
      type: 'fdm',
      fdmMaterial: { type: 'PETG', weightUsed: 200, purgeWeight: 10, costPerKg: 150, density: 1.27, spoolEfficiency: 95 },
      fdmPrintParams: { printTimeHours: 8, printerPowerWatts: 300, energyCostPerKwh: 1.20, failureMode: 'percent', failureValue: 15, riskMultiplier: 1.5 },
      fdmMachine: { enabled: true, machineCost: 5000, depreciationMonths: 48, hoursPerMonth: 160, maintenanceEnabled: true, maintenanceCost: 80 },
      productName: 'Loaded Part',
      quantity: 2,
      infillPercent: 35,
      targetMarginMode: true,
      enabledSections: { ...store.enabledSections, energy: false },
    })

    store.loadHistoryItem(snap)
    const after = useCalculatorStore.getState()

    expect(after.productName).toBe('Loaded Part')
    expect(after.fdmMaterial.type).toBe('PETG')
    expect(after.fdmMaterial.weightUsed).toBe(200)
    expect(after.fdmPrintParams.printTimeHours).toBe(8)
    expect(after.fdmMachine.enabled).toBe(true)
    expect(after.quantity).toBe(2)
    expect(after.infillPercent).toBe(35)
    expect(after.targetMarginMode).toBe(true)
    expect(after.enabledSections.energy).toBe(false)
  })

  // ── 5. setActiveTab ───────────────────────────────────────────
  it('setActiveTab("resin") → activeTab muda para resin', () => {
    const store = useCalculatorStore.getState()
    expect(store.activeTab).toBe('fdm')

    store.setActiveTab('resin')
    const after = useCalculatorStore.getState()

    expect(after.activeTab).toBe('resin')
    expect(after.results).not.toBeNull()
  })

  // ── 6. toggleSection múltiplas ────────────────────────────────
  it('desabilitar múltiplas seções → custos individuais zeram (subtotal preservado)', () => {
    const store = useCalculatorStore.getState()
    expect(store.results!.materialCost).toBeGreaterThan(0)
    expect(store.results!.energyCost).toBeGreaterThan(0)
    // subtotal do calculator não é filtrado → permanece o mesmo
    const subtotalBefore = store.results!.subtotal

    store.toggleSection('material')
    store.toggleSection('energy')
    store.toggleSection('machine')
    store.toggleSection('hardware')

    const after = useCalculatorStore.getState()
    expect(after.results!.materialCost).toBe(0)
    expect(after.results!.energyCost).toBe(0)
    expect(after.results!.machineCost).toBe(0)
    expect(after.results!.hardwareCost).toBe(0)
    // subtotal (do calculator) não é afetado pelo toggle
    expect(after.results!.subtotal).toBe(subtotalBefore)
  })

  // ── 7. setFdmPrintParams ─────────────────────────────────────
  it('setFdmPrintParams() dobra horas → energyCost dobra', () => {
    const store = useCalculatorStore.getState()
    const originalEnergy = store.results!.energyCost

    const novosParams: PrintParameters = {
      ...store.fdmPrintParams,
      printTimeHours: store.fdmPrintParams.printTimeHours * 2,
    }
    store.setFdmPrintParams(novosParams)

    const after = useCalculatorStore.getState()
    expect(after.fdmPrintParams.printTimeHours).toBe(store.fdmPrintParams.printTimeHours * 2)
    // Com energia habilitada, energyCost escala linearmente com as horas
    expect(after.results!.energyCost).toBeCloseTo(originalEnergy * 2, 1)
  })

  // ── 8. addToHistory ───────────────────────────────────────────
  it('addToHistory() delega para historyStore.addEntry com snapshot', () => {
    const store = useCalculatorStore.getState()
    store.setProductName('My Awesome Part')

    store.addToHistory()

    expect(mockAddEntry).toHaveBeenCalledTimes(1)
    const arg = mockAddEntry.mock.calls[0][0]
    expect(arg).toMatchObject({
      type: 'fdm',
      name: 'My Awesome Part',
    })
    expect(arg.id).toBeDefined()
    expect(arg.timestamp).toBeGreaterThan(0)
    expect(arg.totalCost).toBeGreaterThan(0)
    expect(arg.snapshot).toBeDefined()
    expect(arg.snapshot.productName).toBe('My Awesome Part')
  })
})
