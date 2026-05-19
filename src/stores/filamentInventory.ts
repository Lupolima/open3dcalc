import { create } from 'zustand'

export interface FilamentSpool {
  id: string
  brand: string
  material: string
  color: string
  weightGrams: number
  originalWeightGrams: number
  costPerKg: number
  diameterMm: number
  dateAdded: number
  notes: string
}

interface FilamentInventoryState {
  spools: FilamentSpool[]
  addSpool: (spool: Omit<FilamentSpool, 'id' | 'dateAdded'>) => void
  removeSpool: (id: string) => void
  updateSpool: (id: string, updates: Partial<FilamentSpool>) => void
  deductWeight: (id: string, grams: number) => void
  getTotalWeight: () => number
  getSpoolsByMaterial: (material: string) => FilamentSpool[]
  getLowStockSpools: (thresholdGrams: number) => FilamentSpool[]
}

const loadSpools = (): FilamentSpool[] => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('open3dcalc_filaments')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export const useFilamentInventory = create<FilamentInventoryState>((set, get) => ({
  spools: loadSpools(),

  addSpool: (spool) => {
    const newSpool: FilamentSpool = {
      ...spool,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      dateAdded: Date.now(),
    }
    const spools = [...get().spools, newSpool]
    localStorage.setItem('open3dcalc_filaments', JSON.stringify(spools))
    set({ spools })
  },

  removeSpool: (id) => {
    const spools = get().spools.filter(s => s.id !== id)
    localStorage.setItem('open3dcalc_filaments', JSON.stringify(spools))
    set({ spools })
  },

  updateSpool: (id, updates) => {
    const spools = get().spools.map(s => s.id === id ? { ...s, ...updates } : s)
    localStorage.setItem('open3dcalc_filaments', JSON.stringify(spools))
    set({ spools })
  },

  deductWeight: (id, grams) => {
    const spools = get().spools.map(s =>
      s.id === id ? { ...s, weightGrams: Math.max(0, s.weightGrams - grams) } : s
    )
    localStorage.setItem('open3dcalc_filaments', JSON.stringify(spools))
    set({ spools })
  },

  getTotalWeight: () => {
    return get().spools.reduce((sum, s) => sum + s.weightGrams, 0)
  },

  getSpoolsByMaterial: (material) => {
    return get().spools.filter(s => s.material.toLowerCase() === material.toLowerCase())
  },

  getLowStockSpools: (thresholdGrams) => {
    return get().spools.filter(s => s.weightGrams < thresholdGrams)
  },
}))
