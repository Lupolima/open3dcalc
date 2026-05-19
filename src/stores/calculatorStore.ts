import { create } from 'zustand'
import type { CalculationInputs, CalculationResult, Material, PrinterProfile, Marketplace } from '@/types'
import { calculateCosts, createDefaultInputs } from '@/lib/calculator'

interface CalculatorState {
  inputs: CalculationInputs
  result: CalculationResult | null
  setInput: <K extends keyof CalculationInputs>(key: K, value: CalculationInputs[K]) => void
  setMaterial: (material: Material) => void
  setPrinter: (printer: PrinterProfile) => void
  setMarketplace: (marketplace: Marketplace) => void
  calculate: () => void
  reset: () => void
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  inputs: createDefaultInputs(),
  result: null,

  setInput: (key, value) => {
    set(state => ({ inputs: { ...state.inputs, [key]: value } }))
  },

  setMaterial: (material) => {
    set(state => ({
      inputs: {
        ...state.inputs,
        material,
        ...(material.avgPrice > 0 ? {} : {}),
      },
    }))
  },

  setPrinter: (printer) => {
    set(state => ({ inputs: { ...state.inputs, printer } }))
  },

  setMarketplace: (marketplace) => {
    set(state => ({ inputs: { ...state.inputs, marketplace } }))
  },

  calculate: () => {
    const { inputs } = get()
    const result = calculateCosts(inputs)
    set({ result })
  },

  reset: () => {
    set({ inputs: createDefaultInputs(), result: null })
  },
}))
