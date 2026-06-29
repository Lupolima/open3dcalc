import { useCalculatorStore } from '@/stores/calculatorStore'

export function useActiveMaterial() {
  const activeTab = useCalculatorStore(s => s.activeTab)
  const isFDM = activeTab === 'fdm'
  return { isFDM, activeTab }
}

export function useFDMStore() {
  const store = useCalculatorStore()
  return {
    material: store.fdmMaterial,
    printParams: store.fdmPrintParams,
    machine: store.fdmMachine,
    hardware: store.fdmHardware,
    finishing: store.fdmFinishing,
    labor: store.fdmLabor,
    extras: store.fdmExtras,
    sales: store.fdmSales,
    ops: store.fdmOps,
    soft: store.fdmSoft,
  }
}

export function useResinStore() {
  const store = useCalculatorStore()
  return {
    material: store.resinMaterial,
    printParams: store.resinPrintParams,
    postProcess: store.resinPostProcess,
    machine: store.resinMachine,
    hardware: store.resinHardware,
    labor: store.resinLabor,
    extras: store.resinExtras,
    sales: store.resinSales,
    ops: store.resinOps,
    soft: store.resinSoft,
  }
}

export function useSectionStore() {
  const activeTab = useCalculatorStore(s => s.activeTab)
  const isFDM = activeTab === 'fdm'
  const fdm = useFDMStore()
  const resin = useResinStore()
  return { isFDM, activeTab, fdm, resin }
}
