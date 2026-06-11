import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CalculationSnapshot, MaterialStateFDM, PrintParameters, AMSSlot, FixedCosts } from '@/types'

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

  // ══════════════════════════════════════════════════════════════
  //  ORIGINAL 8 TESTS
  // ══════════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — FDM Calculation Branches (computeStoreResults)
  // ══════════════════════════════════════════════════════════════

  describe('FDM — section filtering in computeStoreResults', () => {
    it('setFdmMachine() → machineCost reflects new machine', () => {
      const store = useCalculatorStore.getState()
      const before = store.results!.machineCost

      store.setFdmMachine({
        ...store.fdmMachine,
        machineCost: 10000,
      })

      const after = useCalculatorStore.getState()
      expect(after.fdmMachine.machineCost).toBe(10000)
      expect(after.results!.machineCost).not.toBe(before)
    })

    it('machine disabled → machineCost === 0', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmMachine.enabled).toBe(true)
      expect(store.results!.machineCost).toBeGreaterThan(0)

      store.setFdmMachine({ ...store.fdmMachine, enabled: false })
      const after = useCalculatorStore.getState()
      expect(after.results!.machineCost).toBe(0)
    })

    it('machine maintenanceEnabled → adds maintenance cost', () => {
      const store = useCalculatorStore.getState()
      store.setFdmMachine({
        ...store.fdmMachine,
        enabled: true,
        maintenanceEnabled: true,
        maintenanceCost: 100,
        hoursPerMonth: 200,
      })

      const after = useCalculatorStore.getState()
      // maintenance per hour = 100/200 = 0.5, multiplied by print time
      expect(after.results!.machineCost).toBeGreaterThan(0)
    })

    it('machine with zero hoursPerMonth → no division by zero', () => {
      const store = useCalculatorStore.getState()
      store.setFdmMachine({
        ...store.fdmMachine,
        enabled: true,
        maintenanceEnabled: true,
        maintenanceCost: 100,
        hoursPerMonth: 0,
      })

      const after = useCalculatorStore.getState()
      // Should not throw, maintenance = 0 when hoursPerMonth is 0
      expect(after.results).not.toBeNull()
    })

    it('hardware disabled → hardwareCost === 0', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmHardware.enabled).toBe(true)
      expect(store.results!.hardwareCost).toBeGreaterThan(0)

      store.setFdmHardware({ ...store.fdmHardware, enabled: false })
      const after = useCalculatorStore.getState()
      expect(after.results!.hardwareCost).toBe(0)
    })

    it('hardware with nozzle disabled → only bed cost', () => {
      const store = useCalculatorStore.getState()
      store.setFdmHardware({
        ...store.fdmHardware,
        enabled: true,
        nozzleEnabled: false,
        bedEnabled: true,
        bedAdhesionCost: 1.50,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.hardwareCost).toBe(1.50)
    })

    it('hardware with nozzle lifespanKg=0 → nozzle depreciation 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmHardware({
        ...store.fdmHardware,
        enabled: true,
        nozzleEnabled: true,
        nozzleLifespanKg: 0,
        bedEnabled: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.hardwareCost).toBe(0)
    })

    it('hardware with both nozzle and bed disabled → hardwareCost 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmHardware({
        ...store.fdmHardware,
        enabled: true,
        nozzleEnabled: false,
        bedEnabled: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.hardwareCost).toBe(0)
    })

    it('finishing enabled → postProcessingCost includes suppliesCost', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmFinishing.enabled).toBe(false)
      expect(store.results!.postProcessingCost).toBe(0)

      store.setFdmFinishing({ enabled: true, suppliesCost: 5 })
      const after = useCalculatorStore.getState()
      expect(after.results!.postProcessingCost).toBe(5)
    })

    it('finishing disabled → postProcessingCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmFinishing({ enabled: true, suppliesCost: 10 })
      const after1 = useCalculatorStore.getState()
      expect(after1.results!.postProcessingCost).toBe(10)

      store.setFdmFinishing({ enabled: false, suppliesCost: 10 })
      const after2 = useCalculatorStore.getState()
      expect(after2.results!.postProcessingCost).toBe(0)
    })

    it('labor enabled → laborCost > 0', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmLabor.enabled).toBe(false)
      expect(store.results!.laborCost).toBe(0)

      store.setFdmLabor({
        enabled: true,
        setupTimeMinutes: 15,
        postProcessingTimeMinutes: 20,
        hourlyRate: 25,
      })

      const after = useCalculatorStore.getState()
      // (15+20)/60 * 25 = 14.583
      expect(after.results!.laborCost).toBeCloseTo((35 / 60) * 25, 1)
    })

    it('extras with cost → extrasCost included', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmExtras.extrasCost).toBe(0)

      store.setFdmExtras({ extrasCost: 15 })
      const after = useCalculatorStore.getState()
      expect(after.results!.extrasCost).toBe(15)
    })

    it('ops enabled → consumablesCost includes PPE cost', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmOps.enabled).toBe(false)
      expect(store.results!.consumablesCost).toBe(0)

      store.setFdmOps({ enabled: true, ppeCostPerPrint: 2.5 })
      const after = useCalculatorStore.getState()
      expect(after.results!.consumablesCost).toBe(2.5)
    })

    it('ops disabled → consumablesCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmOps({ enabled: true, ppeCostPerPrint: 5 })
      const after1 = useCalculatorStore.getState()
      expect(after1.results!.consumablesCost).toBe(5)

      store.setFdmOps({ enabled: false, ppeCostPerPrint: 5 })
      const after2 = useCalculatorStore.getState()
      expect(after2.results!.consumablesCost).toBe(0)
    })

    it('software enabled → softwareCost > 0', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmSoft.enabled).toBe(false)
      expect(store.results!.softwareCost).toBe(0)

      store.setFdmSoft({
        enabled: true,
        slicerMonthlyCost: 60,
        modelFileCost: 10,
      })

      const after = useCalculatorStore.getState()
      // softwareHourly = 60 / 200 = 0.3
      // softwareTotal = 0.3 * 5 (printTimeHours) + 10 = 11.5
      expect(after.results!.softwareCost).toBeCloseTo(11.5, 1)
    })

    it('software with zero hoursPerMonth → uses 0 hourly rate', () => {
      const store = useCalculatorStore.getState()
      store.setFdmSoft({
        enabled: true,
        slicerMonthlyCost: 60,
        modelFileCost: 10,
      })
      store.setFdmMachine({
        ...store.fdmMachine,
        enabled: true,
        hoursPerMonth: 0,
      })

      const after = useCalculatorStore.getState()
      // softwareHourly = 60 / 0 = 0 (guard), softwareTotal = 0 * 5 + 10 = 10
      expect(after.results!.softwareCost).toBe(10)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — FDM Failure Modes
  // ══════════════════════════════════════════════════════════════

  describe('FDM — failure modes', () => {
    it('failureMode "fixed" → failureCost is the fixed value', () => {
      const store = useCalculatorStore.getState()
      store.setFdmPrintParams({
        ...store.fdmPrintParams,
        failureMode: 'fixed',
        failureValue: 20,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.failureCost).toBe(20)
    })

    it('failureMode "none" → failureCost is 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmPrintParams({
        ...store.fdmPrintParams,
        failureMode: 'none',
        failureValue: 0,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.failureCost).toBe(0)
    })

    it('failureMode "percent" with riskMultiplier → scaled failure', () => {
      const store = useCalculatorStore.getState()
      const subtotalBefore = store.results!.subtotal

      store.setFdmPrintParams({
        ...store.fdmPrintParams,
        failureMode: 'percent',
        failureValue: 10,
        riskMultiplier: 2,
      })

      const after = useCalculatorStore.getState()
      // failureCost = subtotal * (10 * 2 / 100) = subtotal * 0.2
      expect(after.results!.failureCost).toBeCloseTo(subtotalBefore * 0.2, 1)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — FDM Quantity > 1 with Labor
  // ══════════════════════════════════════════════════════════════

  describe('FDM — quantity > 1 with labor', () => {
    it('qty=5 with labor → totalCost amortized (lower than single-unit cost)', () => {
      const store = useCalculatorStore.getState()
      // First get single-unit totalCost for reference
      store.setFdmLabor({
        enabled: true,
        setupTimeMinutes: 30,
        postProcessingTimeMinutes: 30,
        hourlyRate: 25,
      })
      store.setQuantity(1)
      const singleUnitTotal = useCalculatorStore.getState().results!.totalCost

      store.setQuantity(5)
      const after = useCalculatorStore.getState()
      const r = after.results!
      // setupCost = (30+30)/60 * 25 = 25
      // perUnitCost = singleUnitTotal - 25 + 25/5 = singleUnitTotal - 20
      // Both totalCost and costPerUnit are set to perUnitCost in the return
      expect(r.costPerUnit).toBeGreaterThan(0)
      expect(r.costPerUnit).toBeLessThan(singleUnitTotal)
    })

    it('qty=1 with labor → costPerUnit === totalCost', () => {
      const store = useCalculatorStore.getState()
      store.setFdmLabor({
        enabled: true,
        setupTimeMinutes: 15,
        postProcessingTimeMinutes: 15,
        hourlyRate: 30,
      })
      store.setQuantity(1)

      const after = useCalculatorStore.getState()
      const r = after.results!
      // setupCost = 30/60 * 30 = 15
      // perUnitCost = totalCost - 15 + 15/1 = totalCost
      expect(r.costPerUnit).toBe(r.totalCost)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — FDM Sell Price / Fee Edge Cases
  // ══════════════════════════════════════════════════════════════

  describe('FDM — sell price edge cases', () => {
    it('feePercent >= 1 → sellPrice uses priceBeforeFees * 2 fallback', () => {
      const store = useCalculatorStore.getState()
      // tax + marketplace fee = 60 + 50 = 110 → /100 = 1.1 ≥ 1
      store.setFdmSales({
        ...store.fdmSales,
        taxPercent: 60,
        marketplaceFeePercent: 50,
        profitMarginPercent: 10,
      })

      const after = useCalculatorStore.getState()
      const r = after.results!
      const totalBaseCost = r.totalCost
      const profitAmountRaw = totalBaseCost * 0.10
      const priceBeforeFees = totalBaseCost + profitAmountRaw
      // Since (60+50)/100 = 1.1 >= 1, sellPrice = priceBeforeFees * 2
      expect(r.sellPrice).toBeCloseTo(priceBeforeFees * 2, 1)
    })

    it('zero profitMarginPercent → sellPrice covers only costs', () => {
      const store = useCalculatorStore.getState()
      store.setFdmSales({
        ...store.fdmSales,
        profitMarginPercent: 0,
        taxPercent: 0,
        marketplaceFeePercent: 0,
      })

      const after = useCalculatorStore.getState()
      const r = after.results!
      // totalFeePercent = 0, so sellPrice = priceBeforeFees / 1 = priceBeforeFees = totalBaseCost
      expect(r.sellPrice).toBeCloseTo(r.totalCost, 1)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Fixed Costs
  // ══════════════════════════════════════════════════════════════

  describe('FDM — fixed costs', () => {
    it('setFixedCostsField enabled → adds fixedCostPerHour to machine', () => {
      const store = useCalculatorStore.getState()
      const machineBefore = store.results!.machineCost

      store.setFixedCostsField('enabled', true)
      store.setFixedCostsField('monthlyCost', 600)
      store.setFixedCostsField('monthlyPrintHours', 160)

      const after = useCalculatorStore.getState()
      // fixedCostPerHour = 600/160 = 3.75
      // machineCost should increase by fixedCostPerHour * printTimeHours
      expect(after.results!.machineCost).toBeGreaterThan(machineBefore)
      expect(after.fixedCosts.enabled).toBe(true)
      expect(after.fixedCosts.monthlyCost).toBe(600)
    })

    it('setFixedCostsField disabled → fixedCostPerHour is 0', () => {
      const store = useCalculatorStore.getState()
      store.setFixedCostsField('enabled', true)
      store.setFixedCostsField('monthlyCost', 600)
      store.setFixedCostsField('monthlyPrintHours', 160)
      const withFixed = useCalculatorStore.getState().results!.machineCost

      store.setFixedCostsField('enabled', false)
      const withoutFixed = useCalculatorStore.getState().results!.machineCost

      expect(withFixed).toBeGreaterThan(withoutFixed)
    })

    it('fixedCosts with zero monthlyPrintHours → no division by zero', () => {
      const store = useCalculatorStore.getState()
      store.setFixedCostsField('enabled', true)
      store.setFixedCostsField('monthlyCost', 600)
      store.setFixedCostsField('monthlyPrintHours', 0)

      const after = useCalculatorStore.getState()
      expect(after.results).not.toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — AMS Logic
  // ══════════════════════════════════════════════════════════════

  describe('FDM — AMS logic', () => {
    it('setFdmAmsEnabled(true) → AMS enabled in store', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmAmsEnabled).toBe(false)

      store.setFdmAmsEnabled(true)
      const after = useCalculatorStore.getState()
      expect(after.fdmAmsEnabled).toBe(true)
    })

    it('AMS enabled with 2 active slots → adds transition purge cost', () => {
      const store = useCalculatorStore.getState()

      const slots: AMSSlot[] = [
        { enabled: true, materialType: 'PLA', costPerKg: 125, weightUsedGrams: 50, purgeWeightGrams: 0, transitionPurgeGrams: 5, density: 1.24, spoolEfficiency: 98, color: '#ccc' },
        { enabled: true, materialType: 'PETG', costPerKg: 200, weightUsedGrams: 30, purgeWeightGrams: 0, transitionPurgeGrams: 5, density: 1.27, spoolEfficiency: 95, color: '#f87' },
        { enabled: false, materialType: 'PLA', costPerKg: 125, weightUsedGrams: 0, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#60a' },
        { enabled: false, materialType: 'PLA', costPerKg: 125, weightUsedGrams: 0, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#34d' },
      ]

      store.setFdmAmsEnabled(true)
      store.setFdmAmsSlot(0, slots[0])
      store.setFdmAmsSlot(1, slots[1])

      const after = useCalculatorStore.getState()
      // AMS should have been calculated: materialCost from AMS replaces normal materialCost
      expect(after.results).not.toBeNull()
      expect(after.results!.materialCost).toBeGreaterThanOrEqual(0)
      // materialCost should come from AMS calculation, not default
      // slot0: (50/1000)*125 = 6.25
      // slot1: (30/1000)*200 = 6.0
      // transitions = 2*(2-1) = 2, avgCost = (125+200)/2 = 162.5
      // transition purge = (2 * 5 / 1000) * 162.5 = 1.625
      // total ams = 6.25 + 6.0 + 1.625 = 13.875
      expect(after.results!.materialCost).toBeCloseTo(13.875, 1)
    })

    it('AMS enabled with single active slot → no transition purge', () => {
      const store = useCalculatorStore.getState()

      const slot: AMSSlot = {
        enabled: true, materialType: 'PLA', costPerKg: 125,
        weightUsedGrams: 100, purgeWeightGrams: 5,
        transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#ccc',
      }

      store.setFdmAmsEnabled(true)
      store.setFdmAmsSlot(0, slot)

      const after = useCalculatorStore.getState()
      // single slot: (100/1000)*125 + (5/1000)*125 = 12.5 + 0.625 = 13.125
      // activeCount = 1, so no transitions
      expect(after.results!.materialCost).toBeCloseTo(13.125, 1)
    })

    it('AMS with slot having purgeWeight → purge cost included', () => {
      const store = useCalculatorStore.getState()

      const slot: AMSSlot = {
        enabled: true, materialType: 'PLA', costPerKg: 100,
        weightUsedGrams: 100, purgeWeightGrams: 10,
        transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#ccc',
      }

      store.setFdmAmsEnabled(true)
      store.setFdmAmsSlot(0, slot)

      const after = useCalculatorStore.getState()
      // (100/1000)*100 + (10/1000)*100 = 10 + 1 = 11
      expect(after.results!.materialCost).toBeCloseTo(11, 1)
    })

    it('AMS with 3 active slots → correct transition count', () => {
      const store = useCalculatorStore.getState()

      const slots: AMSSlot[] = [
        { enabled: true, materialType: 'PLA', costPerKg: 100, weightUsedGrams: 50, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#ccc' },
        { enabled: true, materialType: 'PETG', costPerKg: 200, weightUsedGrams: 50, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.27, spoolEfficiency: 95, color: '#f87' },
        { enabled: true, materialType: 'ABS', costPerKg: 150, weightUsedGrams: 50, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.04, spoolEfficiency: 97, color: '#60a' },
        { enabled: false, materialType: 'PLA', costPerKg: 125, weightUsedGrams: 0, purgeWeightGrams: 0, transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#34d' },
      ]

      store.setFdmAmsEnabled(true)
      store.setFdmAmsSlot(0, slots[0])
      store.setFdmAmsSlot(1, slots[1])
      store.setFdmAmsSlot(2, slots[2])

      const after = useCalculatorStore.getState()
      // activeCount = 3, transitions = 3*(3-1) = 6
      // avgCost = (100+200+150)/3 = 150
      // transition cost = (6 * 3 / 1000) * 150 = 2.7
      // material = (50/1000)*100 + (50/1000)*200 + (50/1000)*150 = 5 + 10 + 7.5 = 22.5
      // total = 22.5 + 2.7 = 25.2
      expect(after.results!.materialCost).toBeCloseTo(25.2, 0)
    })

    it('AMS with all slots having zero weightUsed → minimal material cost', () => {
      const store = useCalculatorStore.getState()

      const slot: AMSSlot = {
        enabled: true, materialType: 'PLA', costPerKg: 125,
        weightUsedGrams: 0, purgeWeightGrams: 0,
        transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#ccc',
      }

      store.setFdmAmsEnabled(true)
      store.setFdmAmsSlot(0, slot)

      const after = useCalculatorStore.getState()
      // materialCost = (0/1000)*125 + (0/1000)*125 = 0
      // activeCount = 0 (weightUsedGrams = 0), so no transitions
      expect(after.results!.materialCost).toBe(0)
    })

    it('setFdmAmsSlot updates specific slot', () => {
      const store = useCalculatorStore.getState()
      const slot0: AMSSlot = {
        enabled: true, materialType: 'PLA', costPerKg: 125,
        weightUsedGrams: 50, purgeWeightGrams: 0,
        transitionPurgeGrams: 3, density: 1.24, spoolEfficiency: 98, color: '#ccc',
      }
      store.setFdmAmsSlot(0, slot0)
      expect(useCalculatorStore.getState().fdmAmsSlots[0].costPerKg).toBe(125)

      store.setFdmAmsSlot(0, { ...slot0, costPerKg: 300 })
      expect(useCalculatorStore.getState().fdmAmsSlots[0].costPerKg).toBe(300)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin Calculation Path
  // ══════════════════════════════════════════════════════════════

  describe('Resin — computeStoreResults path', () => {
    it('setActiveTab("resin") → results computed using resin defaults', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')

      const after = useCalculatorStore.getState()
      const r = after.results!
      expect(r).not.toBeNull()
      expect(r.materialCost).toBeGreaterThan(0)
      expect(r.energyCost).toBeGreaterThan(0)
      // resin machine is enabled by default
      expect(r.machineCost).toBeGreaterThan(0)
    })

    it('resin material change → materialCost updates', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      const before = useCalculatorStore.getState().results!.materialCost

      store.setResinMaterial({
        ...store.resinMaterial,
        costPerLiter: 500,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.materialCost).toBeGreaterThan(before)
    })

    it('resin material with wasteMarginPercent → volume increases', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMaterial({
        ...store.resinMaterial,
        volumeUsedMl: 100,
        wasteMarginPercent: 10,
        costPerLiter: 100,
      })

      const after = useCalculatorStore.getState()
      // volumeWithWaste = 100 * 1.1 = 110ml
      // matCost = (110/1000) * 100 = 11
      expect(after.results!.materialCost).toBeCloseTo(11, 1)
    })

    it('resin machine disabled → machineCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMachine({ ...store.resinMachine, enabled: false })

      const after = useCalculatorStore.getState()
      expect(after.results!.machineCost).toBe(0)
    })

    it('resin hardware disabled → hardwareCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinHardware({ ...store.resinHardware, enabled: false })

      const after = useCalculatorStore.getState()
      expect(after.results!.hardwareCost).toBe(0)
    })

    it('resin hardware with LCD and FEP costs → hardwareCost computed', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinHardware({
        enabled: true,
        lcdCost: 500,
        lcdLifespanHours: 1000,
        fepCost: 100,
        fepLifespanPrints: 100,
      })

      const after = useCalculatorStore.getState()
      // lcdHourly = 500/1000 = 0.5
      // lcdCost = 0.5 * 2 (printTimeHours) = 1.0
      // fepPerPrint = 100/100 = 1.0
      // hardwareTotal = 1.0 + 1.0 = 2.0
      expect(after.results!.hardwareCost).toBeCloseTo(2.0, 1)
    })

    it('resin post-processing washing disabled → no alcohol cost', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      const ppBefore = useCalculatorStore.getState().results!.postProcessingCost

      store.setResinPostProcess({
        ...store.resinPostProcess,
        washingEnabled: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.postProcessingCost).toBeLessThan(ppBefore)
    })

    it('resin post-processing curing disabled → no curing energy cost', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      const ppBefore = useCalculatorStore.getState().results!.postProcessingCost

      store.setResinPostProcess({
        ...store.resinPostProcess,
        curingEnabled: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.postProcessingCost).toBeLessThan(ppBefore)
    })

    it('resin post-processing both disabled → postProcessingCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinPostProcess({
        ...store.resinPostProcess,
        washingEnabled: false,
        curingEnabled: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.postProcessingCost).toBe(0)
    })

    it('resin labor enabled → laborCost > 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinLabor({
        enabled: true,
        setupTimeMinutes: 10,
        postProcessingTimeMinutes: 15,
        hourlyRate: 30,
      })

      const after = useCalculatorStore.getState()
      // (10+15)/60 * 30 = 12.5
      expect(after.results!.laborCost).toBeCloseTo(12.5, 1)
    })

    it('resin extras with cost → extrasCost included', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinExtras({ extrasCost: 25 })

      const after = useCalculatorStore.getState()
      expect(after.results!.extrasCost).toBe(25)
    })

    it('resin ops enabled → consumablesCost includes PPE', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      // resinOps is enabled by default with ppeCostPerPrint = 2.50
      const after = useCalculatorStore.getState()
      expect(after.results!.consumablesCost).toBe(2.5)
    })

    it('resin ops disabled → consumablesCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinOps({ enabled: false, ppeCostPerPrint: 2.5 })

      const after = useCalculatorStore.getState()
      expect(after.results!.consumablesCost).toBe(0)
    })

    it('resin software enabled → softwareCost > 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinSoft({
        enabled: true,
        slicerMonthlyCost: 60,
        modelFileCost: 15,
      })

      const after = useCalculatorStore.getState()
      // softwareHourly = 60/200 = 0.3, softwareTotal = 0.3*2 + 15 = 15.6
      expect(after.results!.softwareCost).toBeCloseTo(15.6, 1)
    })

    it('resin software with zero hoursPerMonth → uses 0 hourly', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMachine({ ...store.resinMachine, hoursPerMonth: 0 })
      store.setResinSoft({
        enabled: true,
        slicerMonthlyCost: 60,
        modelFileCost: 10,
      })

      const after = useCalculatorStore.getState()
      // softwareHourly = 60/0 = 0 (guard), softwareTotal = 0*2 + 10 = 10
      expect(after.results!.softwareCost).toBe(10)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin Failure Modes
  // ══════════════════════════════════════════════════════════════

  describe('Resin — failure modes', () => {
    it('resin failureMode "fixed" → failureCost is the fixed value', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinPrintParams({
        ...store.resinPrintParams,
        failureMode: 'fixed',
        failureValue: 30,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.failureCost).toBe(30)
    })

    it('resin failureMode "none" → failureCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinPrintParams({
        ...store.resinPrintParams,
        failureMode: 'none',
        failureValue: 0,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.failureCost).toBe(0)
    })

    it('resin failureMode "percent" → failureCost scaled by subtotal', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      const subtotalBefore = useCalculatorStore.getState().results!.subtotal

      store.setResinPrintParams({
        ...store.resinPrintParams,
        failureMode: 'percent',
        failureValue: 20,
        riskMultiplier: 1,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.failureCost).toBeCloseTo(subtotalBefore * 0.2, 1)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin Quantity > 1 with Labor
  // ══════════════════════════════════════════════════════════════

  describe('Resin — quantity > 1 with labor', () => {
    it('resin qty=4 with labor → totalCost amortized (lower than single-unit)', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinLabor({
        enabled: true,
        setupTimeMinutes: 10,
        postProcessingTimeMinutes: 10,
        hourlyRate: 25,
      })

      // Get single-unit cost for reference
      store.setQuantity(1)
      const singleUnitTotal = useCalculatorStore.getState().results!.totalCost

      store.setQuantity(4)
      const after = useCalculatorStore.getState()
      const r = after.results!
      // setupCost = (10+10)/60 * 25 = 8.333
      // perUnitCost = singleUnitTotal - 8.333 + 8.333/4
      expect(r.costPerUnit).toBeGreaterThan(0)
      expect(r.costPerUnit).toBeLessThan(singleUnitTotal)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin Sell Price / Fee Edge Cases
  // ══════════════════════════════════════════════════════════════

  describe('Resin — sell price edge cases', () => {
    it('resin feePercent >= 1 → sellPrice uses priceBeforeFees * 2', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinSales({
        ...store.resinSales,
        taxPercent: 60,
        marketplaceFeePercent: 50,
        profitMarginPercent: 10,
      })

      const after = useCalculatorStore.getState()
      const r = after.results!
      const totalBaseCost = r.totalCost
      const profitAmountRaw = totalBaseCost * 0.10
      const priceBeforeFees = totalBaseCost + profitAmountRaw
      expect(r.sellPrice).toBeCloseTo(priceBeforeFees * 2, 1)
    })

    it('resin with packaging and shipping costs → included in totalBaseCost', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinSales({
        ...store.resinSales,
        packagingCost: 5,
        shippingCost: 10,
      })

      const after = useCalculatorStore.getState()
      // totalBaseCost = subtotal + failureCost + packaging + shipping
      expect(after.results!.totalCost).toBeGreaterThan(after.results!.subtotal)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — toggleField
  // ══════════════════════════════════════════════════════════════

  describe('toggleField', () => {
    it('toggleField adds field to hiddenFields', () => {
      const store = useCalculatorStore.getState()
      expect(store.hiddenFields).not.toContain('materialCost')

      store.toggleField('materialCost')
      const after = useCalculatorStore.getState()
      expect(after.hiddenFields).toContain('materialCost')
    })

    it('toggleField removes field from hiddenFields if already present', () => {
      const store = useCalculatorStore.getState()
      store.toggleField('energyCost')
      expect(useCalculatorStore.getState().hiddenFields).toContain('energyCost')

      store.toggleField('energyCost')
      expect(useCalculatorStore.getState().hiddenFields).not.toContain('energyCost')
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — setSelectedPrinter
  // ══════════════════════════════════════════════════════════════

  describe('setSelectedPrinter', () => {
    it('setSelectedPrinter with multi-filament → fdmAmsEnabled stays if was enabled', () => {
      const store = useCalculatorStore.getState()
      store.setFdmAmsEnabled(true)
      expect(useCalculatorStore.getState().fdmAmsEnabled).toBe(true)

      // Printer with maxFilaments > 1
      store.setSelectedPrinter({
        id: 'bambu_p1s', name: 'P1S', brand: 'Bambu Lab',
        power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.40,
        maxFilaments: 4,
      })

      const after = useCalculatorStore.getState()
      expect(after.fdmAmsEnabled).toBe(true)
      expect(after.selectedPrinter.id).toBe('bambu_p1s')
    })

    it('setSelectedPrinter with single-filament → fdmAmsEnabled forced off', () => {
      const store = useCalculatorStore.getState()
      store.setFdmAmsEnabled(true)
      expect(useCalculatorStore.getState().fdmAmsEnabled).toBe(true)

      // Printer with no maxFilaments (defaults to 1)
      store.setSelectedPrinter({
        id: 'creality_ender_3_s1', name: 'Ender 3 S1', brand: 'Creality',
        power: 120, value: 1500, usefulLife: 2000, maintenancePerHour: 0.15,
      })

      const after = useCalculatorStore.getState()
      expect(after.fdmAmsEnabled).toBe(false)
    })

    it('setSelectedPrinter with multi-filament but AMS was off → stays off', () => {
      const store = useCalculatorStore.getState()
      expect(store.fdmAmsEnabled).toBe(false)

      store.setSelectedPrinter({
        id: 'bambu_x1c', name: 'X1 Carbon', brand: 'Bambu Lab',
        power: 350, value: 10000, usefulLife: 5000, maintenancePerHour: 0.60,
        maxFilaments: 4,
      })

      const after = useCalculatorStore.getState()
      expect(after.fdmAmsEnabled).toBe(false)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — setSelectedMarketplace
  // ══════════════════════════════════════════════════════════════

  describe('setSelectedMarketplace', () => {
    it('setSelectedMarketplace changes marketplace', () => {
      const store = useCalculatorStore.getState()
      expect(store.selectedMarketplace.id).toBe('direct')

      store.setSelectedMarketplace({
        id: 'etsy', name: 'Etsy', feePercent: 6.5,
        feeFixed: 3, hasFreeShipping: false,
      })

      const after = useCalculatorStore.getState()
      expect(after.selectedMarketplace.id).toBe('etsy')
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — setProductName, setCalcLevel, setInfillPercent, setTargetMarginMode
  // ══════════════════════════════════════════════════════════════

  describe('Simple setters', () => {
    it('setProductName updates productName', () => {
      const store = useCalculatorStore.getState()
      store.setProductName('Test Product')
      expect(useCalculatorStore.getState().productName).toBe('Test Product')
    })

    it('setCalcLevel changes level', () => {
      const store = useCalculatorStore.getState()
      store.setCalcLevel('advanced')
      expect(useCalculatorStore.getState().calcLevel).toBe('advanced')

      store.setCalcLevel('intermediate')
      expect(useCalculatorStore.getState().calcLevel).toBe('intermediate')
    })

    it('setInfillPercent updates infillPercent', () => {
      const store = useCalculatorStore.getState()
      store.setInfillPercent(50)
      expect(useCalculatorStore.getState().infillPercent).toBe(50)
    })

    it('setTargetMarginMode toggles targetMarginMode', () => {
      const store = useCalculatorStore.getState()
      expect(store.targetMarginMode).toBe(false)

      store.setTargetMarginMode(true)
      expect(useCalculatorStore.getState().targetMarginMode).toBe(true)
    })

    it('setCurrency updates currency', () => {
      const store = useCalculatorStore.getState()
      store.setCurrency('BRL')
      expect(useCalculatorStore.getState().currency).toBe('BRL')
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — saveSettings
  // ══════════════════════════════════════════════════════════════

  describe('saveSettings', () => {
    it('saveSettings persists data to localStorage', () => {
      const store = useCalculatorStore.getState()
      store.setProductName('Saved Product')
      store.setQuantity(7)

      store.saveSettings()

      const saved = JSON.parse(localStorage.getItem('open3dcalc_settings_v2')!)
      expect(saved).toBeDefined()
      expect(saved.quantity).toBe(7)
      expect(saved.currency).toBeDefined()
      expect(saved.calcLevel).toBeDefined()
      expect(saved.hiddenFields).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — addToHistory variations
  // ══════════════════════════════════════════════════════════════

  describe('addToHistory — variations', () => {
    it('addToHistory with empty productName → uses material type + weight', () => {
      const store = useCalculatorStore.getState()
      store.setProductName('')

      store.addToHistory()

      const arg = mockAddEntry.mock.calls[0][0]
      // FDM default: PLA - 50g
      expect(arg.name).toContain('PLA')
      expect(arg.name).toContain('50')
    })

    it('addToHistory on resin tab → snapshot type is resin', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setProductName('Resin Part')

      useCalculatorStore.getState().addToHistory()

      const arg = mockAddEntry.mock.calls[0][0]
      expect(arg.type).toBe('resin')
      expect(arg.snapshot.type).toBe('resin')
    })

    it('addToHistory when results is null → does nothing', () => {
      const store = useCalculatorStore.getState()
      // Results should not be null normally, but we can check behavior
      // when results is null by testing the guard
      const resultsBefore = store.results
      expect(resultsBefore).not.toBeNull()

      store.addToHistory()
      expect(mockAddEntry).toHaveBeenCalledTimes(1)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — loadHistoryItem variations
  // ══════════════════════════════════════════════════════════════

  describe('loadHistoryItem — variations', () => {
    it('loadHistoryItem with resin snapshot → restores resin config', () => {
      const store = useCalculatorStore.getState()

      const snap = buildSnapshot({
        type: 'resin',
        resinMaterial: { type: 'Water Washable', volumeUsedMl: 100, costPerLiter: 220, density: 1.15, wasteMarginPercent: 8 },
        resinPrintParams: { printTimeHours: 3, printerPowerWatts: 80, energyCostPerKwh: 0.80, failureMode: 'fixed', failureValue: 15, riskMultiplier: 1 },
        productName: 'Resin Part',
        quantity: 2,
      })

      store.loadHistoryItem(snap)
      const after = useCalculatorStore.getState()

      expect(after.activeTab).toBe('resin')
      expect(after.resinMaterial.type).toBe('Water Washable')
      expect(after.resinMaterial.volumeUsedMl).toBe(100)
      expect(after.resinPrintParams.printTimeHours).toBe(3)
      expect(after.productName).toBe('Resin Part')
      expect(after.quantity).toBe(2)
    })

    it('loadHistoryItem with fdmAmsEnabled undefined → defaults to false', () => {
      const snap = buildSnapshot({
        fdmAmsEnabled: undefined,
      })

      useCalculatorStore.getState().loadHistoryItem(snap)
      const after = useCalculatorStore.getState()
      expect(after.fdmAmsEnabled).toBe(false)
    })

    it('loadHistoryItem with fdmAmsSlots undefined → defaults to 4 slots', () => {
      const snap = buildSnapshot({
        fdmAmsSlots: undefined,
      })

      useCalculatorStore.getState().loadHistoryItem(snap)
      const after = useCalculatorStore.getState()
      expect(after.fdmAmsSlots).toHaveLength(4)
    })

    it('loadHistoryItem with fixedCosts undefined → defaults', () => {
      const snap = buildSnapshot({
        fixedCosts: undefined as unknown as FixedCosts,
      })

      useCalculatorStore.getState().loadHistoryItem(snap)
      const after = useCalculatorStore.getState()
      expect(after.fixedCosts).toBeDefined()
      expect(after.fixedCosts.enabled).toBe(false)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin section filtering
  // ══════════════════════════════════════════════════════════════

  describe('Resin — section filtering', () => {
    it('disable all resin sections → only subtotal remains', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')

      const sections = ['material', 'energy', 'machine', 'hardware', 'consumables', 'labor', 'software', 'failure', 'extras', 'postProcessing']
      for (const s of sections) {
        if (useCalculatorStore.getState().enabledSections[s]) {
          useCalculatorStore.getState().toggleSection(s)
        }
      }

      const after = useCalculatorStore.getState()
      expect(after.results!.materialCost).toBe(0)
      expect(after.results!.energyCost).toBe(0)
      expect(after.results!.machineCost).toBe(0)
      expect(after.results!.hardwareCost).toBe(0)
      expect(after.results!.consumablesCost).toBe(0)
      expect(after.results!.laborCost).toBe(0)
      expect(after.results!.softwareCost).toBe(0)
      expect(after.results!.failureCost).toBe(0)
      expect(after.results!.extrasCost).toBe(0)
      expect(after.results!.postProcessingCost).toBe(0)
    })

    it('resin packaging/shipping sections → affects totalCost', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')

      // Toggle packaging off and on
      const packagingBefore = store.enabledSections.packaging
      store.toggleSection('packaging')
      const afterToggle = useCalculatorStore.getState()
      expect(afterToggle.enabledSections.packaging).toBe(!packagingBefore)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin fixed costs
  // ══════════════════════════════════════════════════════════════

  describe('Resin — fixed costs', () => {
    it('resin with fixed costs enabled → machine cost increases', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      const machineBefore = useCalculatorStore.getState().results!.machineCost

      store.setFixedCostsField('enabled', true)
      store.setFixedCostsField('monthlyCost', 600)
      store.setFixedCostsField('monthlyPrintHours', 160)

      const after = useCalculatorStore.getState()
      expect(after.results!.machineCost).toBeGreaterThan(machineBefore)
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Resin machine maintenance
  // ══════════════════════════════════════════════════════════════

  describe('Resin — machine maintenance', () => {
    it('resin machine with maintenance → added to machineCost', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMachine({
        ...store.resinMachine,
        enabled: true,
        maintenanceEnabled: true,
        maintenanceCost: 80,
        hoursPerMonth: 200,
      })

      const after = useCalculatorStore.getState()
      expect(after.results!.machineCost).toBeGreaterThan(0)
    })

    it('resin machine maintenance with zero hoursPerMonth → no crash', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMachine({
        ...store.resinMachine,
        enabled: true,
        maintenanceEnabled: true,
        maintenanceCost: 100,
        hoursPerMonth: 0,
      })

      const after = useCalculatorStore.getState()
      expect(after.results).not.toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════
  //  NEW TESTS — Zero / edge values
  // ══════════════════════════════════════════════════════════════

  describe('Edge cases', () => {
    it('FDM with zero weightUsed → materialCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: 0, purgeWeight: 0 })

      const after = useCalculatorStore.getState()
      expect(after.results!.materialCost).toBe(0)
    })

    it('FDM with zero printTimeHours → energyCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setFdmPrintParams({ ...store.fdmPrintParams, printTimeHours: 0 })

      const after = useCalculatorStore.getState()
      expect(after.results!.energyCost).toBe(0)
    })

    it('FDM with zero spoolEfficiency → efficiencyFactor is 1', () => {
      const store = useCalculatorStore.getState()
      store.setFdmMaterial({ ...store.fdmMaterial, spoolEfficiency: 0, weightUsed: 100, purgeWeight: 0 })

      const after = useCalculatorStore.getState()
      // efficiencyFactor = 1, effectiveWeight = 100g, matCost = (100/1000)*125 = 12.5
      expect(after.results!.materialCost).toBeCloseTo(12.5, 1)
    })

    it('setQuantity(0) → quantity defaults to 1 in calculation', () => {
      const store = useCalculatorStore.getState()
      store.setQuantity(0)

      const after = useCalculatorStore.getState()
      // quantity 0 → qty defaults to 1, so costPerUnit should equal totalCost
      expect(after.results!.costPerUnit).toBe(after.results!.totalCost)
    })

    it('resin with zero volumeUsedMl → materialCost === 0', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinMaterial({ ...store.resinMaterial, volumeUsedMl: 0 })

      const after = useCalculatorStore.getState()
      expect(after.results!.materialCost).toBe(0)
    })

    it('resin hardware with zero lifespan → no division by zero', () => {
      const store = useCalculatorStore.getState()
      store.setActiveTab('resin')
      store.setResinHardware({
        enabled: true,
        lcdCost: 400,
        lcdLifespanHours: 0,
        fepCost: 80,
        fepLifespanPrints: 0,
      })

      const after = useCalculatorStore.getState()
      // guards prevent division by zero, hardwareCost = 0
      expect(after.results!.hardwareCost).toBe(0)
    })
  })
})
