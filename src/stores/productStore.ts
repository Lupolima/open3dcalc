import { create } from 'zustand'
import type { SavedProduct, CalculationResult, CalculationSnapshot } from '@/types'

const STORAGE_KEY = 'open3dcalc_products'

interface ProductState {
  products: SavedProduct[]
  load: () => void
  save: (name: string, result: CalculationResult, snapshot?: CalculationSnapshot) => void
  remove: (id: number) => void
  exportJson: () => string
}

const loadFromStorage = (): SavedProduct[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveToStorage = (products: SavedProduct[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  load: () => {
    set({ products: loadFromStorage() })
  },

  save: (name, result, snapshot) => {
    const product: SavedProduct = {
      id: Date.now(),
      name,
      date: new Date().toLocaleDateString('pt-BR'),
      result,
      snapshot,
    }
    const products = [...get().products, product]
    saveToStorage(products)
    set({ products })
  },

  remove: (id) => {
    const products = get().products.filter(p => p.id !== id)
    saveToStorage(products)
    set({ products })
  },

  exportJson: () => {
    return JSON.stringify(get().products, null, 2)
  },
}))
