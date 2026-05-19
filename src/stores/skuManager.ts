import { create } from 'zustand'
import type { CalculationResult } from '@/types'

export interface SkuProduct {
  id: string
  name: string
  sku: string
  category: string
  tags: string[]
  dateCreated: number
  dateModified: number
  result: CalculationResult
  notes: string
  isFavorite: boolean
}

interface SkuManagerState {
  products: SkuProduct[]
  addProduct: (product: Omit<SkuProduct, 'id' | 'dateCreated' | 'dateModified'>) => void
  removeProduct: (id: string) => void
  updateProduct: (id: string, updates: Partial<SkuProduct>) => void
  toggleFavorite: (id: string) => void
  searchProducts: (query: string) => SkuProduct[]
  getProductsByCategory: (category: string) => SkuProduct[]
  getProductsByTag: (tag: string) => SkuProduct[]
  exportJson: () => string
}

const loadProducts = (): SkuProduct[] => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('open3dcalc_skus')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export const useSkuManager = create<SkuManagerState>((set, get) => ({
  products: loadProducts(),

  addProduct: (product) => {
    const now = Date.now()
    const newProduct: SkuProduct = {
      ...product,
      id: now.toString(36) + Math.random().toString(36).slice(2, 7),
      dateCreated: now,
      dateModified: now,
    }
    const products = [...get().products, newProduct]
    localStorage.setItem('open3dcalc_skus', JSON.stringify(products))
    set({ products })
  },

  removeProduct: (id) => {
    const products = get().products.filter(p => p.id !== id)
    localStorage.setItem('open3dcalc_skus', JSON.stringify(products))
    set({ products })
  },

  updateProduct: (id, updates) => {
    const products = get().products.map(p =>
      p.id === id ? { ...p, ...updates, dateModified: Date.now() } : p
    )
    localStorage.setItem('open3dcalc_skus', JSON.stringify(products))
    set({ products })
  },

  toggleFavorite: (id) => {
    const products = get().products.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite, dateModified: Date.now() } : p
    )
    localStorage.setItem('open3dcalc_skus', JSON.stringify(products))
    set({ products })
  },

  searchProducts: (query) => {
    const q = query.toLowerCase()
    return get().products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.notes.toLowerCase().includes(q)
    )
  },

  getProductsByCategory: (category) => {
    return get().products.filter(p => p.category.toLowerCase() === category.toLowerCase())
  },

  getProductsByTag: (tag) => {
    return get().products.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
  },

  exportJson: () => {
    return JSON.stringify(get().products, null, 2)
  },
}))
