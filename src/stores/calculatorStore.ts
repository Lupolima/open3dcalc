import { create } from 'zustand'
import type {
  MaterialStateFDM, MaterialStateResin, PrintParameters,
  MachineCosts, LaborCosts, AdditionalCosts, SalesParameters,
  OperationalCosts, SoftwareCosts, FDMHardware, FDMFinishing,
  PostProcessingResin, ResinHardware, CalculationResult,
} from '@/types'
import { marketplaces } from '@/lib/marketplace'
import { printers } from '@/lib/printers'
import { useCatalogStore } from '@/stores/catalogStore'

type Marketplace = (typeof marketplaces)[number]
type PrinterProfile = (typeof printers)[number]

const DEFAULT_FDM_MATERIAL: MaterialStateFDM = { type: 'PLA', weightUsed: 50, purgeWeight: 0, costPerKg: 125, density: 1.24, spoolEfficiency: 98 }
const DEFAULT_FDM_PARAMS: PrintParameters = { printTimeHours: 5, printerPowerWatts: 250, energyCostPerKwh: 0.80, failureMode: 'percent', failureValue: 10, riskMultiplier: 1 }
const DEFAULT_FDM_MACHINE: MachineCosts = { enabled: true, machineCost: 3000, depreciationMonths: 36, hoursPerMonth: 200, maintenanceEnabled: false, maintenanceCost: 0 }
const DEFAULT_FDM_HARDWARE: FDMHardware = { enabled: true, nozzleEnabled: true, nozzleCost: 25, nozzleLifespanKg: 5, bedEnabled: true, bedAdhesionCost: 0.20 }
const DEFAULT_FDM_FINISHING: FDMFinishing = { enabled: false, suppliesCost: 5 }
const DEFAULT_LABOR: LaborCosts = { enabled: false, setupTimeMinutes: 15, postProcessingTimeMinutes: 20, hourlyRate: 25 }
const DEFAULT_EXTRAS: AdditionalCosts = { extrasCost: 0 }
const DEFAULT_OPS: OperationalCosts = { enabled: false, ppeCostPerPrint: 0 }
const DEFAULT_SOFT: SoftwareCosts = { enabled: false, slicerMonthlyCost: 0, modelFileCost: 0 }
const DEFAULT_SALES: SalesParameters = { packagingCost: 2, shippingCost: 0, taxPercent: 0, marketplaceFeePercent: 0, profitMarginPercent: 50 }

const DEFAULT_RESIN_MATERIAL: MaterialStateResin = { type: 'Standard', volumeUsedMl: 50, costPerLiter: 180, density: 1.10, wasteMarginPercent: 5 }
const DEFAULT_RESIN_PARAMS: PrintParameters = { printTimeHours: 2, printerPowerWatts: 50, energyCostPerKwh: 0.80, failureMode: 'none', failureValue: 0, riskMultiplier: 1 }
const DEFAULT_RESIN_PP: PostProcessingResin = { washingEnabled: true, alcoholCostPerLiter: 25, alcoholVolumeLiters: 0.1, curingEnabled: true, curingTimeMinutes: 10, curingPowerWatts: 36 }
const DEFAULT_RESIN_MACHINE: MachineCosts = { enabled: true, machineCost: 3500, depreciationMonths: 36, hoursPerMonth: 200, maintenanceEnabled: false, maintenanceCost: 0 }
const DEFAULT_RESIN_HARDWARE: ResinHardware = { enabled: true, lcdCost: 400, lcdLifespanHours: 2000, fepCost: 80, fepLifespanPrints: 50 }
const DEFAULT_RESIN_LABOR: LaborCosts = { enabled: false, setupTimeMinutes: 10, postProcessingTimeMinutes: 15, hourlyRate: 25 }
const DEFAULT_RESIN_OPS: OperationalCosts = { enabled: true, ppeCostPerPrint: 2.50 }
const DEFAULT_RESIN_SOFT: SoftwareCosts = { enabled: false, slicerMonthlyCost: 0, modelFileCost: 0 }
const DEFAULT_RESIN_EXTRAS: AdditionalCosts = { extrasCost: 0 }
const DEFAULT_RESIN_SALES: SalesParameters = { packagingCost: 2, shippingCost: 0, taxPercent: 0, marketplaceFeePercent: 0, profitMarginPercent: 50 }

interface SavedCalculation {
  id: string
  timestamp: number
  type: 'fdm' | 'resin'
  summary: string
  totalCost: number
  sellPrice: number
  profit: number
}

interface CalculatorState {
  activeTab: 'fdm' | 'resin'
  setActiveTab: (tab: 'fdm' | 'resin') => void

  fdmMaterial: MaterialStateFDM
  setFdmMaterial: (v: MaterialStateFDM) => void
  fdmPrintParams: PrintParameters
  setFdmPrintParams: (v: PrintParameters) => void
  fdmMachine: MachineCosts
  setFdmMachine: (v: MachineCosts) => void
  fdmHardware: FDMHardware
  setFdmHardware: (v: FDMHardware) => void
  fdmFinishing: FDMFinishing
  setFdmFinishing: (v: FDMFinishing) => void
  fdmLabor: LaborCosts
  setFdmLabor: (v: LaborCosts) => void
  fdmExtras: AdditionalCosts
  setFdmExtras: (v: AdditionalCosts) => void
  fdmSales: SalesParameters
  setFdmSales: (v: SalesParameters) => void
  fdmOps: OperationalCosts
  setFdmOps: (v: OperationalCosts) => void
  fdmSoft: SoftwareCosts
  setFdmSoft: (v: SoftwareCosts) => void

  resinMaterial: MaterialStateResin
  setResinMaterial: (v: MaterialStateResin) => void
  resinPrintParams: PrintParameters
  setResinPrintParams: (v: PrintParameters) => void
  resinPostProcess: PostProcessingResin
  setResinPostProcess: (v: PostProcessingResin) => void
  resinMachine: MachineCosts
  setResinMachine: (v: MachineCosts) => void
  resinHardware: ResinHardware
  setResinHardware: (v: ResinHardware) => void
  resinLabor: LaborCosts
  setResinLabor: (v: LaborCosts) => void
  resinExtras: AdditionalCosts
  setResinExtras: (v: AdditionalCosts) => void
  resinSales: SalesParameters
  setResinSales: (v: SalesParameters) => void
  resinOps: OperationalCosts
  setResinOps: (v: OperationalCosts) => void
  resinSoft: SoftwareCosts
  setResinSoft: (v: SoftwareCosts) => void

  selectedPrinter: PrinterProfile
  setSelectedPrinter: (p: PrinterProfile) => void
  selectedMarketplace: Marketplace
  setSelectedMarketplace: (m: Marketplace) => void

  productName: string
  setProductName: (name: string) => void
  quickMode: boolean
  setQuickMode: (v: boolean) => void
  quantity: number
  setQuantity: (v: number) => void
  infillPercent: number
  setInfillPercent: (v: number) => void
  targetMarginMode: boolean
  setTargetMarginMode: (v: boolean) => void
  enabledSections: Record<string, boolean>
  toggleSection: (section: string) => void
  results: CalculationResult | null
  history: SavedCalculation[]
  addToHistory: () => void
  clearHistory: () => void
  saveSettings: () => void
}

const loadStr = <T,>(key: string, def: T): T => {
  if (typeof window === 'undefined') return def
  try {
    const saved = localStorage.getItem('open3dcalc_settings_v2')
    if (!saved) return def
    const parsed = JSON.parse(saved)
    return parsed[key] !== undefined ? parsed[key] : def
  } catch { return def }
}

const loadHistory = (): SavedCalculation[] => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('open3dcalc_history_v2')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  activeTab: 'fdm',
  setActiveTab: (activeTab) => set({ activeTab }),

  fdmMaterial: { ...DEFAULT_FDM_MATERIAL, ...loadStr('fdmMaterial', {}) },
  setFdmMaterial: (v) => set({ fdmMaterial: v }),
  fdmPrintParams: { ...DEFAULT_FDM_PARAMS, ...loadStr('fdmPrintParams', {}) },
  setFdmPrintParams: (v) => set({ fdmPrintParams: v }),
  fdmMachine: { ...DEFAULT_FDM_MACHINE, ...loadStr('fdmMachine', {}) },
  setFdmMachine: (v) => set({ fdmMachine: v }),
  fdmHardware: { ...DEFAULT_FDM_HARDWARE, ...loadStr('fdmHardware', {}) },
  setFdmHardware: (v) => set({ fdmHardware: v }),
  fdmFinishing: { ...DEFAULT_FDM_FINISHING, ...loadStr('fdmFinishing', {}) },
  setFdmFinishing: (v) => set({ fdmFinishing: v }),
  fdmLabor: { ...DEFAULT_LABOR, ...loadStr('fdmLabor', {}) },
  setFdmLabor: (v) => set({ fdmLabor: v }),
  fdmExtras: { ...DEFAULT_EXTRAS, ...loadStr('fdmExtras', {}) },
  setFdmExtras: (v) => set({ fdmExtras: v }),
  fdmSales: { ...DEFAULT_SALES, ...loadStr('fdmSales', {}) },
  setFdmSales: (v) => set({ fdmSales: v }),
  fdmOps: { ...DEFAULT_OPS, ...loadStr('fdmOps', {}) },
  setFdmOps: (v) => set({ fdmOps: v }),
  fdmSoft: { ...DEFAULT_SOFT, ...loadStr('fdmSoft', {}) },
  setFdmSoft: (v) => set({ fdmSoft: v }),

  resinMaterial: { ...DEFAULT_RESIN_MATERIAL, ...loadStr('resinMaterial', {}) },
  setResinMaterial: (v) => set({ resinMaterial: v }),
  resinPrintParams: { ...DEFAULT_RESIN_PARAMS, ...loadStr('resinPrintParams', {}) },
  setResinPrintParams: (v) => set({ resinPrintParams: v }),
  resinPostProcess: { ...DEFAULT_RESIN_PP, ...loadStr('resinPostProcess', {}) },
  setResinPostProcess: (v) => set({ resinPostProcess: v }),
  resinMachine: { ...DEFAULT_RESIN_MACHINE, ...loadStr('resinMachine', {}) },
  setResinMachine: (v) => set({ resinMachine: v }),
  resinHardware: { ...DEFAULT_RESIN_HARDWARE, ...loadStr('resinHardware', {}) },
  setResinHardware: (v) => set({ resinHardware: v }),
  resinLabor: { ...DEFAULT_RESIN_LABOR, ...loadStr('resinLabor', {}) },
  setResinLabor: (v) => set({ resinLabor: v }),
  resinExtras: { ...DEFAULT_RESIN_EXTRAS, ...loadStr('resinExtras', {}) },
  setResinExtras: (v) => set({ resinExtras: v }),
  resinSales: { ...DEFAULT_RESIN_SALES, ...loadStr('resinSales', {}) },
  setResinSales: (v) => set({ resinSales: v }),
  resinOps: { ...DEFAULT_RESIN_OPS, ...loadStr('resinOps', {}) },
  setResinOps: (v) => set({ resinOps: v }),
  resinSoft: { ...DEFAULT_RESIN_SOFT, ...loadStr('resinSoft', {}) },
  setResinSoft: (v) => set({ resinSoft: v }),

  selectedPrinter: printers[0],
  setSelectedPrinter: (selectedPrinter) => set({ selectedPrinter }),
  selectedMarketplace: marketplaces[0],
  setSelectedMarketplace: (selectedMarketplace) => set({ selectedMarketplace }),

  productName: '',
  setProductName: (productName) => set({ productName }),
  quickMode: false,
  setQuickMode: (quickMode) => set({ quickMode }),
  quantity: loadStr('quantity', 1),
  setQuantity: (quantity) => set({ quantity }),
  infillPercent: loadStr('infillPercent', 20),
  setInfillPercent: (infillPercent) => set({ infillPercent }),
  targetMarginMode: false,
  setTargetMarginMode: (targetMarginMode) => set({ targetMarginMode }),
  enabledSections: loadStr('enabledSections', {
    material: true, energy: true, machine: true, hardware: true,
    consumables: true, labor: true, software: true, failure: true,
    extras: true, postProcessing: true, packaging: true, shipping: true,
  }),
  toggleSection: (section) => {
    const s = get()
    const next = { ...s.enabledSections, [section]: !s.enabledSections[section] }
    localStorage.setItem('open3dcalc_sections', JSON.stringify(next))
    set({ enabledSections: next })
  },

  results: null,
  history: loadHistory(),

  addToHistory: () => {
    const s = get()
    const r = s.results
    if (!r) return
    const summary = s.productName.trim() || (s.activeTab === 'fdm'
      ? `${s.fdmMaterial.type} - ${s.fdmMaterial.weightUsed}g`
      : `${s.resinMaterial.type} - ${s.resinMaterial.volumeUsedMl}ml`)
    const item: SavedCalculation = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: s.activeTab,
      summary,
      totalCost: r.totalCost,
      sellPrice: r.sellPrice,
      profit: r.profit,
    }
    const newHistory = [item, ...s.history].slice(0, 20)
    localStorage.setItem('open3dcalc_history_v2', JSON.stringify(newHistory))
    set({ history: newHistory })
  },

  clearHistory: () => {
    localStorage.removeItem('open3dcalc_history_v2')
    set({ history: [] })
  },

  saveSettings: () => {
    const s = get()
    const data = {
      fdmMaterial: s.fdmMaterial, fdmPrintParams: s.fdmPrintParams,
      fdmMachine: s.fdmMachine, fdmHardware: s.fdmHardware, fdmFinishing: s.fdmFinishing,
      fdmLabor: s.fdmLabor, fdmExtras: s.fdmExtras, fdmSales: s.fdmSales,
      fdmOps: s.fdmOps, fdmSoft: s.fdmSoft,
      resinMaterial: s.resinMaterial, resinPrintParams: s.resinPrintParams,
      resinPostProcess: s.resinPostProcess, resinMachine: s.resinMachine,
      resinHardware: s.resinHardware, resinLabor: s.resinLabor,
      resinExtras: s.resinExtras, resinSales: s.resinSales,
      resinOps: s.resinOps, resinSoft: s.resinSoft,
      quantity: s.quantity, infillPercent: s.infillPercent,
    }
    localStorage.setItem('open3dcalc_settings_v2', JSON.stringify(data))
  },
}))

// Sync default selections with catalog overrides when available.
if (typeof window !== 'undefined') {
  const catalog = useCatalogStore.getState()
  const state = useCalculatorStore.getState()
  const printer = catalog.printers.find(p => p.id === state.selectedPrinter.id)
  if (printer) useCalculatorStore.setState({ selectedPrinter: printer as PrinterProfile })
}
